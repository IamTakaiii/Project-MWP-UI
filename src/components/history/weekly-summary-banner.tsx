/**
 * WeeklySummaryBanner Component
 *
 * Shows weekly worklog completion status with progress bar.
 */

import { CheckCircle2, AlertCircle } from "lucide-react";
import { formatDurationSeconds } from "@/lib/date-utils";

interface WeeklySummary {
  totalSeconds: number;
  targetSeconds: number;
  targetHours: number;
  completeDays: number;
  totalWorkingDays: number;
  isComplete: boolean;
}

interface WeeklySummaryBannerProps {
  summary: WeeklySummary;
}

export function WeeklySummaryBanner({ summary }: WeeklySummaryBannerProps) {
  const progressPercent = Math.min(
    100,
    (summary.totalSeconds / summary.targetSeconds) * 100,
  );
  const remainingSeconds = Math.max(
    0,
    summary.targetSeconds - summary.totalSeconds,
  );

  if (summary.isComplete) {
    return (
      <div className="mb-6 p-5 rounded-2xl border bg-success/10 border-success/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <div>
              <p className="text-lg font-semibold text-success">
                ✅ ครบ {summary.targetHours} ชั่วโมงแล้ว!
              </p>
              <p className="text-sm text-muted-foreground">
                {summary.completeDays} / {summary.totalWorkingDays} วันที่ครบ 8
                ชม.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-3 bg-black/20 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-success w-full" />
            </div>
            <span className="text-sm font-medium text-success">100%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-6 rounded-2xl border-2 border-dashed border-orange-500/50 bg-gradient-to-r from-orange-500/15 via-red-500/15 to-orange-500/15">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <AlertCircle className="h-10 w-10 text-orange-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 text-xl">⚠️</span>
          </div>
          <div>
            <p className="text-xl font-bold text-orange-300">
              🚨 ยังไม่ครบ {summary.targetHours} ชั่วโมง!
            </p>
            <p className="text-muted-foreground">
              {summary.completeDays} / {summary.totalWorkingDays} วันที่ครบ 8
              ชม.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <span className="bg-black/30 px-3 py-1.5 rounded-lg text-sm">
              ลงไปแล้ว:{" "}
              <span className="font-bold text-orange-400">
                {formatDurationSeconds(summary.totalSeconds)}
              </span>
            </span>
            <span>→</span>
            <span className="bg-red-500/20 px-3 py-1.5 rounded-lg text-sm border border-red-500/30">
              ยังเหลือ:{" "}
              <span className="font-bold text-red-400">
                {formatDurationSeconds(remainingSeconds)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 w-full">
            <div className="w-40 h-3 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-bold text-orange-400">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
