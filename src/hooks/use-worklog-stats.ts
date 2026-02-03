import { useMemo } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { generateDateRange } from "@/lib/date-utils";
import type { WorklogEntry, DailyWorklog } from "@/services";

const EIGHT_HOURS_SECONDS = 8 * 60 * 60;

interface UseWorklogStatsProps {
  worklogs: WorklogEntry[];
  startDate: string;
  endDate: string;
}

export function useWorklogStats({
  worklogs,
  startDate,
  endDate,
}: UseWorklogStatsProps) {
  // Group worklogs by date and include all working days + any other days with worklogs
  const dailyWorklogs = useMemo((): DailyWorklog[] => {
    // First, group worklogs by date
    const grouped: Record<string, WorklogEntry[]> = {};

    for (const worklog of worklogs) {
      const date = worklog.started.split("T")[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(worklog);
    }

    // Get basic working days (Mon-Fri)
    const workingDays =
      startDate && endDate
        ? generateDateRange(startDate, endDate, true) // skipWeekends = true
        : [];

    // Create a Set of dates to include (working days + days with logs)
    const datesToInclude = new Set<string>(
      workingDays.map((d) => format(d, "yyyy-MM-dd")),
    );

    // Add any days that have worklogs (even if weekends)
    Object.keys(grouped).forEach((date) => {
      datesToInclude.add(date);
    });

    // Convert to array and sort
    const sortedDates = Array.from(datesToInclude).sort();

    // Create entries
    const allDays: DailyWorklog[] = sortedDates.map((dateStr) => {
      const logs = grouped[dateStr] || [];
      const totalSeconds = logs.reduce(
        (sum, log) => sum + log.timeSpentSeconds,
        0,
      );

      return {
        date: dateStr,
        dayName: format(new Date(dateStr), "EEEE", { locale: th }),
        worklogs: logs.sort(
          (a, b) =>
            new Date(a.started).getTime() - new Date(b.started).getTime(),
        ),
        totalSeconds,
        isComplete: totalSeconds >= EIGHT_HOURS_SECONDS,
      };
    });

    return allDays;
  }, [worklogs, startDate, endDate]);

  // Weekly summary
  const weeklySummary = useMemo(() => {
    const totalSeconds = worklogs.reduce(
      (sum, log) => sum + log.timeSpentSeconds,
      0,
    );

    // Calculate total working days (excluding weekends) for target calculation
    const workingDays =
      startDate && endDate
        ? generateDateRange(startDate, endDate, true) // skipWeekends = true
        : [];

    const totalWorkingDays = workingDays.length;
    const targetSeconds = totalWorkingDays * EIGHT_HOURS_SECONDS;

    // Days with worklogs (from our processed list)
    // Note: This counts ANY day with worklogs (including weekends)
    const daysWithWorklogs = dailyWorklogs.filter(
      (d) => d.worklogs.length > 0,
    ).length;

    // Days that are complete (8 hours or more)
    const completeDays = dailyWorklogs.filter((d) => d.isComplete).length;

    return {
      totalSeconds,
      targetSeconds,
      isComplete: totalSeconds >= targetSeconds,
      daysWorked: daysWithWorklogs,
      totalWorkingDays, // This is technically "Target Working Days"
      completeDays,
      targetHours: totalWorkingDays * 8,
    };
  }, [worklogs, dailyWorklogs, startDate, endDate]);

  return { dailyWorklogs, weeklySummary };
}
