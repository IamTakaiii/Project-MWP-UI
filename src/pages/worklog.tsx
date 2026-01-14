import { useState, useCallback, useEffect, type FormEvent } from 'react'
import { Rocket } from 'lucide-react'
import { Header, ConnectionForm, TaskDetails, DateTimeForm, LogPanel } from '@/components'
import { Button } from '@/components/ui/button'
import { useLocalStorage, useWorklog, useTasks } from '@/hooks'
import { generateDateRange } from '@/lib/date-utils'
import { STORAGE_KEYS, DEFAULT_VALUES } from '@/lib/constants'
import { jiraAuthService } from '@/services/auth.service'
import type { JiraIssue } from '@/types'

export function WorklogPage() {
  // Session state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [jiraUrl, setJiraUrl] = useState('')
  
  // Task ID (persisted)
  const [taskId, setTaskId] = useLocalStorage(STORAGE_KEYS.TASK_ID, '')

  // Form state
  const [accountId, setAccountId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [timeSpent, setTimeSpent] = useState<string>(DEFAULT_VALUES.TIME_SPENT)
  const [startTime, setStartTime] = useState<string>(DEFAULT_VALUES.START_TIME)
  const [skipWeekends, setSkipWeekends] = useState<boolean>(DEFAULT_VALUES.SKIP_WEEKENDS)
  const [comment, setComment] = useState('')

  // Custom hooks
  const { logs, isLoading, clearLogs, createWorklogs } = useWorklog()
  const tasks = useTasks()

  // Computed values
  const previewDates = generateDateRange(startDate, endDate, skipWeekends)

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

  // Handlers
  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true)
    // Refresh session info
    jiraAuthService.getCurrentSession().then((session) => {
      if (session.authenticated && session.jiraUrl) {
        setJiraUrl(session.jiraUrl)
      }
    })
  }, [])

  const handleFetchTasks = useCallback(() => {
    tasks.fetchTasks()
  }, [tasks])

  const handleStatusChange = useCallback((status: string) => {
    tasks.updateStatusFilter(status)
    tasks.fetchTasks({ status })
  }, [tasks])

  const handleSelectTask = useCallback((task: JiraIssue) => {
    setTaskId(task.key)
    // ไม่ปิด dialog อัตโนมัติ ให้ user ปิดเอง
  }, [setTaskId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      return
    }

    const result = await createWorklogs({
      taskId,
      startDate,
      endDate,
      startTime,
      timeSpent,
      skipWeekends,
      comment,
    })

    // Clear form and close task picker after successful creation
    if (result.success > 0) {
      setStartDate('')
      setEndDate('')
      setComment('')
      setTaskId('')
      tasks.reset()
    }
  }

  // Task picker props
  const taskPickerProps = {
    isOpen: tasks.isOpen,
    tasks: tasks.tasks,
    isLoading: tasks.isLoading,
    searchText: tasks.searchText,
    statusFilter: tasks.statusFilter,
    onFetch: handleFetchTasks,
    onClose: tasks.closePicker,
    onSearch: handleFetchTasks,
    onSearchTextChange: tasks.updateSearchText,
    onStatusChange: handleStatusChange,
    onSelectTask: handleSelectTask,
  }

  if (isCheckingAuth) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-[800px] mx-auto relative z-10">
          <Header />
          <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)] text-center">
            <p className="text-muted-foreground">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-[800px] mx-auto relative z-10">
        <Header />

        <form
          onSubmit={handleSubmit}
          className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
        >
          {!isAuthenticated ? (
            <ConnectionForm onLoginSuccess={handleLoginSuccess} />
          ) : (
            <>
              <div className="mb-8 pb-8 border-b border-border">
                <h2 className="flex items-center gap-3 text-xl font-semibold text-foreground mb-4">
                  <span className="text-2xl">✅</span>
                  เชื่อมต่อแล้ว
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  JIRA URL: {jiraUrl}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    await jiraAuthService.logout()
                    setIsAuthenticated(false)
                    setJiraUrl('')
                  }}
                  className="w-full"
                >
                  ออกจากระบบ
                </Button>
              </div>

              <TaskDetails
                taskId={taskId}
                accountId={accountId}
                jiraUrl={jiraUrl}
                onTaskIdChange={setTaskId}
                onAccountIdChange={setAccountId}
                taskPicker={taskPickerProps}
              />

              <DateTimeForm
                startDate={startDate}
                endDate={endDate}
                startTime={startTime}
                timeSpent={timeSpent}
                skipWeekends={skipWeekends}
                comment={comment}
                previewDates={previewDates}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onStartTimeChange={setStartTime}
                onTimeSpentChange={setTimeSpent}
                onSkipWeekendsChange={setSkipWeekends}
                onCommentChange={setComment}
              />

              <Button
                type="submit"
                size="lg"
                disabled={isLoading || !isAuthenticated}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-[#4C9AFF] hover:opacity-90 shadow-[0_4px_20px_rgba(0,82,204,0.4)] hover:shadow-[0_6px_30px_rgba(0,82,204,0.5)] transition-all hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    กำลังสร้าง...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-5 w-5" />
                    สร้าง Worklog
                  </>
                )}
              </Button>
            </>
          )}
        </form>

        {isAuthenticated && <LogPanel logs={logs} onClear={clearLogs} />}

        <footer className="text-center mt-8 py-4">
          <p className="text-sm text-muted-foreground">
            🔒 ข้อมูล credentials ถูกเก็บไว้ใน session ที่ปลอดภัย
          </p>
        </footer>
      </div>
    </div>
  )
}
