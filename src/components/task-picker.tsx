import { useState } from 'react'
import { X, Search, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { STATUS_OPTIONS, ADMIN_TASKS } from '@/lib/constants'
import type { JiraIssue } from '@/types'
import { cn } from '@/lib/utils'

type TabType = 'my-tasks' | 'admin-tasks'

interface TaskPickerProps {
  isOpen: boolean
  tasks: JiraIssue[]
  isLoading: boolean
  searchText: string
  statusFilter: string
  selectedTaskId: string
  jiraUrl: string
  onClose: () => void
  onSearch: () => void
  onSearchTextChange: (text: string) => void
  onStatusChange: (status: string) => void
  onSelectTask: (task: JiraIssue) => void
}

export function TaskPicker({
  isOpen,
  tasks,
  isLoading,
  searchText,
  statusFilter,
  selectedTaskId,
  jiraUrl,
  onClose,
  onSearch,
  onSearchTextChange,
  onStatusChange,
  onSelectTask,
}: TaskPickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('my-tasks')

  if (!isOpen) return null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch()
    }
  }

  const getStatusColor = (statusCategory?: string) => {
    switch (statusCategory) {
      case 'done':
        return 'bg-success/20 text-success'
      case 'indeterminate':
        return 'bg-[#4C9AFF]/20 text-[#4C9AFF]'
      case 'new':
      case 'undefined':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-warning/20 text-warning'
    }
  }

  const handleSelectAdminTask = (adminTask: typeof ADMIN_TASKS[number]) => {
    // Convert admin task to JiraIssue format
    const task: JiraIssue = {
      id: adminTask.key,
      key: adminTask.key,
      fields: {
        summary: adminTask.summary,
        status: { name: 'Admin', statusCategory: { key: 'indeterminate' } },
        issuetype: { name: 'Admin Task' },
      },
    }
    onSelectTask(task)
  }

  return (
    <div className="mt-6 bg-black/30 border border-border rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 bg-[#4C9AFF]/10 border-b border-border">
        <h3 className="text-base font-semibold text-[#4C9AFF]">
          📋 เลือก Task
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 bg-destructive/15 border border-destructive/30 text-destructive hover:bg-destructive/25"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('my-tasks')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
            activeTab === 'my-tasks'
              ? 'text-[#4C9AFF] bg-[#4C9AFF]/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          )}
        >
          📋 Tasks ของฉัน ({tasks.length})
          {activeTab === 'my-tasks' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4C9AFF]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('admin-tasks')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
            activeTab === 'admin-tasks'
              ? 'text-purple-400 bg-purple-400/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          )}
        >
          <Zap className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
          Admin Tasks ({ADMIN_TASKS.length})
          {activeTab === 'admin-tasks' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
          )}
        </button>
      </div>

      {/* My Tasks Tab Content */}
      {activeTab === 'my-tasks' && (
        <>
          {/* Filters */}
          <div className="flex gap-3 p-4 bg-black/15 border-b border-border">
            <div className="flex-1">
              <Input
                placeholder="🔍 ค้นหา Task..."
                value={searchText}
                onChange={(e) => onSearchTextChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-input border-[rgba(255,255,255,0.15)]"
              />
            </div>
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="bg-input border-[rgba(255,255,255,0.15)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={onSearch}
              disabled={isLoading}
              className="bg-primary hover:bg-[#4C9AFF]"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Table */}
          <div className="max-h-[350px] overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>🔍 ไม่พบ Tasks ที่ตรงกับเงื่อนไข</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-[#A5ADBA]">Key</TableHead>
                    <TableHead className="text-[#A5ADBA]">Summary</TableHead>
                    <TableHead className="text-[#A5ADBA]">Status</TableHead>
                    <TableHead className="text-[#A5ADBA]">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={cn(
                        'cursor-pointer border-border transition-colors',
                        selectedTaskId === task.key
                          ? 'bg-[#4C9AFF]/20'
                          : 'hover:bg-[#4C9AFF]/10'
                      )}
                    >
                      <TableCell className="font-mono font-semibold text-[#4C9AFF]">
                        <a
                          href={`${jiraUrl}/browse/${task.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline"
                          title="เปิดใน JIRA"
                        >
                          {task.key}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {task.fields.summary}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase',
                            getStatusColor(task.fields.status?.statusCategory?.key)
                          )}
                        >
                          {task.fields.status?.name || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#A5ADBA]">
                        {task.fields.issuetype?.name || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}

      {/* Admin Tasks Tab Content */}
      {activeTab === 'admin-tasks' && (
        <div className="max-h-[400px] overflow-y-auto">
          <div className="p-2">
            {ADMIN_TASKS.map((task) => (
              <button
                key={task.key}
                onClick={() => handleSelectAdminTask(task)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors',
                  selectedTaskId === task.key
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'hover:bg-white/5'
                )}
              >
                <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="font-mono text-sm font-semibold text-purple-400 min-w-[70px]">
                  {task.key}
                </span>
                <span className="text-foreground truncate">{task.summary}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
