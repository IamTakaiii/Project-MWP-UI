import { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { 
  ArrowLeft, 
  Radio, 
  Trash2, 
  Download,
  Pause,
  Play,
  ChevronDown,
  ChevronRight,
  Wifi,
  WifiOff,
  Clock,
  Terminal,
  Star,
  X,
  Key,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Copy,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useSSE, type SSEEvent, type SSEAuthConfig } from '@/hooks/use-sse'
import { useLocalStorage } from '@/hooks'
import { cn } from '@/lib/utils'

// Helper to convert URL to use CORS proxy
function toProxyUrl(url: string, proxyBaseUrl?: string): string {
  try {
    const parsed = new URL(url)
    // Only proxy external URLs (not localhost)
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return url
    }
    
    // Use custom proxy base URL if provided, otherwise use default /sse-proxy/
    // Custom proxy URL example: http://192.168.1.100:5174/sse-proxy/
    if (proxyBaseUrl) {
      // Ensure proxyBaseUrl ends with /sse-proxy or /sse-proxy/
      const normalizedBase = proxyBaseUrl.endsWith('/') 
        ? proxyBaseUrl.slice(0, -1) 
        : proxyBaseUrl
      return `${normalizedBase}/${parsed.host}${parsed.pathname}${parsed.search}`
    }
    
    // Default: use relative path (works only in dev mode)
    // Convert: https://example.com/path → /sse-proxy/example.com/path
    return `/sse-proxy/${parsed.host}${parsed.pathname}${parsed.search}`
  } catch {
    return url
  }
}

// Check if URL is external
function isExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1'
  } catch {
    return false
  }
}

const DEFAULT_SSE_URL = 'http://localhost:3000/api/events'

// Preset endpoints
const PRESET_URLS = [
  { label: 'Events', url: 'http://localhost:3000/api/events' },
  { label: 'Logs', url: 'http://localhost:3000/api/logs/stream' },
  { label: 'Notifications', url: 'http://localhost:3000/api/notifications' },
]

type AuthType = 'none' | 'bearer' | 'basic' | 'apikey'

const AUTH_TYPE_OPTIONS: { value: AuthType; label: string }[] = [
  { value: 'none', label: 'No Auth' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'apikey', label: 'API Key' },
]

