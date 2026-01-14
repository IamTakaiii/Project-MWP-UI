import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { Plugin } from 'vite'

// Custom plugin to handle dynamic SSE proxy
function sseProxyPlugin(): Plugin {
  return {
    name: 'sse-proxy',
    configureServer(server) {
      console.log('[SSE Proxy] Middleware registered at /sse-proxy')
      server.middlewares.use('/sse-proxy', (req, res) => {
        // Wrap async handler to catch all errors
        ;(async () => {
          console.log(`[SSE Proxy] Request received: ${req.method} ${req.url}`)
          try {
          // Handle CORS preflight (OPTIONS) requests
          if (req.method === 'OPTIONS') {
            const origin = req.headers.origin
            if (origin) {
              res.setHeader('Access-Control-Allow-Origin', origin)
              res.setHeader('Access-Control-Allow-Credentials', 'true')
            } else {
              res.setHeader('Access-Control-Allow-Origin', '*')
            }
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', '*')
            res.setHeader('Access-Control-Max-Age', '86400')
            res.statusCode = 204
            res.end()
            return
          }

          // Extract target from path: /sse-proxy/{host}/{path}?{query}
          // Handle cases like:
          // - /sse-proxy/example.com/path?query=value
          // - /sse-proxy/example.com/?query=value
          // - /sse-proxy/example.com/path
          // - /sse-proxy/example.com/
          // Note: When using server.middlewares.use('/sse-proxy', ...), Vite strips the prefix
          // So req.url will be like: /demo.sherwepos.com/backend/... (without /sse-proxy prefix)
          const urlPath = req.url || ''
          console.log(`[SSE Proxy] Parsing URL: ${urlPath}`)
          
          // When middleware is mounted at '/sse-proxy', Vite strips that prefix from req.url
          // So we expect: /{host}/{path}?{query} (with leading slash, but no /sse-proxy)
          // Match pattern: /{host}/{rest} where host doesn't contain / or ?
          let pathMatch = urlPath.match(/^\/([^\/\?]+)(.*)$/)
          
          if (!pathMatch) {
            // Fallback: try with /sse-proxy prefix (in case it's not stripped)
            pathMatch = urlPath.match(/^\/sse-proxy\/([^\/\?]+)(.*)$/)
          }
          
          if (!pathMatch) {
            console.error(`[SSE Proxy] Failed to parse URL: ${urlPath}`)
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid proxy path', url: urlPath }))
            return
          }

          const [, host, rest] = pathMatch
          // rest contains the path and query string (e.g., "/path?query=value" or "/?query=value" or "/path" or "/" or "")
          // Ensure we have at least a slash if rest is empty
          const path = rest || '/'
          const targetUrl = `https://${host}${path}`
          
          console.log(`[SSE Proxy] Extracted - host: ${host}, path: ${path}, targetUrl: ${targetUrl}`)

          console.log(`[SSE Proxy] Proxying ${req.method || 'GET'} to: ${targetUrl}`)
          console.log(`[SSE Proxy] Original URL: ${req.url}`)
          console.log(`[SSE Proxy] Request headers:`, Object.keys(req.headers))
          
          // Log all custom headers that might contain cookies
          const allHeaders = Object.entries(req.headers)
          const customHeaders = allHeaders.filter(([key]) => 
            key.toLowerCase().startsWith('x-') || 
            key.toLowerCase().includes('cookie') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('auth')
          )
          console.log(`[SSE Proxy] Custom/auth headers found:`, customHeaders.map(([key]) => key))

          // Check for cookie in custom headers first (X-Cookie, X-Auth-Cookie, etc.)
          // Priority: X-Cookie > X-Auth-Cookie > X-Cookie-Header > Cookie (browser cookie)
          const customCookieHeaders = ['x-cookie', 'x-auth-cookie', 'x-cookie-header']
          let cookieValue: string | undefined = undefined
          let cookieSource = 'none'

          // First, check custom headers (X-Cookie, X-Auth-Cookie, etc.)
          for (const headerName of customCookieHeaders) {
            const headerValue = req.headers[headerName]
            if (headerValue) {
              cookieValue = typeof headerValue === 'string' ? headerValue : (Array.isArray(headerValue) ? headerValue[0] : undefined)
              if (cookieValue) {
                cookieSource = headerName
                console.log(`[SSE Proxy] Found cookie in custom header: ${headerName} (length: ${cookieValue.length})`)
                break
              }
            }
          }

          // Fallback to browser Cookie header if no custom header found
          if (!cookieValue && req.headers.cookie) {
            cookieValue = typeof req.headers.cookie === 'string' 
              ? req.headers.cookie 
              : (Array.isArray(req.headers.cookie) ? req.headers.cookie[0] : undefined)
            if (cookieValue) {
              cookieSource = 'cookie'
              console.log(`[SSE Proxy] Using Cookie header from browser (length: ${cookieValue.length})`)
              console.log(`[SSE Proxy] Cookie header value (first 100 chars):`, cookieValue.substring(0, 100))
            }
          }

          if (!cookieValue) {
            console.log(`[SSE Proxy] No cookie found in custom headers or browser`)
          } else {
            console.log(`[SSE Proxy] Cookie source: ${cookieSource}`)
          }

          // Build headers - forward most headers but filter out problematic ones
          const headers: Record<string, string> = {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
          }

          // Forward request headers (excluding problematic ones and custom cookie headers)
          // Note: We'll add Cookie header separately from custom header
          for (const [key, value] of Object.entries(req.headers)) {
            const lowerKey = key.toLowerCase()
            // Filter out headers that shouldn't be forwarded
            // Also exclude custom cookie headers (we'll use them to set Cookie header)
            if (!['host', 'connection', 'content-length', 'accept-encoding', 'transfer-encoding', 'upgrade', 'sec-websocket-key', 'sec-websocket-version', 'sec-websocket-extensions', ...customCookieHeaders].includes(lowerKey)) {
              if (typeof value === 'string') {
                headers[key] = value
              } else if (Array.isArray(value) && value.length > 0) {
                headers[key] = value[0]
              }
            }
          }

          // Set Cookie header from custom header or browser cookie
          if (cookieValue) {
            headers['Cookie'] = cookieValue
            console.log(`[SSE Proxy] Cookie header set from ${cookieSource} and will be forwarded to target`)
          }

          // Log headers being sent (hide sensitive values)
          const loggedHeaders = Object.fromEntries(
            Object.entries(headers).map(([k, v]) => {
              const lowerKey = k.toLowerCase()
              if (lowerKey.includes('token') || lowerKey.includes('secret') || lowerKey.includes('password') || lowerKey.includes('authorization') || lowerKey === 'cookie') {
                return [k, v ? `${String(v).substring(0, 20)}...` : '']
              }
              return [k, v]
            })
          )
          console.log(`[SSE Proxy] Forwarding headers:`, loggedHeaders)
          console.log(`[SSE Proxy] Cookie in headers:`, headers['Cookie'] ? 'Yes (hidden in log)' : 'No')
          
          // Log actual Cookie header value for debugging (first 100 chars only)
          if (headers['Cookie']) {
            console.log(`[SSE Proxy] Cookie header value (first 100 chars):`, String(headers['Cookie']).substring(0, 100))
          }

          // Forward request to target
          // Note: SSE uses GET requests, so no body handling needed
          // Include credentials to ensure cookies are sent
          const targetResponse = await fetch(targetUrl, {
            method: req.method || 'GET',
            headers,
            credentials: 'include', // Ensure cookies are sent with cross-origin requests
          })
          
          console.log(`[SSE Proxy] Target response status: ${targetResponse.status}`)

          // Set CORS headers
          // Allow credentials for cookie-based authentication
          // Note: When using credentials, we must specify the actual origin, not '*'
          const origin = req.headers.origin
          if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin)
            res.setHeader('Access-Control-Allow-Credentials', 'true')
          } else {
            res.setHeader('Access-Control-Allow-Origin', '*')
          }
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', '*')

          // Log response status
          console.log(`[SSE Proxy] Response status: ${targetResponse.status} ${targetResponse.statusText}`)
          console.log(`[SSE Proxy] Response headers:`, Object.fromEntries(targetResponse.headers.entries()))

          // Handle error responses
          if (!targetResponse.ok) {
            const errorText = await targetResponse.text().catch(() => 'Unknown error')
            console.error(`[SSE Proxy] Error ${targetResponse.status} from ${targetUrl}`)
            console.error(`[SSE Proxy] Error response:`, errorText.substring(0, 500))
            res.statusCode = targetResponse.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ 
              error: `Proxy error: ${targetResponse.status} ${targetResponse.statusText}`,
              message: errorText,
              targetUrl 
            }))
            return
          }

          // Set SSE headers for successful responses
          res.setHeader('Content-Type', 'text/event-stream')
          res.setHeader('Cache-Control', 'no-cache')
          res.setHeader('Connection', 'keep-alive')

          // Copy response headers (except encoding)
          targetResponse.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase()
            if (!['content-encoding', 'transfer-encoding'].includes(lowerKey)) {
              res.setHeader(key, value)
            }
          })

          res.statusCode = targetResponse.status

          // Stream response for SSE
          if (targetResponse.body) {
            const reader = targetResponse.body.getReader()
            
            const pump = async () => {
              try {
                while (true) {
                  const { done, value } = await reader.read()
                  if (done) {
                    if (!res.closed) {
                      res.end()
                    }
                    break
                  }
                  // Write chunk to response (check if connection is still open)
                  if (!res.closed) {
                    res.write(value)
                  } else {
                    reader.cancel()
                    break
                  }
                }
              } catch (err) {
                console.error('[SSE Proxy] Stream error:', err)
                if (!res.closed && !res.headersSent) {
                  res.statusCode = 500
                  res.end()
                } else if (!res.closed) {
                  res.end()
                }
                try {
                  reader.cancel()
                } catch {
                  // Ignore cancel errors
                }
              }
            }
            
            // Handle client disconnect
            req.on('close', () => {
              reader.cancel().catch(() => {})
            })
            
            pump()
          } else {
            const text = await targetResponse.text()
            res.end(text)
          }
        } catch (error) {
          console.error('[SSE Proxy] Error:', error)
          if (!res.headersSent) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ 
              error: 'Proxy error', 
              message: error instanceof Error ? error.message : 'Unknown error' 
            }))
          } else {
            res.end()
          }
        }
        })().catch((err) => {
          console.error('[SSE Proxy] Unhandled error in middleware:', err)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ 
              error: 'Internal server error', 
              message: err instanceof Error ? err.message : 'Unknown error' 
            }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), sseProxyPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
  },
})
