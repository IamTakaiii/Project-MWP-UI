import { Link } from '@tanstack/react-router'
import { ClipboardList, History, ClipboardPaste, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TaskPicker } from './task-picker'
import { QuickTaskAccess } from './quick-task-access'
import { STORAGE_KEYS } from '@/lib/constants'
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
  jiraUrl: string
  onTaskIdChange: (value: string) => void
  onPasteWorklog?: () => void
  onLogout?: () => void
  taskPicker: TaskPickerState
}

export function TaskDetails({
  taskId,
  jiraUrl,
  onTaskIdChange,
  onPasteWorklog,
  onLogout,
  taskPicker,
}: TaskDetailsProps) {
  const hasCopiedWorklog = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEYS.COPIED_WORKLOG)

  return (
    <section className="mb-8 pb-8 border-b border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-3 text-xl font-semibold text-foreground">
            <span className="text-2xl">📋</span>
            รายละเอียด Task
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-medium cursor-help">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                <span className="hidden sm:inline">เชื่อมต่อแล้ว</span>
                <span className="sm:hidden">เชื่อมต่อ</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium">JIRA URL:</p>
              <p className="text-xs mt-1 break-all">{jiraUrl}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          {onPasteWorklog && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPasteWorklog}
              disabled={!hasCopiedWorklog}
              className="gap-1.5 h-8 px-3 bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 disabled:opacity-50"
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">วางข้อมูล</span>
            </Button>
          )}
          <Link to="/history">
            <Button variant="secondary" size="sm" className="gap-2 bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 hover:text-amber-300">
              <History className="h-4 w-4" />
              ดูประวัติ
            </Button>
          </Link>
          {onLogout && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="gap-1.5 h-8 px-2.5 text-xs bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20 hover:text-destructive hover:border-destructive/40"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ออก</span>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Task Access */}
      <QuickTaskAccess
        onSelectTask={taskPicker.onSelectTask}
        selectedTaskId={taskId}
      />

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
