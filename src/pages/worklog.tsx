import { useState, useCallback, useEffect, useRef } from "react";
import { Rocket, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  PageContainer,
  PageHeader,
  ConnectionForm,
  TaskDetails,
  DateTimeForm,
  LogPanel,
  MiniHistory,
} from "@/components";
import { Button } from "@/components/ui/button";
import {
  useLocalStorage,
  useWorklog,
  useTasks,
  useFavoriteTasks,
  useAuth,
  useWorklogClipboard,
  getCopiedWorklogSilent,
} from "@/hooks";
import { generateDateRange } from "@/lib/date-utils";
import { STORAGE_KEYS, DEFAULT_VALUES } from "@/lib/constants";
import type { JiraIssue } from "@/types";

type SaveMode = "add-another" | "close";

export function WorklogPage() {
  // Auth state (using centralized hook)
  const {
    isAuthenticated,
    isCheckingAuth,
    jiraUrl,
    setIsAuthenticated,
    logout,
    refreshSession,
  } = useAuth();

  // Clipboard hook
  const { pasteWorklog } = useWorklogClipboard();

  // Task ID (persisted)
  const [taskId, setTaskId] = useLocalStorage(STORAGE_KEYS.TASK_ID, "");

  // Form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timeSpent, setTimeSpent] = useState<string>(DEFAULT_VALUES.TIME_SPENT);
  const [startTime, setStartTime] = useState<string>(DEFAULT_VALUES.START_TIME);
  const [skipWeekends, setSkipWeekends] = useState<boolean>(
    DEFAULT_VALUES.SKIP_WEEKENDS,
  );
  const [comment, setComment] = useState("");

  // Custom hooks
  const { logs, isLoading, clearLogs, createWorklogs } = useWorklog();
  const tasks = useTasks();
  const { recordTaskUsage } = useFavoriteTasks();

  // Computed values
  const previewDates = generateDateRange(startDate, endDate, skipWeekends);

  // Sync MiniHistory height with form height
  const formRef = useRef<HTMLFormElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncHeights = () => {
      if (formRef.current && historyRef.current) {
        const formHeight = formRef.current.offsetHeight;
        historyRef.current.style.height = `${formHeight}px`;
      }
    };

    syncHeights();
    window.addEventListener("resize", syncHeights);

    // Use ResizeObserver to watch for form height changes
    let resizeObserver: ResizeObserver | null = null;
    if (formRef.current) {
      resizeObserver = new ResizeObserver(syncHeights);
      resizeObserver.observe(formRef.current);
    }

    return () => {
      window.removeEventListener("resize", syncHeights);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isAuthenticated, previewDates, taskId, startDate, endDate, comment]);

  // Load copied worklog data on mount (using utility function)
  useEffect(() => {
    if (isAuthenticated) {
      const copiedWorklog = getCopiedWorklogSilent();
      if (copiedWorklog) {
        // Only auto-fill if form is empty
        if (!taskId && !startDate && !timeSpent && !comment) {
          setTaskId(copiedWorklog.issueKey || "");
          setStartDate(copiedWorklog.date || "");
          setTimeSpent(copiedWorklog.timeSpent || DEFAULT_VALUES.TIME_SPENT);
          setStartTime(copiedWorklog.startTime || DEFAULT_VALUES.START_TIME);
          setComment(copiedWorklog.comment || "");

          // Clear copied data after using
          localStorage.removeItem(STORAGE_KEYS.COPIED_WORKLOG);

          toast.success("วางข้อมูล worklog แล้ว", {
            description: `Task: ${copiedWorklog.issueKey}`,
          });
        }
      }
    }
  }, [isAuthenticated, setTaskId]);

  // Handlers
  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    refreshSession();
  }, [setIsAuthenticated, refreshSession]);

  const handlePasteWorklog = useCallback(() => {
    const copiedWorklog = pasteWorklog();
    if (copiedWorklog) {
      setTaskId(copiedWorklog.issueKey || "");
      setStartDate(copiedWorklog.date || "");
      setTimeSpent(copiedWorklog.timeSpent || DEFAULT_VALUES.TIME_SPENT);
      setStartTime(copiedWorklog.startTime || DEFAULT_VALUES.START_TIME);
      setComment(copiedWorklog.comment || "");
    }
  }, [pasteWorklog, setTaskId]);

  const handleFetchTasks = useCallback(() => {
    tasks.fetchTasks();
  }, [tasks]);

  const handleStatusChange = useCallback(
    (status: string) => {
      tasks.updateStatusFilter(status);
      tasks.fetchTasks({ status });
    },
    [tasks],
  );

  const handleSelectTask = useCallback(
    (task: JiraIssue) => {
      setTaskId(task.key);
      // Record task usage immediately to update summary
      recordTaskUsage(task);
      // ไม่ปิด dialog อัตโนมัติ ให้ user ปิดเอง
    },
    [setTaskId, recordTaskUsage],
  );

  const saveModeRef = useRef<SaveMode>("add-another");

  const handleSubmit = async (
    e: React.FormEvent,
    mode: SaveMode = "add-another",
  ) => {
    e.preventDefault();
    saveModeRef.current = mode;

    // Prevent double submission
    if (!isAuthenticated || isLoading) {
      return;
    }

    // Validate required fields
    if (!taskId.trim()) {
      toast.error("กรุณาระบุ Task ID");
      return;
    }

    if (!startDate) {
      toast.error("กรุณาเลือกวันที่");
      return;
    }

    if (!timeSpent) {
      toast.error("กรุณาระบุระยะเวลา");
      return;
    }

    const result = await createWorklogs({
      taskId: taskId.trim(),
      startDate,
      endDate,
      startTime,
      timeSpent,
      skipWeekends,
      comment,
    });

    // Show toast notification
    if (result.success > 0) {
      const dateCount = previewDates.length;

      // Record task usage when worklog is created successfully
      // Find task summary from tasks list if available, or use the task that was selected
      const selectedTask = tasks.tasks.find((t) => t.key === taskId);
      const taskSummary = selectedTask?.fields.summary || "";
      if (taskId) {
        // Use the full task object if available, otherwise create minimal object
        const taskForRecording = selectedTask || {
          id: taskId,
          key: taskId,
          fields: {
            summary: taskSummary,
            status: { name: "Unknown", statusCategory: { key: "new" } },
            issuetype: { name: "Task" },
          },
        };
        recordTaskUsage(taskForRecording);
      }

      toast.success(`สร้าง Worklog สำเร็จ ${result.success} รายการ`, {
        description: `Task: ${taskId} • ${dateCount} วัน • ${timeSpent}`,
      });

      if (mode === "close") {
        // Clear everything and reset
        setStartDate("");
        setEndDate("");
        setComment("");
        setTaskId("");
        tasks.reset();
      } else {
        // Keep task, clear only date and comment for adding another
        setStartDate("");
        setEndDate("");
        setComment("");
      }
    } else if (result.failed > 0) {
      toast.error(`สร้าง Worklog ล้มเหลว ${result.failed} รายการ`, {
        description: "ตรวจสอบ Log Panel ด้านล่างเพื่อดูรายละเอียด",
      });
    }
  };

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
  };

  if (isCheckingAuth) {
    return (
      <PageContainer>
        <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)] text-center">
          <p className="text-muted-foreground">
            กำลังตรวจสอบการเข้าสู่ระบบ...
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Create Worklogs"
        description="สร้าง worklog แบบ batch สำหรับหลายวันพร้อมกัน"
        icon={<Pencil className="h-5 w-5" />}
      />

      {!isAuthenticated ? (
          // Center login form vertically
          <div className="flex items-center justify-center">
            <div className="w-full max-w-xl">
              <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                <ConnectionForm onLoginSuccess={handleLoginSuccess} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 xl:items-start">
            {/* Main Form */}
            <div className="min-w-0 flex flex-col">
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
                id="worklog-form"
              >
                <TaskDetails
                  taskId={taskId}
                  jiraUrl={jiraUrl}
                  onTaskIdChange={setTaskId}
                  onPasteWorklog={handlePasteWorklog}
                  onLogout={logout}
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

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    size="lg"
                    disabled={isLoading || !isAuthenticated}
                    onClick={(e) => handleSubmit(e, "add-another")}
                    className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-primary to-[#4C9AFF] hover:opacity-90 shadow-[0_4px_20px_rgba(0,82,204,0.4)] hover:shadow-[0_6px_30px_rgba(0,82,204,0.5)] transition-all hover:-translate-y-0.5"
                  >
                    {isLoading && saveModeRef.current === "add-another" ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        กำลังสร้าง...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-5 w-5" />
                        บันทึก & เพิ่มรายการใหม่
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    disabled={isLoading || !isAuthenticated}
                    onClick={(e) => handleSubmit(e, "close")}
                    className="flex-1 h-14 text-base font-semibold bg-success/10 text-success border-success/30 hover:bg-success/20 hover:text-success hover:border-success/40 transition-all"
                  >
                    {isLoading && saveModeRef.current === "close" ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        กำลังสร้าง...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-5 w-5" />
                        บันทึก & เสร็จสิ้น
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <LogPanel logs={logs} onClear={clearLogs} />
            </div>

        {/* Mini History Sidebar */}
        <div ref={historyRef} className="flex flex-col xl:sticky xl:top-20">
          <MiniHistory className="h-full" />
        </div>
      </div>
    )}
    </PageContainer>
  );
}
