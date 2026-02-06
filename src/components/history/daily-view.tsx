/**
 * DailyView Component
 *
 * Daily view for worklog history with navigation.
 */

import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDurationSeconds } from "@/lib/date-utils";
import { LIMITS } from "@/lib/constants";
import { WorklogTable } from "./worklog-table";
import type { WorklogEntry } from "@/services";

interface DailyWorklog {
  date: string;
  worklogs: WorklogEntry[];
  totalSeconds: number;
  isComplete: boolean;
}

interface DailyViewProps {
  currentDay: DailyWorklog;
  currentDayIndex: number;
  totalDays: number;
  jiraUrl: string;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onEdit: (worklog: WorklogEntry) => void;
  onDelete: (worklog: WorklogEntry) => void;
  onCopyDailySummary: () => void;
  onContextMenu?: (e: React.MouseEvent, worklog: WorklogEntry) => void;
}

export function DailyView({
  currentDay,
  currentDayIndex,
  totalDays,
  jiraUrl,
  onPreviousDay,
  onNextDay,
  onEdit,
  onDelete,
  onCopyDailySummary,
  onContextMenu,
}: DailyViewProps) {
  const remainingSeconds = LIMITS.EIGHT_HOURS_SECONDS - currentDay.totalSeconds;

  return (
    <div
      className={cn(
        "bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden",
        currentDay.isComplete
          ? "border border-white/10"
          : "border-2 border-orange-500/50",
      )}
    >
      {/* Day Header */}
      <div
        className={cn(
          "p-4 md:p-5 border-b",
          currentDay.isComplete
            ? "bg-success/10 border-white/10"
            : "bg-gradient-to-r from-orange-500/20 via-red-500/15 to-orange-500/20 border-orange-500/30",
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg md:text-xl font-bold">
              วันที่: {format(new Date(currentDay.date), "dd/MM/yyyy")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(currentDay.date), "EEEE", { locale: th })}
            </p>
          </div>
          {currentDay.isComplete ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="font-semibold text-success">ครบ 8 ชม.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-3 bg-orange-500/20 px-3 md:px-4 py-2 rounded-xl border border-orange-500/40 self-start md:self-auto">
              <span className="text-lg md:text-xl animate-pulse">🚨</span>
              <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-orange-400 animate-bounce" />
              <div className="text-right">
                <p className="font-bold text-orange-300 text-sm md:text-base">ยังไม่ครบ 8 ชม.!</p>
                <p className="text-xs text-orange-400/80">
                  เหลืออีก {formatDurationSeconds(remainingSeconds)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary & Navigation */}
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3 md:space-y-0">
          {/* Mobile Layout - Stacked */}
          <div className="md:hidden space-y-3">
            {/* Summary Row */}
            <div className="flex items-center justify-between">
              <p className="text-sm">
                รวมเวลาวันนี้:{" "}
                <span
                  className={cn(
                    "font-semibold",
                    currentDay.isComplete ? "text-success" : "text-orange-400",
                  )}
                >
                  {formatDurationSeconds(currentDay.totalSeconds)}
                </span>{" "}
                / 8h
              </p>
              <span className="text-sm text-muted-foreground">
                {currentDay.worklogs.length} รายการ
              </span>
            </div>
            {/* Actions Row */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={onCopyDailySummary}
                disabled={currentDay.worklogs.length === 0}
                className="gap-1.5 border-white/20 hover:bg-white/10 hover:border-primary/50"
                title="คัดลอกสรุปงานวันนี้"
              >
                <ClipboardList className="h-4 w-4" />
                สรุปงาน
              </Button>
              {/* Navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onPreviousDay}
                  disabled={currentDayIndex <= 0}
                  className="h-8 w-8 border-white/20 hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-1 whitespace-nowrap">
                  {currentDayIndex + 1}/{totalDays}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onNextDay}
                  disabled={currentDayIndex >= totalDays - 1}
                  className="h-8 w-8 border-white/20 hover:bg-white/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Single Row */}
          <div className="hidden md:flex md:items-center md:justify-between">
            {/* Summary */}
            <div className="flex items-center gap-3">
              <p className="text-sm">
                รวมเวลาวันนี้:{" "}
                <span
                  className={cn(
                    "font-semibold",
                    currentDay.isComplete ? "text-success" : "text-orange-400",
                  )}
                >
                  {formatDurationSeconds(currentDay.totalSeconds)}
                </span>{" "}
                / 8h
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onCopyDailySummary}
                disabled={currentDay.worklogs.length === 0}
                className="gap-1.5 border-white/20 hover:bg-white/10 hover:border-primary/50"
                title="คัดลอกสรุปงานวันนี้"
              >
                <ClipboardList className="h-4 w-4" />
                สรุปงาน
              </Button>
            </div>
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                ทั้งหมด {currentDay.worklogs.length} รายการ
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviousDay}
                disabled={currentDayIndex <= 0}
                className="gap-1 border-white/20 hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
                วันก่อนหน้า
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                ({currentDayIndex + 1} / {totalDays})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onNextDay}
                disabled={currentDayIndex >= totalDays - 1}
                className="gap-1 border-white/20 hover:bg-white/10"
              >
                วันถัดไป
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Worklog Table */}
      <div className="p-5">
        <WorklogTable
          worklogs={currentDay.worklogs}
          jiraUrl={jiraUrl}
          onEdit={onEdit}
          onDelete={onDelete}
          onContextMenu={onContextMenu}
        />
      </div>
    </div>
  );
}
