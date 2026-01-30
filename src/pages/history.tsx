import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  Calendar,
  CalendarClock,
  CalendarDays,
  Pencil,
  Trash2,
  Plus,
  Copy,
  CopyPlus,
  Download,
  ClipboardList
} from 'lucide-react'
import { format, differenceInDays, parseISO, startOfWeek, endOfWeek } from 'date-fns'
import { th } from 'date-fns/locale'
import { generateDateRange } from '@/lib/date-utils'
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
import { jiraAuthService } from '@/services/auth.service'
import { WorklogDialog, DeleteConfirmDialog, type WorklogFormData } from '@/components/worklog-dialog'
import { ContextMenu, useContextMenu, type ContextMenuAction } from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { STORAGE_KEYS } from '@/lib/constants'
import { useFavoriteTasks } from '@/hooks/use-favorite-tasks'

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
  // Get date from query params
  const search = useSearch({ from: '/history' })
  const dateFromQuery = search.date as string | undefined

  // Session state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [jiraUrl, setJiraUrl] = useState('')

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('daily')

  // Calculate current week range (Monday-Sunday) - same logic as mini history
  const getCurrentWeekRange = useCallback(() => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate Monday of the current week
    let start: Date
    if (dayOfWeek === 1) {
      // Today is Monday, use it as start
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      start.setHours(0, 0, 0, 0)
    } else {
      // Use startOfWeek to get Monday of the week containing today
      start = startOfWeek(today, { weekStartsOn: 1 })
    }
    
    // Always use endOfWeek to get Sunday of the week containing today
    const end = endOfWeek(today, { weekStartsOn: 1 })
    
    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    }
  }, [])

  // Date filter state
  // If date query param exists, use it for both start and end date (single day view)
  // Otherwise, use current week range (Monday-Sunday)
  const currentWeekRange = getCurrentWeekRange()
  const initialStartDate = dateFromQuery || currentWeekRange.startDate
  const initialEndDate = dateFromQuery || currentWeekRange.endDate
  
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [isUserSelectedDate, setIsUserSelectedDate] = useState(false)

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
  const [isDuplicateMode, setIsDuplicateMode] = useState(false)

  // Favorite tasks hook
  const { recordTaskUsage } = useFavoriteTasks()

  // Context menu
  const contextMenu = useContextMenu()
  const [contextMenuWorklog, setContextMenuWorklog] = useState<WorklogEntry | null>(null)

  // Group worklogs by date and include all working days (excluding weekends) in the selected range
  const dailyWorklogs = useMemo((): DailyWorklog[] => {
    // First, group worklogs by date
    const grouped: Record<string, WorklogEntry[]> = {}

    for (const worklog of worklogs) {
      const date = worklog.started.split('T')[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(worklog)
    }

    // Get all working days in the selected date range (excluding weekends)
    const workingDays = startDate && endDate 
      ? generateDateRange(startDate, endDate, true) // skipWeekends = true
      : []

    // Create entries for all working days, including days without worklogs
    const allDays: DailyWorklog[] = workingDays.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const logs = grouped[dateStr] || []
      const totalSeconds = logs.reduce((sum, log) => sum + log.timeSpentSeconds, 0)
      
      return {
        date: dateStr,
        dayName: format(date, 'EEEE', { locale: th }),
        worklogs: logs.sort((a, b) => new Date(a.started).getTime() - new Date(b.started).getTime()),
        totalSeconds,
        isComplete: totalSeconds >= EIGHT_HOURS_SECONDS,
      }
    })

    return allDays.sort((a, b) => a.date.localeCompare(b.date)) // Sort ascending (oldest first)
  }, [worklogs, startDate, endDate])

  // Weekly summary - target is based on total working days (excluding weekends) in the selected date range
  const weeklySummary = useMemo(() => {
    const totalSeconds = worklogs.reduce((sum, log) => sum + log.timeSpentSeconds, 0)
    
    // Calculate total working days (excluding weekends) in the selected date range
    const workingDays = startDate && endDate 
      ? generateDateRange(startDate, endDate, true) // skipWeekends = true
      : []
    
    const totalWorkingDays = workingDays.length
    const targetSeconds = totalWorkingDays * EIGHT_HOURS_SECONDS
    
    // Days with worklogs
    const daysWithWorklogs = dailyWorklogs.length
    // Days that are complete (8 hours or more)
    const completeDays = dailyWorklogs.filter(d => d.isComplete).length
    
    return {
      totalSeconds,
      targetSeconds,
      isComplete: totalSeconds >= targetSeconds,
      daysWorked: daysWithWorklogs,
      totalWorkingDays,
      completeDays,
      targetHours: totalWorkingDays * 8,
    }
  }, [worklogs, dailyWorklogs, startDate, endDate])

  // Current day data (for daily view)
  const currentDay = dailyWorklogs[currentDayIndex]
  const totalDays = dailyWorklogs.length

  // Validation
  const isDateRangeValid = startDate <= endDate
  const dateRangeDays = startDate && endDate ? differenceInDays(parseISO(endDate), parseISO(startDate)) : 0
  const isWithinMonthLimit = dateRangeDays <= 60
  const dateError = !isDateRangeValid 
    ? 'วันที่เริ่มต้นต้องน้อยกว่าหรือเท่ากับวันที่สิ้นสุด' 
    : !isWithinMonthLimit 
    ? 'ช่วงวันที่ต้องไม่เกิน 60 วัน (2 เดือน)' 
    : null

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true)
      try {
        const session = await jiraAuthService.getCurrentSession()
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
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setError('กรุณาเข้าสู่ระบบก่อน')
      return
    }

    if (!isDateRangeValid) {
      setError('วันที่เริ่มต้นต้องน้อยกว่าหรือเท่ากับวันที่สิ้นสุด')
      return
    }

    if (!isWithinMonthLimit) {
      setError('ช่วงวันที่ต้องไม่เกิน 60 วัน (2 เดือน)')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await jiraService.fetchWorklogHistory(startDate, endDate)
      setWorklogs(data.worklogs || [])
      // Only reset to 0 if no dateFromQuery, otherwise will be set by the effect below
      if (!dateFromQuery) {
        setCurrentDayIndex(0)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setWorklogs([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, isDateRangeValid, startDate, endDate, dateFromQuery])

  // Update dates when query param changes
  useEffect(() => {
    if (dateFromQuery) {
      // Single day view from query param
      setStartDate(dateFromQuery)
      setEndDate(dateFromQuery)
      setIsUserSelectedDate(false) // Reset flag when coming from query param
    } else if (!isUserSelectedDate) {
      // Only reset to current week range if user hasn't manually selected dates
      const weekRange = getCurrentWeekRange()
      setStartDate(weekRange.startDate)
      setEndDate(weekRange.endDate)
    }
  }, [dateFromQuery, getCurrentWeekRange, isUserSelectedDate])

  // Auto fetch on mount if authenticated, or when dates change
  useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      fetchData()
    }
  }, [isAuthenticated, isCheckingAuth, fetchData])

  // Find and set current day index when dateFromQuery is provided and data is loaded
  useEffect(() => {
    if (dateFromQuery && dailyWorklogs.length > 0) {
      const index = dailyWorklogs.findIndex(day => day.date === dateFromQuery)
      if (index !== -1) {
        setCurrentDayIndex(index)
      }
    }
  }, [dateFromQuery, dailyWorklogs])

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

  // Generate daily summary markdown and copy to clipboard
  const handleCopyDailySummary = () => {
    if (!currentDay || currentDay.worklogs.length === 0) {
      toast.error('ไม่มี worklog ในวันที่เลือก')
      return
    }

    // Get unique task summaries from worklogs
    const uniqueTasks = new Map<string, string>()
    for (const worklog of currentDay.worklogs) {
      if (!uniqueTasks.has(worklog.issueKey)) {
        uniqueTasks.set(worklog.issueKey, worklog.issueSummary)
      }
    }

    // Build markdown template
    const taskLines = Array.from(uniqueTasks.entries())
      .map(([key, summary]) => `- ${key} ${summary}`)
      .join('\n')

    const markdown = `เมื่อวาน
${taskLines}

วันนี้
- `

    navigator.clipboard.writeText(markdown)
    toast.success('คัดลอกสรุปงานแล้ว', {
      description: `${uniqueTasks.size} tasks • วางใน Slack หรือ Teams ได้เลย`,
    })
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

  // Context menu handlers
  const handleCopyWorklog = (worklog: WorklogEntry) => {
    // Copy text to clipboard
    const worklogText = `${worklog.issueKey} | ${worklog.timeSpent} | ${format(new Date(worklog.started), 'dd/MM/yyyy HH:mm')} | ${worklog.comment || '-'}`
    navigator.clipboard.writeText(worklogText)
    
    // Store worklog data in localStorage for paste functionality
    const worklogData = {
      issueKey: worklog.issueKey,
      timeSpent: worklog.timeSpent,
      date: format(new Date(worklog.started), 'yyyy-MM-dd'),
      startTime: format(new Date(worklog.started), 'HH:mm'),
      comment: worklog.comment || '',
    }
    localStorage.setItem(STORAGE_KEYS.COPIED_WORKLOG, JSON.stringify(worklogData))
    
    toast.success('คัดลอกข้อมูล worklog แล้ว', {
      description: `${worklog.issueKey} - ${worklog.timeSpent} • คลิกปุ่ม "วางข้อมูล" ในหน้า Worklog เพื่อใช้`,
      duration: 5000,
    })
  }

  const handleDuplicateWorklog = (worklog: WorklogEntry) => {
    // Store worklog data in localStorage for paste functionality
    const worklogData = {
      issueKey: worklog.issueKey,
      timeSpent: worklog.timeSpent,
      date: format(new Date(worklog.started), 'yyyy-MM-dd'),
      startTime: format(new Date(worklog.started), 'HH:mm'),
      comment: worklog.comment || '',
    }
    localStorage.setItem(STORAGE_KEYS.COPIED_WORKLOG, JSON.stringify(worklogData))
    
    // Also open dialog for immediate use
    setSelectedWorklog(worklog)
    setIsDuplicateMode(true)
    setIsWorklogDialogOpen(true)
    
    toast.success('เตรียมข้อมูลสำหรับสร้างซ้ำแล้ว', {
      description: `${worklog.issueKey} - ${worklog.timeSpent} • สามารถใช้ปุ่ม "วางข้อมูล" ในหน้า Worklog ได้`,
      duration: 5000,
    })
  }

  const getContextMenuActions = (worklog: WorklogEntry): ContextMenuAction[] => {
    return [
      {
        label: 'คัดลอก',
        icon: <Copy className="h-4 w-4" />,
        onClick: () => handleCopyWorklog(worklog),
      },
      {
        label: 'สร้างซ้ำ',
        icon: <CopyPlus className="h-4 w-4" />,
        onClick: () => handleDuplicateWorklog(worklog),
      },
      {
        label: 'ลบ',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => openDeleteDialog(worklog),
        variant: 'destructive',
      },
    ]
  }

  // Save worklog (create or update)
  const handleSaveWorklog = useCallback(async (formData: WorklogFormData) => {
    const started = `${formData.date}T${formData.startTime}:00.000+0700`
    
    if (selectedWorklog && !isDuplicateMode) {
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
      // Create new (or duplicate)
      await jiraService.createWorklog(
        formData.issueKey,
        {
          timeSpent: formData.timeSpent,
          started,
          comment: formData.comment,
        }
      )
      
      // Record task usage when worklog is created successfully
      const taskForRecording = {
        id: formData.issueKey,
        key: formData.issueKey,
        fields: {
          summary: selectedWorklog?.issueSummary || '',
          status: { name: 'Unknown', statusCategory: { key: 'new' } },
          issuetype: { name: 'Task' },
        },
      }
      recordTaskUsage(taskForRecording)
    }
    
    // Reset duplicate mode
    setIsDuplicateMode(false)
    
    // Refresh data
    await fetchData()
  }, [selectedWorklog, isDuplicateMode, fetchData, recordTaskUsage])

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
      <div className="max-w-[1000px] mx-auto items-center justify-between mb-4">
        {/* Header */}
        <header className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าหลัก
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <CalendarClock className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Worklog History
              </h1>
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
        {/* <header className="mb-8">
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
        </header> */}

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
                onChange={(e) => {
                  const newStartDate = e.target.value
                  setStartDate(newStartDate)
                  setIsUserSelectedDate(true) // Mark that user manually selected date
                  // If endDate is set and the range would exceed 60 days, adjust endDate
                  if (endDate && newStartDate) {
                    const daysDiff = differenceInDays(parseISO(endDate), parseISO(newStartDate))
                    if (daysDiff > 60) {
                      const adjustedEndDate = new Date(parseISO(newStartDate))
                      adjustedEndDate.setDate(adjustedEndDate.getDate() + 60)
                      setEndDate(format(adjustedEndDate, 'yyyy-MM-dd'))
                    }
                  }
                }}
                max={endDate}
                className={cn(
                  "w-[180px] bg-black/30 border-white/20 focus:border-primary",
                  (!isDateRangeValid || !isWithinMonthLimit) && "border-destructive focus:border-destructive"
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
                onChange={(e) => {
                  const newEndDate = e.target.value
                  setIsUserSelectedDate(true) // Mark that user manually selected date
                  // If startDate is set and the range would exceed 60 days, adjust startDate
                  if (startDate && newEndDate) {
                    const daysDiff = differenceInDays(parseISO(newEndDate), parseISO(startDate))
                    if (daysDiff > 60) {
                      const adjustedStartDate = new Date(parseISO(newEndDate))
                      adjustedStartDate.setDate(adjustedStartDate.getDate() - 60)
                      setStartDate(format(adjustedStartDate, 'yyyy-MM-dd'))
                    }
                  }
                  setEndDate(newEndDate)
                }}
                min={startDate}
                max={startDate ? (() => {
                  const maxDate = new Date(parseISO(startDate))
                  maxDate.setDate(maxDate.getDate() + 60)
                  return format(maxDate, 'yyyy-MM-dd')
                })() : undefined}
                className={cn(
                  "w-[180px] bg-black/30 border-white/20 focus:border-primary",
                  (!isDateRangeValid || !isWithinMonthLimit) && "border-destructive focus:border-destructive"
                )}
              />
            </div>
            <Button
              onClick={fetchData}
              disabled={isLoading || !isAuthenticated || !isDateRangeValid || !isWithinMonthLimit}
              className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? 'กำลังค้นหา...' : 'Fetch Data'}
            </Button>
            <Button
              onClick={async () => {
                try {
                  const blob = await jiraService.exportWorklogHistory(startDate, endDate)
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `worklog-${startDate}-${endDate}.xlsx`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                  toast.success('ดาวน์โหลดไฟล์ Excel สำเร็จ')
                } catch {
                  toast.error('ไม่สามารถ export ได้')
                }
              }}
              disabled={isLoading || !isAuthenticated || !isDateRangeValid || !isWithinMonthLimit || worklogs.length === 0}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export Excel
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
                        {weeklySummary.completeDays} / {weeklySummary.totalWorkingDays} วันที่ครบ 8 ชม.
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
                        {weeklySummary.completeDays} / {weeklySummary.totalWorkingDays} วันที่ครบ 8 ชม.
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
                  onDelete={(worklog) => openDeleteDialog(worklog)}
                  onCopy={handleCopyWorklog}
                  onDuplicate={handleDuplicateWorklog}
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
                <div className="flex items-center gap-3">
                  <p className="text-sm">
                    รวมเวลาวันนี้: <span className={cn(
                      'font-semibold',
                      currentDay.isComplete ? 'text-success' : 'text-orange-400'
                    )}>{formatTimeSpent(currentDay.totalSeconds)}</span> / 8h
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyDailySummary}
                    disabled={currentDay.worklogs.length === 0}
                    className="gap-1.5 border-white/20 hover:bg-white/10 hover:border-primary/50"
                    title="คัดลอกสรุปงานวันนี้"
                  >
                    <ClipboardList className="h-4 w-4" />
                    สรุปงาน
                  </Button>
                </div>
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
                    <TableRow 
                      key={worklog.id} 
                      className="border-white/10 hover:bg-white/5 relative"
                      onContextMenu={(e) => {
                        setContextMenuWorklog(worklog)
                        contextMenu.openMenu(e)
                      }}
                    >
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
      </div>

      {/* Context Menu */}
      {contextMenuWorklog && (
        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          actions={getContextMenuActions(contextMenuWorklog)}
          onClose={() => {
            contextMenu.closeMenu()
            setContextMenuWorklog(null)
          }}
        />
      )}

      {/* Dialogs */}
      <WorklogDialog
        isOpen={isWorklogDialogOpen}
        onClose={() => {
          setIsWorklogDialogOpen(false)
          setSelectedWorklog(null)
          setIsDuplicateMode(false)
        }}
        onSave={handleSaveWorklog}
        worklog={isDuplicateMode ? null : selectedWorklog}
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
  onCopy: (worklog: WorklogEntry) => void
  onDuplicate: (worklog: WorklogEntry) => void
}