export function SSEMonitorPage() {
  const [url, setUrl] = useState('')
  const [inputUrl, setInputUrl] = useState(DEFAULT_SSE_URL)
  const [isPaused, setIsPaused] = useState(false)
  const [filter, setFilter] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [savedUrls, setSavedUrls] = useLocalStorage<string[]>('sse-saved-urls', [])
  const [showAuthPanel, setShowAuthPanel] = useState(false)
  const [useProxy, setUseProxy] = useLocalStorage('sse-use-proxy', false)
  const [proxyBaseUrl, setProxyBaseUrl] = useLocalStorage('sse-proxy-base-url', '')
  const [showProxySettings, setShowProxySettings] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auth state
  const [authType, setAuthType] = useLocalStorage<AuthType>('sse-auth-type', 'none')
  const [bearerToken, setBearerToken] = useLocalStorage('sse-bearer-token', '')
  const [basicUsername, setBasicUsername] = useLocalStorage('sse-basic-username', '')
  const [basicPassword, setBasicPassword] = useLocalStorage('sse-basic-password', '')
  const [apiKeyHeader, setApiKeyHeader] = useLocalStorage('sse-apikey-header', 'X-API-Key')
  const [apiKeyValue, setApiKeyValue] = useLocalStorage('sse-apikey-value', '')
  const [showSecrets, setShowSecrets] = useState(false)
  
  // Custom headers state
  const [showHeadersPanel, setShowHeadersPanel] = useState(false)
  const [customHeaders, setCustomHeaders] = useLocalStorage<Array<{ key: string; value: string }>>('sse-custom-headers', [])

  // Check if current URL is external (needs proxy)
  const isExternal = isExternalUrl(inputUrl)

  // Build auth config
  const authConfig: SSEAuthConfig = {
    type: authType,
    token: authType === 'bearer' ? bearerToken : authType === 'apikey' ? apiKeyValue : undefined,
    username: authType === 'basic' ? basicUsername : undefined,
    password: authType === 'basic' ? basicPassword : undefined,
    headerName: authType === 'apikey' ? apiKeyHeader : undefined,
  }

  // Build custom headers object
  const headersObject: Record<string, string> = {}
  customHeaders.forEach(({ key, value }) => {
    if (key.trim() && value.trim()) {
      headersObject[key.trim()] = value.trim()
    }
  })

  const { 
    events, 
    isConnected, 
    error, 
    connectionTime,
    connect, 
    disconnect, 
    clearEvents 
  } = useSSE(url, { 
    auth: authConfig,
    headers: Object.keys(headersObject).length > 0 ? headersObject : undefined
  })

  // Auto-scroll to bottom
  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events, isPaused])

  // Filter events
  const filteredEvents = filter 
    ? events.filter(e => 
        e.type.toLowerCase().includes(filter.toLowerCase()) ||
        e.raw.toLowerCase().includes(filter.toLowerCase())
      )
    : events

  const handleConnect = () => {
    if (!inputUrl.trim()) return
    
    // Save URL if not already saved
    if (!savedUrls.includes(inputUrl)) {
      setSavedUrls([inputUrl, ...savedUrls.slice(0, 9)]) // Keep last 10
    }
    
    // Use proxy for external URLs if enabled
    const finalUrl = useProxy && isExternal ? toProxyUrl(inputUrl, proxyBaseUrl || undefined) : inputUrl
    setUrl(finalUrl)
    // Need to trigger connect after url state updates
    setTimeout(() => connect(), 50)
  }

  const handleSelectUrl = (selectedUrl: string) => {
    setInputUrl(selectedUrl)
  }

  const handleRemoveSavedUrl = (urlToRemove: string) => {
    setSavedUrls(savedUrls.filter(u => u !== urlToRemove))
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const exportEvents = () => {
    const data = JSON.stringify(events, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const exportUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = exportUrl
    a.download = `sse-events-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(exportUrl)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isConnected) {
      handleConnect()
    }
  }

  const clearAuth = () => {
    setAuthType('none')
    setBearerToken('')
    setBasicUsername('')
    setBasicPassword('')
    setApiKeyHeader('X-API-Key')
    setApiKeyValue('')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20">
                  <Terminal className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">SSE Monitor</h1>
                  <p className="text-sm text-muted-foreground">
                    Real-time Server-Sent Events viewer
                  </p>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
              isConnected 
                ? "bg-emerald-500/20 text-emerald-400" 
                : "bg-gray-500/20 text-gray-400"
            )}>
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm font-medium">Connected</span>
                  {authType !== 'none' && <Lock className="h-3 w-3" />}
                  <span className="animate-pulse text-emerald-400">●</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm font-medium">Disconnected</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Connection Bar */}
      <div className="border-b border-white/10 bg-black/10">
        <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-3">
          {/* URL Input Row */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              SSE Endpoint:
            </span>
            <Input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="http://localhost:3000/api/events"
              className="flex-1 bg-black/30 border-white/20 font-mono text-sm"
              disabled={isConnected}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAuthPanel(!showAuthPanel)}
              disabled={isConnected}
              className={cn(
                "border-white/20",
                authType !== 'none' && "border-amber-500/50 text-amber-400",
                showAuthPanel && "bg-white/10"
              )}
              title="Authentication Settings"
            >
              <Key className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowHeadersPanel(!showHeadersPanel)}
              disabled={isConnected}
              className={cn(
                "border-white/20",
                customHeaders.length > 0 && "border-blue-500/50 text-blue-400",
                showHeadersPanel && "bg-white/10"
              )}
              title="Custom Headers"
            >
              <Shield className="h-4 w-4" />
            </Button>
            {isConnected ? (
              <Button 
                variant="destructive" 
                onClick={disconnect}
                className="gap-2"
              >
                <WifiOff className="h-4 w-4" />
                Disconnect
              </Button>
            ) : (
              <Button 
                onClick={handleConnect}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                disabled={!inputUrl.trim()}
              >
                <Wifi className="h-4 w-4" />
                Connect
              </Button>
            )}
          </div>

          {/* CORS Proxy Option - Show for external URLs */}
          {isExternal && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="use-proxy"
                      checked={useProxy}
                      onCheckedChange={(checked) => setUseProxy(checked === true)}
                      disabled={isConnected}
                    />
                    <Label 
                      htmlFor="use-proxy" 
                      className="text-sm font-medium cursor-pointer"
                    >
                      Use CORS Proxy
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    🔄 เปิดใช้ proxy เพื่อหลีก CORS สำหรับ external URLs
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {useProxy && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                      Proxy Active
                    </span>
                  )}
                  {useProxy && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowProxySettings(!showProxySettings)}
                      disabled={isConnected}
                      className="text-xs h-7"
                    >
                      {showProxySettings ? 'Hide' : 'Settings'}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Proxy Settings Panel */}
              {useProxy && showProxySettings && (
                <div className="pl-8 space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Proxy Base URL (เว้นว่างเพื่อใช้ dev server local)
                  </Label>
                  <Input
                    value={proxyBaseUrl}
                    onChange={(e) => setProxyBaseUrl(e.target.value)}
                    placeholder="http://192.168.1.x:5174/sse-proxy"
                    className="bg-black/30 border-white/20 font-mono text-sm"
                    disabled={isConnected}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 ตั้งค่า proxy URL สำหรับเชื่อมต่อกับ backend local เมื่อ deploy บน server แล้ว
                    <br />
                    ตัวอย่าง: <code className="bg-black/30 px-1 rounded">http://192.168.1.100:5174/sse-proxy</code>
                  </p>
                  {proxyBaseUrl && (
                    <div className="text-xs text-cyan-400 p-2 rounded bg-cyan-500/10">
                      📡 จะใช้ proxy: {proxyBaseUrl}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Auth Panel */}
          {showAuthPanel && (
            <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span className="font-medium">Authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="gap-1 text-xs"
                  >
                    {showSecrets ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {showSecrets ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAuth}
                    className="text-xs text-muted-foreground"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Auth Type Selector */}
              <div className="flex items-center gap-2">
                {AUTH_TYPE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => setAuthType(option.value)}
                    disabled={isConnected}
                    className={cn(
                      "h-8",
                      authType === option.value && "bg-white/10 text-emerald-400"
                    )}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              {/* Auth Fields based on type */}
              {authType === 'bearer' && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Bearer Token</Label>
                  <Input
                    type={showSecrets ? 'text' : 'password'}
                    value={bearerToken}
                    onChange={(e) => setBearerToken(e.target.value)}
                    placeholder="Enter your bearer token"
                    className="bg-black/30 border-white/20 font-mono text-sm"
                    disabled={isConnected}
                  />
                </div>
              )}

              {authType === 'basic' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Username</Label>
                    <Input
                      value={basicUsername}
                      onChange={(e) => setBasicUsername(e.target.value)}
                      placeholder="Username"
                      className="bg-black/30 border-white/20 text-sm"
                      disabled={isConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Password</Label>
                    <Input
                      type={showSecrets ? 'text' : 'password'}
                      value={basicPassword}
                      onChange={(e) => setBasicPassword(e.target.value)}
                      placeholder="Password"
                      className="bg-black/30 border-white/20 text-sm"
                      disabled={isConnected}
                    />
                  </div>
                </div>
              )}

              {authType === 'apikey' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Header Name</Label>
                    <Input
                      value={apiKeyHeader}
                      onChange={(e) => setApiKeyHeader(e.target.value)}
                      placeholder="X-API-Key"
                      className="bg-black/30 border-white/20 font-mono text-sm"
                      disabled={isConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">API Key Value</Label>
                    <Input
                      type={showSecrets ? 'text' : 'password'}
                      value={apiKeyValue}
                      onChange={(e) => setApiKeyValue(e.target.value)}
                      placeholder="Your API key"
                      className="bg-black/30 border-white/20 font-mono text-sm"
                      disabled={isConnected}
                    />
                  </div>
                </div>
              )}

              {authType !== 'none' && (
                <p className="text-xs text-muted-foreground">
                  💡 Credentials are saved in localStorage for convenience
                </p>
              )}
            </div>
          )}

          {/* Custom Headers Panel */}
          {showHeadersPanel && (
            <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="font-medium">Custom Headers</span>
                  {customHeaders.length > 0 && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                      {customHeaders.length} header{customHeaders.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCustomHeaders([...customHeaders, { key: '', value: '' }])
                    }}
                    disabled={isConnected}
                    className="text-xs"
                  >
                    + Add Header
                  </Button>
                  {customHeaders.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomHeaders([])}
                      disabled={isConnected}
                      className="text-xs text-muted-foreground"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>

              {customHeaders.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No custom headers added. Click "+ Add Header" to add one.
                </p>
              ) : (
                <div className="space-y-3">
                  {customHeaders.map((header, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <Input
                        value={header.key}
                        onChange={(e) => {
                          const updated = [...customHeaders]
                          updated[index].key = e.target.value
                          setCustomHeaders(updated)
                        }}
                        placeholder="Header name (e.g., X-Custom-Header)"
                        className="bg-black/30 border-white/20 font-mono text-sm"
                        disabled={isConnected}
                      />
                      <Input
                        type={showSecrets ? 'text' : header.key.toLowerCase().includes('token') || header.key.toLowerCase().includes('secret') || header.key.toLowerCase().includes('password') ? 'password' : 'text'}
                        value={header.value}
                        onChange={(e) => {
                          const updated = [...customHeaders]
                          updated[index].value = e.target.value
                          setCustomHeaders(updated)
                        }}
                        placeholder="Header value"
                        className="bg-black/30 border-white/20 font-mono text-sm"
                        disabled={isConnected}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCustomHeaders(customHeaders.filter((_, i) => i !== index))
                        }}
                        disabled={isConnected}
                        className="h-9 w-9 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {customHeaders.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  💡 Headers are saved in localStorage. Headers with "token", "secret", or "password" in the name will be hidden.
                </p>
              )}
            </div>
          )}

          {/* Quick Presets & Saved URLs */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="h-3 w-3" />
              Quick:
            </span>
            {PRESET_URLS.map((preset) => (
              <Button
                key={preset.url}
                variant="ghost"
                size="sm"
                onClick={() => handleSelectUrl(preset.url)}
                disabled={isConnected}
                className={cn(
                  "h-7 text-xs",
                  inputUrl === preset.url && "bg-white/10 text-emerald-400"
                )}
              >
                {preset.label}
              </Button>
            ))}
            
            {savedUrls.length > 0 && (
              <>
                <span className="text-white/20">|</span>
                <span className="text-xs text-muted-foreground">Recent:</span>
                {savedUrls.slice(0, 3).map((savedUrl) => (
                  <div key={savedUrl} className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectUrl(savedUrl)}
                      disabled={isConnected}
                      className={cn(
                        "h-7 text-xs font-mono truncate max-w-[180px]",
                        inputUrl === savedUrl && "bg-white/10 text-emerald-400"
                      )}
                    >
                      {(() => {
                        try {
                          return new URL(savedUrl).pathname
                        } catch {
                          return savedUrl.slice(0, 30)
                        }
                      })()}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSavedUrl(savedUrl)}
                      className="h-6 w-6 opacity-50 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-destructive flex items-center gap-2">
              <span>⚠️</span> {error}
            </p>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-white/10 bg-black/5">
        <div className="max-w-[1400px] mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter events..."
                className="w-64 bg-black/20 border-white/10 text-sm h-8"
              />
              <span className="text-sm text-muted-foreground">
                {filteredEvents.length} / {events.length} events
              </span>
            </div>
            <div className="flex items-center gap-2">
              {connectionTime && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 mr-2">
                  <Clock className="h-3 w-3" />
                  Since {connectionTime.toLocaleTimeString()}
                </span>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className={cn(
                  "gap-1",
                  isPaused && "text-amber-400 bg-amber-400/10"
                )}
                title={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    <span className="text-xs">Paused</span>
                  </>
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={exportEvents}
                disabled={events.length === 0}
                title="Export as JSON"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearEvents}
                disabled={events.length === 0}
                title="Clear all events"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Events List - Terminal Style */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-[#0a0a0f]"
      >
        <div className="max-w-[1400px] mx-auto font-mono text-sm">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Radio className="h-12 w-12 mb-4 opacity-30" />
              <p>No events received yet</p>
              <p className="text-xs mt-1">
                {isConnected 
                  ? 'Waiting for server events...' 
                  : 'Enter an SSE endpoint URL and click Connect'
                }
              </p>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <EventRow 
                key={event.id} 
                event={event} 
                index={index}
                isExpanded={expandedIds.has(event.id)}
                onToggle={() => toggleExpand(event.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 py-2 px-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            {isConnected ? `Connected to: ${url.includes('/sse-proxy') ? inputUrl : url}` : 'Not connected'}
            {isConnected && url.includes('/sse-proxy') && (
              <span className="flex items-center gap-1 text-cyan-400">
                <Shield className="h-3 w-3" />
                {proxyBaseUrl ? 'via custom proxy' : 'via proxy'}
              </span>
            )}
            {isConnected && authType !== 'none' && (
              <span className="flex items-center gap-1 text-amber-400">
                <Lock className="h-3 w-3" />
                {authType}
              </span>
            )}
            {isConnected && customHeaders.length > 0 && (
              <span className="flex items-center gap-1 text-blue-400">
                <Shield className="h-3 w-3" />
                {customHeaders.length} header{customHeaders.length > 1 ? 's' : ''}
              </span>
            )}
          </span>
          <span>
            Press Enter to connect • 🔑 Auth • 🛡️ Headers • 🌐 CORS proxy
          </span>
        </div>
      </footer>
    </div>
  )
}

// Event Row Component
interface EventRowProps {
  event: SSEEvent
  index: number
  isExpanded: boolean
  onToggle: () => void
}

function EventRow({ event, index, isExpanded, onToggle }: EventRowProps) {
  const typeColor = getTypeColor(event.type)
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    const textToCopy = typeof event.data === 'object'
      ? JSON.stringify(event.data, null, 2)
      : event.raw
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  return (
    <div className={cn(
      "border-b border-white/5 hover:bg-white/5 transition-colors",
      event.type === 'error' && "bg-red-500/5",
      event.type === 'connected' && "bg-emerald-500/5",
      event.type === 'disconnected' && "bg-gray-500/5"
    )}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-2 flex items-center gap-3 text-left"
      >
        {/* Index */}
        <span className="text-gray-600 w-12 text-right shrink-0">
          {String(index + 1).padStart(4, '0')}
        </span>
        
        {/* Timestamp */}
        <span className="text-gray-500 w-20 shrink-0">
          {event.timestamp.toLocaleTimeString()}
        </span>
        
        {/* Type Badge */}
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-medium shrink-0 min-w-[80px] text-center",
          typeColor
        )}>
          {event.type}
        </span>
        
        {/* Preview */}
        <span className="flex-1 text-gray-300 truncate">
          {typeof event.data === 'object' 
            ? JSON.stringify(event.data).slice(0, 150)
            : String(event.data).slice(0, 150)
          }
        </span>
        
        {/* Expand Icon */}
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />
        )}
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-3 ml-12">
          <div className="relative group">
            <div className="absolute top-2 right-2 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 bg-black/50 hover:bg-black/70 text-gray-300 hover:text-white"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    <span className="text-xs">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3 rounded-lg bg-black/50 text-emerald-400 overflow-x-auto text-xs leading-relaxed">
              {typeof event.data === 'object'
                ? JSON.stringify(event.data, null, 2)
                : event.raw
              }
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to get color based on event type
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    message: 'bg-blue-500/20 text-blue-400',
    error: 'bg-red-500/20 text-red-400',
    warning: 'bg-amber-500/20 text-amber-400',
    success: 'bg-emerald-500/20 text-emerald-400',
    heartbeat: 'bg-gray-500/20 text-gray-400',
    connected: 'bg-emerald-500/20 text-emerald-400',
    disconnected: 'bg-orange-500/20 text-orange-400',
    ping: 'bg-cyan-500/20 text-cyan-400',
    notification: 'bg-purple-500/20 text-purple-400',
    log: 'bg-indigo-500/20 text-indigo-400',
    debug: 'bg-gray-500/20 text-gray-400',
    info: 'bg-blue-500/20 text-blue-400',
    warn: 'bg-amber-500/20 text-amber-400',
  }
  return colors[type.toLowerCase()] || 'bg-violet-500/20 text-violet-400'
}
