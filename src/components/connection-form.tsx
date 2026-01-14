import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'

interface LoginFormProps {
  onLoginSuccess?: () => void
}

export function ConnectionForm({ onLoginSuccess }: LoginFormProps) {
  const [jiraUrl, setJiraUrl] = useState('')
  const [email, setEmail] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.login({ jiraUrl, email, apiToken })
      // Clear sensitive data from state
      setApiToken('')
      onLoginSuccess?.()
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบ credentials'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleLogin()
  }

  return (
    <section className="mb-8 pb-8 border-b border-border">
      <h2 className="flex items-center gap-3 text-xl font-semibold text-foreground mb-6">
        <span className="text-2xl">🔐</span>
        การเชื่อมต่อ JIRA
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="jiraUrl">JIRA URL</Label>
          <Input
            id="jiraUrl"
            type="url"
            value={jiraUrl}
            onChange={(e) => setJiraUrl(e.target.value)}
            placeholder="https://your-domain.atlassian.net"
            className="bg-input border-[rgba(255,255,255,0.15)] focus:border-ring"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-email@company.com"
            className="bg-input border-[rgba(255,255,255,0.15)] focus:border-ring"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiToken">API Token</Label>
          <Input
            id="apiToken"
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="API Token จาก Atlassian"
            className="bg-input border-[rgba(255,255,255,0.15)] focus:border-ring"
            required
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            <a
              href="https://id.atlassian.com/manage-profile/security/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4C9AFF] hover:text-foreground hover:underline transition-colors"
            >
              สร้าง API Token ที่นี่
            </a>
          </p>
        </div>

        {error && (
          <div className="md:col-span-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md p-3">
            {error}
          </div>
        )}

        <div className="md:col-span-2">
          <Button type="button" onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </div>
      </div>
    </section>
  )
}