function DayCard({ day, jiraUrl, onEdit, onDelete, onCopy, onDuplicate }: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const contextMenu = useContextMenu()
  const [contextMenuWorklog, setContextMenuWorklog] = useState<WorklogEntry | null>(null)

  const getContextMenuActions = (worklog: WorklogEntry): ContextMenuAction[] => {
    return [
      {
        label: 'คัดลอก',
        icon: <Copy className="h-4 w-4" />,
        onClick: () => onCopy(worklog),
      },
      {
        label: 'สร้างซ้ำ',
        icon: <CopyPlus className="h-4 w-4" />,
        onClick: () => onDuplicate(worklog),
      },
      {
        label: 'ลบ',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => onDelete(worklog),
        variant: 'destructive',
      },
    ]
  }

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
                <TableRow 
                  key={worklog.id} 
                  className="border-white/10 hover:bg-white/5 relative"
                  onContextMenu={(e) => {
                    setContextMenuWorklog(worklog)
                    contextMenu.openMenu(e)
                  }}
                >
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

      {/* Context Menu */}
      {contextMenuWorklog && (
        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          actions={getContextMenuActions(contextMenuWorklog)}
          onClose={() => {
            contextMenu.closeMenu()
            setContextMenuWorklog(null)
          }}
        />
      )}
    </div>
  )
}
