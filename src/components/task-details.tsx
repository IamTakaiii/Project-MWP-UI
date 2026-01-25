import { Link } from '@tanstack/react-router'
import { ClipboardList, History } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { TaskPicker } from './task-picker'
import { QuickTaskAccess } from './quick-task-access'
import type { JiraIssue } from '@/types'

interface TaskPickerState {
  isOpen: boolean
  tasks: JiraIssue[]
  isLoading: boolean
  searchText: string
  statusFilter: string
  onFetch: () => void
  onClose: () => void
  onSearch: () => void
  onSearchTextChange: (text: string) => void
  onStatusChange: (status: string) => void
  onSelectTask: (task: JiraIssue) => void
}

interface TaskDetailsProps {
  taskId: string
  accountId: string
  jiraUrl: string
  onTaskIdChange: (value: string) => void
  onAccountIdChange: (value: string) => void
  taskPicker: TaskPickerState
}

export function TaskDetails({
  taskId,
  accountId,
  jiraUrl,
  onTaskIdChange,
  onAccountIdChange,
  taskPicker,
}: TaskDetailsProps) {
  return (
    <section className="mb-8 pb-8 border-b border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-3 text-xl font-semibold text-foreground">
          <span className="text-2xl">📋</span>
          รายละเอียด Task
        </h2>
        <Link to="/history">
          <Button variant="secondary" size="sm" className="gap-2 bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 hover:text-amber-300">
            <History className="h-4 w-4" />
            ดูประวัติ
          </Button>
        </Link>
      </div>

      {/* Quick Task Access */}
      <QuickTaskAccess
        onSelectTask={taskPicker.onSelectTask}
        selectedTaskId={taskId}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="taskId">Task ID</Label>
          <div className="flex gap-2">
            <Input
              id="taskId"
              type="text"
              value={taskId}
              onChange={(e) => onTaskIdChange(e.target.value.toUpperCase())}
              placeholder="ADM-17"
              className="bg-input border-[rgba(255,255,255,0.15)] focus:border-ring"
              required
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={taskPicker.onFetch}
              disabled={taskPicker.isLoading}
              className="shrink-0 bg-secondary border border-[#4C9AFF]/30 hover:bg-[#4C9AFF]/25"
            >
              {taskPicker.isLoading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <ClipboardList className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountId">Account ID (Optional)</Label>
          <Input
            id="accountId"
            type="text"
            value={accountId}
            onChange={(e) => onAccountIdChange(e.target.value)}
            placeholder="5c1234567890abcdef123456"
            className="bg-input border-[rgba(255,255,255,0.15)] focus:border-ring"
          />
          <p className="text-sm text-muted-foreground">
            ถ้าไม่กรอกจะใช้ account ของ API Token
          </p>
        </div>
      </div>

      <TaskPicker
        isOpen={taskPicker.isOpen}
        tasks={taskPicker.tasks}
        isLoading={taskPicker.isLoading}
        searchText={taskPicker.searchText}
        statusFilter={taskPicker.statusFilter}
        selectedTaskId={taskId}
        jiraUrl={jiraUrl}
        onClose={taskPicker.onClose}
        onSearch={taskPicker.onSearch}
        onSearchTextChange={taskPicker.onSearchTextChange}
        onStatusChange={taskPicker.onStatusChange}
        onSelectTask={taskPicker.onSelectTask}
      />
    </section>
  )
}
