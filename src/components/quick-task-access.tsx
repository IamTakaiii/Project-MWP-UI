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
    <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <Clock className="h-3 w-3" />
          Recent Tasks
        </h3>
        <span className="text-[10px] text-muted-foreground/50 bg-white/5 px-2 py-0.5 rounded-full">
          {recentTasks.length} items
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 pt-1 -mx-1 px-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x">
        {recentTasks.slice(0, 15).map((taskUsage) => {
          const isSelected = selectedTaskId === taskUsage.taskKey;
          return (
            <button
              key={taskUsage.taskKey}
              onClick={() => onSelectTask(createTaskFromUsage(taskUsage))}
              title={`${taskUsage.taskKey}: ${taskUsage.summary}`}
              className={cn(
                "group shrink-0 relative flex items-center gap-3 pl-3 pr-4 py-2 rounded-lg text-left transition-all duration-300 border snap-start",
                "backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5",
                isSelected
                  ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
                  : "bg-card/40 border-border/40 hover:bg-card/80 hover:border-primary/30"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
                  isSelected ? "bg-primary/20 text-primary" : "bg-black/20 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}
              >
                <Clock className="w-4 h-4" />
              </div>

              <div className="flex flex-col min-w-[100px] max-w-[160px]">
                <span className={cn(
                  "font-mono text-xs font-bold leading-none mb-1",
                  isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                )}>
                  {taskUsage.taskKey}
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-full group-hover:text-foreground/80 transition-colors">
                  {taskUsage.summary || "No summary"}
                </span>
              </div>

              {isSelected && (
                <div className="absolute inset-0 rounded-lg border-2 border-primary/20 pointer-events-none animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
