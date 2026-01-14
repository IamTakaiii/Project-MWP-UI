import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { LogEntry } from '@/types'

interface LogPanelProps {
  logs: LogEntry[]
  onClear: () => void
}

export function LogPanel({ logs, onClear }: LogPanelProps) {
  if (logs.length === 0) return null

  return (
    <div className="mt-8 bg-card backdrop-blur-xl border border-border rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-400">
      <div className="flex justify-between items-center px-6 py-4 bg-black/20 border-b border-border">
        <h3 className="text-base font-semibold text-foreground">
          📝 Log
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="bg-destructive/15 border border-destructive/30 text-destructive hover:bg-destructive/25"
        >
          ล้าง
        </Button>
      </div>

      <div className="max-h-[300px] overflow-y-auto p-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex gap-4 px-3 py-2.5 rounded-lg mb-2 last:mb-0 font-mono text-sm transition-colors hover:bg-white/5"
          >
            <span className="text-muted-foreground shrink-0">
              {log.timestamp}
            </span>
            <span
              className={cn(
                'break-words',
                log.type === 'success' && 'text-success',
                log.type === 'error' && 'text-destructive',
                log.type === 'info' && 'text-[#A5ADBA]'
              )}
            >
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
