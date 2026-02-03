import { useState, useCallback, useRef } from "react";
import { jiraService } from "@/services";
import { generateDateRange, createWorklogTimestamp } from "@/lib/date-utils";
import type { LogEntry, WorklogResult } from "@/types";

interface WorklogParams {
  taskId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  timeSpent: string;
  skipWeekends: boolean;
  comment: string;
}

/**
 * Custom hook for managing worklog creation
 */
export function useWorklog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  const addLog = useCallback(
    (message: string, type: LogEntry["type"] = "info") => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        { message, type, timestamp, id: Date.now() },
      ]);
    },
    [],
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const createWorklogs = useCallback(
    async ({
      taskId,
      startDate,
      endDate,
      startTime,
      timeSpent,
      skipWeekends,
      comment,
    }: WorklogParams): Promise<WorklogResult> => {
      // Prevent double submission
      if (isSubmittingRef.current) {
        return { success: 0, failed: 0 };
      }

      isSubmittingRef.current = true;
      clearLogs();
      setIsLoading(true);

      try {
        const dates = generateDateRange(startDate, endDate, skipWeekends);

        if (dates.length === 0) {
          addLog("ไม่พบวันที่ในช่วงที่เลือก", "error");
          return { success: 0, failed: 0 };
        }

        addLog(`เริ่มสร้าง worklog สำหรับ ${dates.length} วัน`, "info");

        let successCount = 0;
        let failCount = 0;

        for (const date of dates) {
          const dateStr = date.toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          try {
            const started = createWorklogTimestamp(date, startTime);
            await jiraService.createWorklog(taskId, {
              timeSpent,
              started,
              comment,
            });
            addLog(`✓ สร้าง worklog สำเร็จ: ${dateStr}`, "success");
            successCount++;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            addLog(`✗ ล้มเหลว: ${dateStr} - ${errorMessage}`, "error");
            failCount++;
          }

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        addLog(
          `--- สรุป: สำเร็จ ${successCount} วัน, ล้มเหลว ${failCount} วัน ---`,
          "info",
        );

        return { success: successCount, failed: failCount };
      } finally {
        setIsLoading(false);
        isSubmittingRef.current = false;
      }
    },
    [addLog, clearLogs],
  );

  return {
    logs,
    isLoading,
    addLog,
    clearLogs,
    createWorklogs,
  };
}
