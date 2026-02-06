/**
 * Validation Utilities
 *
 * Centralized validation functions for forms and data.
 * Eliminates duplicate validation logic across components.
 */

import { differenceInDays, parseISO } from "date-fns";
import { LIMITS } from "./constants";

/**
 * Date range validation result
 */
export interface DateRangeValidation {
  isValid: boolean;
  isWithinLimit: boolean;
  days: number;
  error: string | null;
}

/**
 * Validate date range
 * Checks if start date is before end date and within max days limit
 */
export function validateDateRange(
  startDate: string,
  endDate: string,
  maxDays: number = LIMITS.MAX_DATE_RANGE_DAYS,
): DateRangeValidation {
  if (!startDate || !endDate) {
    return {
      isValid: false,
      isWithinLimit: false,
      days: 0,
      error: "กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด",
    };
  }

  const isValid = startDate <= endDate;
  const days = differenceInDays(parseISO(endDate), parseISO(startDate));
  const isWithinLimit = days <= maxDays;

  let error: string | null = null;
  if (!isValid) {
    error = "วันที่เริ่มต้นต้องน้อยกว่าหรือเท่ากับวันที่สิ้นสุด";
  } else if (!isWithinLimit) {
    error = `ช่วงวันที่ต้องไม่เกิน ${maxDays} วัน`;
  }

  return {
    isValid,
    isWithinLimit,
    days,
    error,
  };
}

/**
 * Validate required field
 */
export function validateRequired(
  value: string | undefined | null,
  fieldName: string,
): string | null {
  if (!value || !value.trim()) {
    return `กรุณาระบุ ${fieldName}`;
  }
  return null;
}

/**
 * Validate worklog form data
 */
export interface WorklogFormValidation {
  isValid: boolean;
  errors: {
    taskId?: string;
    startDate?: string;
    timeSpent?: string;
  };
}

export function validateWorklogForm(data: {
  taskId: string;
  startDate: string;
  timeSpent: string;
}): WorklogFormValidation {
  const errors: WorklogFormValidation["errors"] = {};

  const taskIdError = validateRequired(data.taskId, "Task ID");
  if (taskIdError) errors.taskId = taskIdError;

  const startDateError = validateRequired(data.startDate, "วันที่");
  if (startDateError) errors.startDate = startDateError;

  const timeSpentError = validateRequired(data.timeSpent, "ระยะเวลา");
  if (timeSpentError) errors.timeSpent = timeSpentError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
