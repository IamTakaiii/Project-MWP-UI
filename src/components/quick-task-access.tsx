import { Clock } from "lucide-react";
import { useFavoriteTasks } from "@/hooks/use-favorite-tasks";
import { cn } from "@/lib/utils";
import type { JiraIssue } from "@/types";

interface QuickTaskAccessProps {
  onSelectTask: (task: JiraIssue) => void;
  selectedTaskId?: string;
  availableTasks?: JiraIssue[];
}

export function QuickTaskAccess({
  onSelectTask,
  selectedTaskId,
  availableTasks = [],
}: QuickTaskAccessProps) {
  const { recentTasks, recordTaskUsage } = useFavoriteTasks();

  const createTaskFromUsage = (taskUsage: {
    taskKey: string;
    summary: string;
  }): JiraIssue => {
    // Try to find task summary from availableTasks if summary is missing
    const availableTask = availableTasks.find(
      (t) => t.key === taskUsage.taskKey,
    );
    const summary = taskUsage.summary || availableTask?.fields.summary || "";

    // If we found summary from availableTasks, update the task usage
    if (!taskUsage.summary && summary && availableTask) {
      recordTaskUsage(availableTask);
    }

    return {
      id: taskUsage.taskKey,
      key: taskUsage.taskKey,
      fields: {
        summary,
        status: availableTask?.fields.status || {
          name: "Unknown",
          statusCategory: { key: "new" },
        },
        issuetype: availableTask?.fields.issuetype || { name: "Task" },
      },
    };
  };

  if (recentTasks.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-foreground">Recent Tasks</h3>
        <span className="text-xs text-muted-foreground">
          ({recentTasks.length})
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {recentTasks.map((taskUsage) => {
          const isSelected = selectedTaskId === taskUsage.taskKey;
          return (
            <button
              key={taskUsage.taskKey}
              onClick={() => onSelectTask(createTaskFromUsage(taskUsage))}
              className={cn(
                "shrink-0 px-4 py-2.5 rounded-xl text-left transition-all border min-w-[180px]",
                "hover:scale-105 active:scale-95",
                isSelected
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
              )}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span className="font-mono text-sm font-semibold text-[#4C9AFF]">
                  {taskUsage.taskKey}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate min-h-[1.25rem]">
                {taskUsage.summary || "ไม่มีชื่อ"}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                ใช้ {taskUsage.useCount} ครั้ง
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
