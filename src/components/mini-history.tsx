import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { History, Clock, ExternalLink, CheckCircle2, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorklogHistory, formatTimeSpent } from '@/hooks/use-worklog-history'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

// Format time range from started time and duration
function formatTimeRange(started: string, timeSpentSeconds: number): string {
  const startDate = new Date(started)
  const endDate = new Date(startDate.getTime() + timeSpentSeconds * 1000)
  return `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`
}

interface MiniHistoryProps {
  className?: string
}

export function MiniHistory({ className }: MiniHistoryProps) {
  const navigate = useNavigate()
  const {
    dailyWorklogs,
    weekSummary,
    dateRange,
    isLoading,
    error,
    fetchHistory,
  } = useWorklogHistory()

  // Track expanded state for each day
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  // Auto-fetch on mount
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Handle day click - navigate to history page with date
  const handleDayClick = (date: string, e: React.MouseEvent) => {
    // If clicking on expand button, don't navigate
    const target = e.target as HTMLElement
    if (target.closest('.expand-button') || target.closest('.expand-text')) {
      return
    }
    
    navigate({
      to: '/history',
      search: (prev) => ({ ...prev, date }),
    })
  }

  // Toggle expand for a specific day
  const toggleExpand = (date: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedDays(prev => {
      const newSet = new Set(prev)
      if (newSet.has(date)) {
        newSet.delete(date)
      } else {
        newSet.add(date)
      }
      return newSet
    })
  }

  return (
    <div className={cn("bg-card backdrop-blur-xl border border-border rounded-2xl overflow-hidden flex flex-col", className)}>
      {/* Header */}
      <div className="p-5 border-b border-border bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-amber-400" />
            <h3 className="font-semibold text-base">ประวัติสัปดาห์นี้</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => fetchHistory()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {format(dateRange.start, 'd MMM', { locale: th })} - {format(dateRange.end, 'd MMM yyyy', { locale: th })}
        </p>
      </div>

      {/* Week Summary */}
      <div className="p-5 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">ชั่วโมงรวม</span>
          <span className={cn(
            "text-sm px-3 py-1 rounded-full font-medium",
            weekSummary.isComplete 
              ? "bg-emerald-500/20 text-emerald-400" 
              : "bg-amber-500/20 text-amber-400"
          )}>
            {weekSummary.completionPercent}%
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{weekSummary.hours}</span>
          <span className="text-muted-foreground text-base">ชม.</span>
          {weekSummary.minutes > 0 && (
            <>
              <span className="text-2xl font-semibold ml-2">{weekSummary.minutes}</span>
              <span className="text-muted-foreground text-base">นาที</span>
            </>
          )}
          <span className="text-muted-foreground text-sm ml-auto">/ 40 ชม.</span>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-black/30 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500",
              weekSummary.isComplete ? "bg-emerald-500" : "bg-primary"
            )}
            style={{ width: `${weekSummary.completionPercent}%` }}
          />
        </div>
      </div>

      {/* Daily List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {error ? (
          <div className="p-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3 opacity-50" />
            <p className="text-base text-muted-foreground">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => fetchHistory()} className="mt-3">
              ลองใหม่
            </Button>
          </div>
        ) : isLoading ? (
          <div className="p-10 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-base text-muted-foreground mt-3">กำลังโหลด...</p>
          </div>
        ) : dailyWorklogs.length === 0 ? (
          <div className="p-10 text-center">
            <Clock className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-base text-muted-foreground">ยังไม่มี worklog</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {dailyWorklogs.map((day) => {
              const isExpanded = expandedDays.has(day.date)
              const showAll = isExpanded || day.worklogs.length <= 3
              const displayedLogs = showAll ? day.worklogs : day.worklogs.slice(0, 3)
              
              return (
                <div 
                  key={day.date} 
                  className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={(e) => handleDayClick(day.date, e)}
                >
                  {/* Day header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {day.isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-400" />
                      )}
                      <span className="text-base font-medium">
                        {format(new Date(day.date), 'EEE d MMM', { locale: th })}
                      </span>
                    </div>
                    <span className={cn(
                      "text-sm font-mono px-2.5 py-1 rounded",
                      day.isComplete ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-muted-foreground"
                    )}>
                      {formatTimeSpent(day.totalSeconds)}
                    </span>
                  </div>
                  
                  {/* Worklogs for the day */}
                  <div className="space-y-2 ml-7">
                    {displayedLogs.map((log, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="text-primary font-mono truncate max-w-[90px]">
                          {log.issueKey}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground truncate flex-1">
                          {log.comment || 'ไม่มีหมายเหตุ'}
                        </span>
                        <span className="text-muted-foreground font-mono text-xs shrink-0">
                          {formatTimeRange(log.started, log.timeSpentSeconds)}
                        </span>
                      </div>
                    ))}
                    {day.worklogs.length > 3 && (
                      <button
                        onClick={(e) => toggleExpand(day.date, e)}
                        className="expand-button flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronDown className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          isExpanded && "rotate-180"
                        )} />
                        <span className="expand-text">
                          {isExpanded ? 'ซ่อน' : `+${day.worklogs.length - 3} รายการ`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-black/10 mt-auto">
        <Link 
          to="/history" 
          search={(prev) => ({ ...prev, date: undefined })}
        >
          <Button variant="ghost" className="w-full gap-2 text-sm h-10">
            <ExternalLink className="h-4 w-4" />
            ดูประวัติทั้งหมด
          </Button>
        </Link>
      </div>
    </div>
  )
}
