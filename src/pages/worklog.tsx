import { useState, useCallback, type FormEvent } from 'react'
import { Rocket } from 'lucide-react'
import { Header, ConnectionForm, TaskDetails, DateTimeForm, LogPanel } from '@/components'
import { Button } from '@/components/ui/button'
import { useLocalStorage, useWorklog, useTasks } from '@/hooks'
import { generateDateRange } from '@/lib/date-utils'
import { STORAGE_KEYS, DEFAULT_VALUES } from '@/lib/constants'
import type { JiraIssue } from '@/types'

export function WorklogPage() {
  // Connection credentials (persisted)
  const [jiraUrl, setJiraUrl] = useLocalStorage(STORAGE_KEYS.JIRA_URL, '')
  const [email, setEmail] = useLocalStorage(STORAGE_KEYS.EMAIL, '')
  const [apiToken, setApiToken] = useLocalStorage(STORAGE_KEYS.API_TOKEN, '')
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
  const credentials = { jiraUrl, email, apiToken }
  const previewDates = generateDateRange(startDate, endDate, skipWeekends)

  // Handlers
  const handleFetchTasks = useCallback(() => {
    tasks.fetchTasks(credentials)
  }, [tasks, credentials])

  const handleStatusChange = useCallback((status: string) => {
    tasks.updateStatusFilter(status)
    tasks.fetchTasks(credentials, { status })
  }, [tasks, credentials])

  const handleSelectTask = useCallback((task: JiraIssue) => {
    setTaskId(task.key)
    // ไม่ปิด dialog อัตโนมัติ ให้ user ปิดเอง
  }, [setTaskId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const result = await createWorklogs({
      credentials,
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

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-[800px] mx-auto relative z-10">
        <Header />

        <form
          onSubmit={handleSubmit}
          className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
        >
          <ConnectionForm
            jiraUrl={jiraUrl}
            email={email}
            apiToken={apiToken}
            onJiraUrlChange={setJiraUrl}
            onEmailChange={setEmail}
            onApiTokenChange={setApiToken}
          />

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
            disabled={isLoading}
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
        </form>

        <LogPanel logs={logs} onClear={clearLogs} />

        <footer className="text-center mt-8 py-4">
          <p className="text-sm text-muted-foreground">
            ⚠️ กรุณาเก็บ API Token เป็นความลับ
          </p>
        </footer>
      </div>
    </div>
  )
}
