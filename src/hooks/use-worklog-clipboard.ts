/**
 * useWorklogClipboard Hook
 *
 * Centralized worklog copy/paste functionality.
 * Eliminates duplicate clipboard logic across pages.
 */

import { useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { STORAGE_KEYS, DELAYS } from "@/lib/constants";
import type { WorklogEntry } from "@/services";

/**
 * Worklog data structure for clipboard
 */
export interface WorklogClipboardData {
  issueKey: string;
  timeSpent: string;
  date: string;
  startTime: string;
  comment: string;
}

/**
 * Hook return type
 */
export interface UseWorklogClipboardReturn {
  copyWorklog: (worklog: WorklogEntry) => void;
  pasteWorklog: () => WorklogClipboardData | null;
  hasCopiedWorklog: () => boolean;
  clearCopiedWorklog: () => void;
  prepareForDuplicate: (worklog: WorklogEntry) => WorklogClipboardData;
}

/**
 * Hook for managing worklog clipboard operations
 */
export function useWorklogClipboard(): UseWorklogClipboardReturn {
  /**
   * Copy worklog to clipboard and localStorage
   */
  const copyWorklog = useCallback((worklog: WorklogEntry) => {
    // Copy text to system clipboard
    const worklogText = `${worklog.issueKey} | ${worklog.timeSpent} | ${format(new Date(worklog.started), "dd/MM/yyyy HH:mm")} | ${worklog.comment || "-"}`;
    navigator.clipboard.writeText(worklogText);

    // Store worklog data in localStorage for paste functionality
    const worklogData: WorklogClipboardData = {
      issueKey: worklog.issueKey,
      timeSpent: worklog.timeSpent,
      date: format(new Date(worklog.started), "yyyy-MM-dd"),
      startTime: format(new Date(worklog.started), "HH:mm"),
      comment: worklog.comment || "",
    };
    localStorage.setItem(
      STORAGE_KEYS.COPIED_WORKLOG,
      JSON.stringify(worklogData),
    );

    toast.success("คัดลอกข้อมูล worklog แล้ว", {
      description: `${worklog.issueKey} - ${worklog.timeSpent} • คลิกปุ่ม "วางข้อมูล" ในหน้า Worklog เพื่อใช้`,
      duration: DELAYS.TOAST_DURATION,
    });
  }, []);

  /**
   * Paste worklog from localStorage
   * Returns null if no data or invalid data
   */
  const pasteWorklog = useCallback((): WorklogClipboardData | null => {
    const copiedWorklogStr = localStorage.getItem(STORAGE_KEYS.COPIED_WORKLOG);
    if (!copiedWorklogStr) {
      toast.info("ไม่มีข้อมูลที่คัดลอก", {
        description: "กรุณาคัดลอก worklog จากหน้า History ก่อน",
      });
      return null;
    }

    try {
      const copiedWorklog = JSON.parse(copiedWorklogStr) as WorklogClipboardData;
      // Clear copied data after using
      localStorage.removeItem(STORAGE_KEYS.COPIED_WORKLOG);

      toast.success("วางข้อมูล worklog แล้ว", {
        description: `Task: ${copiedWorklog.issueKey}`,
      });

      return copiedWorklog;
    } catch {
      toast.error("ไม่สามารถวางข้อมูลได้", {
        description: "ข้อมูลที่คัดลอกไม่ถูกต้อง",
      });
      localStorage.removeItem(STORAGE_KEYS.COPIED_WORKLOG);
      return null;
    }
  }, []);

  /**
   * Check if there's copied worklog data
   */
  const hasCopiedWorklog = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.COPIED_WORKLOG) !== null;
  }, []);

  /**
   * Clear copied worklog data
   */
  const clearCopiedWorklog = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.COPIED_WORKLOG);
  }, []);

  /**
   * Prepare worklog data for duplication
   * Stores in localStorage and returns the data
   */
  const prepareForDuplicate = useCallback(
    (worklog: WorklogEntry): WorklogClipboardData => {
      const worklogData: WorklogClipboardData = {
        issueKey: worklog.issueKey,
        timeSpent: worklog.timeSpent,
        date: format(new Date(worklog.started), "yyyy-MM-dd"),
        startTime: format(new Date(worklog.started), "HH:mm"),
        comment: worklog.comment || "",
      };

      localStorage.setItem(
        STORAGE_KEYS.COPIED_WORKLOG,
        JSON.stringify(worklogData),
      );

      toast.success("เตรียมข้อมูลสำหรับสร้างซ้ำแล้ว", {
        description: `${worklog.issueKey} - ${worklog.timeSpent} • สามารถใช้ปุ่ม "วางข้อมูล" ในหน้า Worklog ได้`,
        duration: DELAYS.TOAST_DURATION,
      });

      return worklogData;
    },
    [],
  );

  return {
    copyWorklog,
    pasteWorklog,
    hasCopiedWorklog,
    clearCopiedWorklog,
    prepareForDuplicate,
  };
}

/**
 * Utility function to get copied worklog without toast
 * Useful for auto-fill on page load
 */
export function getCopiedWorklogSilent(): WorklogClipboardData | null {
  const copiedWorklogStr = localStorage.getItem(STORAGE_KEYS.COPIED_WORKLOG);
  if (!copiedWorklogStr) return null;

  try {
    return JSON.parse(copiedWorklogStr) as WorklogClipboardData;
  } catch {
    localStorage.removeItem(STORAGE_KEYS.COPIED_WORKLOG);
    return null;
  }
}
