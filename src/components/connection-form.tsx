import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ConnectionFormProps {
  jiraUrl: string
  email: string
  apiToken: string
  onJiraUrlChange: (value: string) => void
  onEmailChange: (value: string) => void
  onApiTokenChange: (value: string) => void
}

export function ConnectionForm({
  jiraUrl,
  email,
  apiToken,
  onJiraUrlChange,
  onEmailChange,
  onApiTokenChange,
}: ConnectionFormProps) {
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
            onChange={(e) => onJiraUrlChange(e.target.value)}
            placeholder="https://your-domain.atlassian.net"
            className="bg-input border-[rgba(255,255,255,0.15)] focus:border-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="your-email@company.com"
            className="bg-input border-[rgba(255,255,255,0.15)] focus:border-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiToken">API Token</Label>
          <Input
            id="apiToken"
            type="password"
            value={apiToken}
            onChange={(e) => onApiTokenChange(e.target.value)}
            placeholder="API Token จาก Atlassian"
            className="bg-input border-[rgba(255,255,255,0.15)] focus:border-ring"
            required
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
      </div>
    </section>
  )
}
