import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  Calendar,
  CalendarDays,
  Pencil,
  Trash2,
  Plus
} from 'lucide-react'
import { format, subDays } from 'date-fns'
import { th } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { jiraService, type WorklogEntry, type DailyWorklog } from '@/services'
import { authService } from '@/services/auth.service'
import { WorklogDialog, DeleteConfirmDialog, type WorklogFormData } from '@/components/worklog-dialog'
import { cn } from '@/lib/utils'

const EIGHT_HOURS_SECONDS = 8 * 60 * 60

type ViewMode = 'daily' | 'weekly'

function formatTimeSpent(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function formatTimeRange(started: string, timeSpentSeconds: number): string {
  const startDate = new Date(started)
  const endDate = new Date(startDate.getTime() + timeSpentSeconds * 1000)
  return `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`
}

export function HistoryPage() {
  // Session state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [jiraUrl, setJiraUrl] = useState('')

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('daily')

  // Date filter state
  const today = format(new Date(), 'yyyy-MM-dd')
  const weekAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')
  const [startDate, setStartDate] = useState(weekAgo)
  const [endDate, setEndDate] = useState(today)

  // Data state
  const [worklogs, setWorklogs] = useState<WorklogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Current day/week navigation
  const [currentDayIndex, setCurrentDayIndex] = useState(0)

  // Dialog state
  const [isWorklogDialogOpen, setIsWorklogDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedWorklog, setSelectedWorklog] = useState<WorklogEntry | null>(null)

  // Group worklogs by date
  const dailyWorklogs = useMemo((): DailyWorklog[] => {
    const grouped: Record<string, WorklogEntry[]> = {}

    for (const worklog of worklogs) {
      const date = worklog.started.split('T')[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(worklog)
    }

    return Object.entries(grouped)
      .map(([date, logs]) => {
        const totalSeconds = logs.reduce((sum, log) => sum + log.timeSpentSeconds, 0)
        return {
          date,
          dayName: format(new Date(date), 'EEEE', { locale: th }),
          worklogs: logs.sort((a, b) => new Date(a.started).getTime() - new Date(b.started).getTime()),
          totalSeconds,
          isComplete: totalSeconds >= EIGHT_HOURS_SECONDS,
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date)) // Sort ascending (oldest first)
  }, [worklogs])

  // Weekly summary - target is based on number of days with worklogs
  const weeklySummary = useMemo(() => {
    const totalSeconds = worklogs.reduce((sum, log) => sum + log.timeSpentSeconds, 0)
    const daysWorked = dailyWorklogs.length
    const targetSeconds = daysWorked * EIGHT_HOURS_SECONDS
    return {
      totalSeconds,
      targetSeconds,
      isComplete: totalSeconds >= targetSeconds,
      daysWorked,
      completeDays: dailyWorklogs.filter(d => d.isComplete).length,
      targetHours: daysWorked * 8,
    }
  }, [worklogs, dailyWorklogs])

  // Current day data (for daily view)
  const currentDay = dailyWorklogs[currentDayIndex]
  const totalDays = dailyWorklogs.length

  // Validation
  const isDateRangeValid = startDate <= endDate
  const dateError = !isDateRangeValid ? 'วันที่เริ่มต้นต้องน้อยกว่าหรือเท่ากับวันที่สิ้นสุด' : null

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true)
      try {
        const session = await authService.getCurrentSession()
        setIsAuthenticated(session.authenticated)
        if (session.authenticated && session.jiraUrl) {
          setJiraUrl(session.jiraUrl)
        }
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [])

  // Fetch worklogs
  const fetchData = async () => {
    if (!isAuthenticated) {
      setError('กรุณาเข้าสู่ระบบก่อน')
      return
    }

    if (!isDateRangeValid) {
      setError('วันที่เริ่มต้นต้องน้อยกว่าหรือเท่ากับวันที่สิ้นสุด')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await jiraService.fetchWorklogHistory(startDate, endDate)
      setWorklogs(data.worklogs || [])
      setCurrentDayIndex(0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setWorklogs([])
    } finally {
      setIsLoading(false)
    }
  }

  // Auto fetch on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      fetchData()
    }
  }, [isAuthenticated, isCheckingAuth])

  // Navigation handlers (now correct: index 0 = oldest day)
  const goToPreviousDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(prev => prev - 1)
    }
  }

  const goToNextDay = () => {
    if (currentDayIndex < totalDays - 1) {
      setCurrentDayIndex(prev => prev + 1)
    }
  }

  // Dialog handlers
  // const openCreateDialog = () => {
  //   setSelectedWorklog(null)
  //   setIsWorklogDialogOpen(true)
  // }

  const openEditDialog = (worklog: WorklogEntry) => {
    setSelectedWorklog(worklog)
    setIsWorklogDialogOpen(true)
  }

  const openDeleteDialog = (worklog: WorklogEntry) => {
    setSelectedWorklog(worklog)
    setIsDeleteDialogOpen(true)
  }

  // Save worklog (create or update)
  const handleSaveWorklog = useCallback(async (formData: WorklogFormData) => {
    const started = `${formData.date}T${formData.startTime}:00.000+0700`
    
    if (selectedWorklog) {
      // Update existing
      await jiraService.updateWorklog(
        selectedWorklog.issueKey,
        selectedWorklog.id,
        {
          timeSpent: formData.timeSpent,
          started,
          comment: formData.comment,
        }
      )
    } else {
      // Create new
      await jiraService.createWorklog(
        formData.issueKey,
        {
          timeSpent: formData.timeSpent,
          started,
          comment: formData.comment,
        }
      )
    }
    
    // Refresh data
    await fetchData()
  }, [selectedWorklog])

  // Delete worklog
  const handleDeleteWorklog = useCallback(async () => {
    if (!selectedWorklog) return
    
    await jiraService.deleteWorklog(
      selectedWorklog.issueKey,
      selectedWorklog.id
    )
    
    // Refresh data
    await fetchData()
  }, [selectedWorklog])

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  📊 Worklog History
                </h1>
                <p className="text-[#A5ADBA] mt-1">
                  ดูประวัติการลง worklog ของคุณ
                </p>
              </div>
            </div>
            {isAuthenticated && (
              <Link to="/worklog">
                <Button className="bg-success hover:bg-success/90 gap-2">
                  <Plus className="h-4 w-4" />
                  เพิ่ม Worklog
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Date Filter Card */}
        <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">ตัวกรองวันที่</h2>
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('daily')}
                className={cn(
                  'gap-2 rounded-md',
                  viewMode === 'daily' && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                )}
              >
                <Calendar className="h-4 w-4" />
                รายวัน
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('weekly')}
                className={cn(
                  'gap-2 rounded-md',
                  viewMode === 'weekly' && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                )}
              >
                <CalendarDays className="h-4 w-4" />
                รายสัปดาห์
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm text-muted-foreground">
                วันที่เริ่มต้น (Start Date)
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
                className={cn(
                  "w-[180px] bg-black/30 border-white/20 focus:border-primary",
                  !isDateRangeValid && "border-destructive focus:border-destructive"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm text-muted-foreground">
                วันที่สิ้นสุด (End Date)
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className={cn(
                  "w-[180px] bg-black/30 border-white/20 focus:border-primary",
                  !isDateRangeValid && "border-destructive focus:border-destructive"
                )}
              />
            </div>
            <Button
              onClick={fetchData}
              disabled={isLoading || !isAuthenticated || !isDateRangeValid}
              className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? 'กำลังค้นหา...' : 'Fetch Data'}
            </Button>
          </div>
          {/* Date validation error */}
          {dateError && (
            <p className="mt-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {dateError}
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive">
            <p className="font-medium">❌ เกิดข้อผิดพลาด</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* No Credentials */}
        {!isAuthenticated && !isCheckingAuth && (
          <div className="text-center py-12 bg-card/50 border border-white/10 rounded-2xl">
            <p className="text-muted-foreground mb-4">
              กรุณากรอก JIRA credentials ที่หน้า Worklog ก่อน
            </p>
            <Link to="/">
              <Button>ไปหน้า Worklog</Button>
            </Link>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-muted-foreground">กำลังโหลด...</p>
          </div>
        )}

        {/* No Data */}
        {!isLoading && isAuthenticated && dailyWorklogs.length === 0 && !error && (
          <div className="text-center py-12 bg-card/50 border border-white/10 rounded-2xl">
            <p className="text-muted-foreground">ไม่พบ worklog ในช่วงวันที่เลือก</p>
          </div>
        )}

        {/* Weekly View */}
        {!isLoading && viewMode === 'weekly' && dailyWorklogs.length > 0 && (
          <>
            {/* Weekly Summary Banner */}
            {weeklySummary.isComplete ? (
              <div className="mb-6 p-5 rounded-2xl border bg-success/10 border-success/30">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                    <div>
                      <p className="text-lg font-semibold text-success">
                        ✅ ครบ {weeklySummary.targetHours} ชั่วโมงแล้ว!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {weeklySummary.completeDays} / {weeklySummary.daysWorked} วันที่ครบ 8 ชม.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-3 bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-success w-full" />
                    </div>
                    <span className="text-sm font-medium text-success">100%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-6 rounded-2xl border-2 border-dashed border-orange-500/50 bg-gradient-to-r from-orange-500/15 via-red-500/15 to-orange-500/15">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <AlertCircle className="h-10 w-10 text-orange-400 animate-pulse" />
                      <span className="absolute -top-1 -right-1 text-xl">⚠️</span>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-orange-300">
                        🚨 ยังไม่ครบ {weeklySummary.targetHours} ชั่วโมง!
                      </p>
                      <p className="text-muted-foreground">
                        {weeklySummary.completeDays} / {weeklySummary.daysWorked} วันที่ครบ 8 ชม.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-black/30 px-3 py-1.5 rounded-lg text-sm">
                        ลงไปแล้ว: <span className="font-bold text-orange-400">{formatTimeSpent(weeklySummary.totalSeconds)}</span>
                      </span>
                      <span>→</span>
                      <span className="bg-red-500/20 px-3 py-1.5 rounded-lg text-sm border border-red-500/30">
                        ยังเหลือ: <span className="font-bold text-red-400">{formatTimeSpent(Math.max(0, weeklySummary.targetSeconds - weeklySummary.totalSeconds))}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-40 h-3 bg-black/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, (weeklySummary.totalSeconds / weeklySummary.targetSeconds) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-orange-400">
                        {Math.round((weeklySummary.totalSeconds / weeklySummary.targetSeconds) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Days Cards */}
            <div className="space-y-4">
              {dailyWorklogs.map((day) => (
                <DayCard 
                  key={day.date} 
                  day={day} 
                  jiraUrl={jiraUrl}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                />
              ))}
            </div>
          </>
        )}

        {/* Daily View - Day Card with Navigation */}
        {!isLoading && viewMode === 'daily' && currentDay && (
          <div className={cn(
            'bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden',
            currentDay.isComplete 
              ? 'border border-white/10' 
              : 'border-2 border-orange-500/50'
          )}>
            {/* Day Header */}
            <div className={cn(
              'p-5 border-b',
              currentDay.isComplete 
                ? 'bg-success/10 border-white/10' 
                : 'bg-gradient-to-r from-orange-500/20 via-red-500/15 to-orange-500/20 border-orange-500/30'
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    วันที่: {format(new Date(currentDay.date), 'dd/MM/yyyy')}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(currentDay.date), 'EEEE', { locale: th })}
                  </p>
                </div>
                {currentDay.isComplete ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="font-semibold text-success">ครบ 8 ชม.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-orange-500/20 px-4 py-2 rounded-xl border border-orange-500/40">
                    <span className="text-xl animate-pulse">🚨</span>
                    <AlertCircle className="h-5 w-5 text-orange-400 animate-bounce" />
                    <div className="text-right">
                      <p className="font-bold text-orange-300">ยังไม่ครบ 8 ชม.!</p>
                      <p className="text-xs text-orange-400/80">
                        เหลืออีก {formatTimeSpent(EIGHT_HOURS_SECONDS - currentDay.totalSeconds)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary & Navigation */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <p className="text-sm">
                  รวมเวลาวันนี้: <span className={cn(
                    'font-semibold',
                    currentDay.isComplete ? 'text-success' : 'text-orange-400'
                  )}>{formatTimeSpent(currentDay.totalSeconds)}</span> / 8h
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    ทั้งหมด {currentDay.worklogs.length} รายการ
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousDay}
                    disabled={currentDayIndex <= 0}
                    className="gap-1 border-white/20 hover:bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    วันก่อนหน้า
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    ({currentDayIndex + 1} / {totalDays})
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextDay}
                    disabled={currentDayIndex >= totalDays - 1}
                    className="gap-1 border-white/20 hover:bg-white/10"
                  >
                    วันถัดไป
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Worklog Table */}
            <div className="p-5">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="w-[100px]">Issue Key</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead className="w-[130px]">From - To</TableHead>
                    <TableHead className="w-[80px] text-right">Time</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentDay.worklogs.map((worklog) => (
                    <TableRow key={worklog.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-mono font-semibold text-[#4C9AFF]">
                        <a 
                          href={`${jiraUrl}/browse/${worklog.issueKey}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {worklog.issueKey}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{worklog.issueSummary}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[150px] truncate">
                        {worklog.comment || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTimeRange(worklog.started, worklog.timeSpentSeconds)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {worklog.timeSpent}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(worklog)}
                            className="h-8 w-8 hover:bg-white/10 hover:text-[#4C9AFF]"
                            title="แก้ไข"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(worklog)}
                            className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                            title="ลบ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-8 py-4">
          <p className="text-sm text-muted-foreground">
            🔒 ข้อมูล credentials ถูกเก็บไว้ใน session ที่ปลอดภัย
          </p>
        </footer>
      </div>

      {/* Dialogs */}
      <WorklogDialog
        isOpen={isWorklogDialogOpen}
        onClose={() => {
          setIsWorklogDialogOpen(false)
          setSelectedWorklog(null)
        }}
        onSave={handleSaveWorklog}
        worklog={selectedWorklog}
        issueSummary={selectedWorklog?.issueSummary}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedWorklog(null)
        }}
        onConfirm={handleDeleteWorklog}
        worklog={selectedWorklog}
      />
    </div>
  )
}

// Component สำหรับแสดงการ์ดแต่ละวัน (Weekly View)
interface DayCardProps {
  day: DailyWorklog
  jiraUrl: string
  onEdit: (worklog: WorklogEntry) => void
  onDelete: (worklog: WorklogEntry) => void
}

function DayCard({ day, jiraUrl, onEdit, onDelete }: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={cn(
      'bg-card/50 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all',
      day.isComplete ? 'border-success/30' : 'border-white/10'
    )}>
      {/* Day Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full p-4 flex items-center justify-between text-left transition-colors',
          day.isComplete ? 'bg-success/10 hover:bg-success/15' : 'bg-black/20 hover:bg-black/30'
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg',
            day.isComplete ? 'bg-success/20 text-success' : 'bg-white/10 text-muted-foreground'
          )}>
            {format(new Date(day.date), 'd')}
          </div>
          <div>
            <p className="font-semibold">
              {format(new Date(day.date), 'EEEE', { locale: th })}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(day.date), 'd MMMM yyyy', { locale: th })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {day.worklogs.length} รายการ
          </span>
          <span className={cn(
            'font-semibold',
            day.isComplete ? 'text-success' : 'text-warning'
          )}>
            {formatTimeSpent(day.totalSeconds)}
          </span>
          {day.isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <AlertCircle className="h-5 w-5 text-warning" />
          )}
          <ChevronRight className={cn(
            'h-5 w-5 text-muted-foreground transition-transform',
            isExpanded && 'rotate-90'
          )} />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 border-t border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="w-[100px]">Issue</TableHead>
                <TableHead>Task</TableHead>
                <TableHead className="w-[120px]">เวลา</TableHead>
                <TableHead className="w-[70px] text-right">ระยะเวลา</TableHead>
                <TableHead className="w-[90px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {day.worklogs.map((worklog) => (
                <TableRow key={worklog.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-mono font-semibold text-[#4C9AFF]">
                    <a 
                      href={`${jiraUrl}/browse/${worklog.issueKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {worklog.issueKey}
                    </a>
                  </TableCell>
                  <TableCell className="truncate max-w-[200px]">{worklog.issueSummary}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatTimeRange(worklog.started, worklog.timeSpentSeconds)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {worklog.timeSpent}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(worklog)
                        }}
                        className="h-7 w-7 hover:bg-white/10 hover:text-[#4C9AFF]"
                        title="แก้ไข"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(worklog)
                        }}
                        className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
                        title="ลบ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
