/**
 * DateFilterCard Component
 *
 * Reusable date filter card for history and tracking pages.
 * Includes date range inputs, search, and action buttons.
 */

import { Search, Calendar, CalendarDays, AlertCircle, Download } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LIMITS } from "@/lib/constants";

type ViewMode = "daily" | "weekly";

interface DateFilterCardProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  onFetch: () => void;
  onExport?: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasData?: boolean;
  showViewToggle?: boolean;
  showExport?: boolean;
  searchPlaceholder?: string;
  searchLabel?: string;
}

export function DateFilterCard({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  searchQuery = "",
  onSearchChange,
  viewMode = "daily",
  onViewModeChange,
  onFetch,
  onExport,
  isLoading,
  isAuthenticated,
  hasData = false,
  showViewToggle = true,
  showExport = true,
  searchPlaceholder = "พิมพ์คำค้นหา...",
  searchLabel = "ค้นหา (Issue, Summary, Comment)",
}: DateFilterCardProps) {
  // Validation
  const isDateRangeValid = startDate <= endDate;
  const dateRangeDays =
    startDate && endDate
      ? differenceInDays(parseISO(endDate), parseISO(startDate))
      : 0;
  const isWithinLimit = dateRangeDays <= LIMITS.MAX_DATE_RANGE_DAYS;
  const dateError = !isDateRangeValid
    ? "วันที่เริ่มต้นต้องน้อยกว่าหรือเท่ากับวันที่สิ้นสุด"
    : !isWithinLimit
      ? `ช่วงวันที่ต้องไม่เกิน ${LIMITS.MAX_DATE_RANGE_DAYS} วัน`
      : null;

  const handleStartDateChange = (newStartDate: string) => {
    onStartDateChange(newStartDate);
    // Auto-adjust end date if range exceeds limit
    if (endDate && newStartDate) {
      const daysDiff = differenceInDays(parseISO(endDate), parseISO(newStartDate));
      if (daysDiff > LIMITS.MAX_DATE_RANGE_DAYS) {
        const adjustedEndDate = new Date(parseISO(newStartDate));
        adjustedEndDate.setDate(adjustedEndDate.getDate() + LIMITS.MAX_DATE_RANGE_DAYS);
        onEndDateChange(format(adjustedEndDate, "yyyy-MM-dd"));
      }
    }
  };

  const handleEndDateChange = (newEndDate: string) => {
    // Auto-adjust start date if range exceeds limit
    if (startDate && newEndDate) {
      const daysDiff = differenceInDays(parseISO(newEndDate), parseISO(startDate));
      if (daysDiff > LIMITS.MAX_DATE_RANGE_DAYS) {
        const adjustedStartDate = new Date(parseISO(newEndDate));
        adjustedStartDate.setDate(adjustedStartDate.getDate() - LIMITS.MAX_DATE_RANGE_DAYS);
        onStartDateChange(format(adjustedStartDate, "yyyy-MM-dd"));
      }
    }
    onEndDateChange(newEndDate);
  };

  const getMaxEndDate = () => {
    if (!startDate) return undefined;
    const maxDate = new Date(parseISO(startDate));
    maxDate.setDate(maxDate.getDate() + LIMITS.MAX_DATE_RANGE_DAYS);
    return format(maxDate, "yyyy-MM-dd");
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">ตัวกรองวันที่</h2>
        {/* View Mode Toggle */}
        {showViewToggle && onViewModeChange && (
          <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange("daily")}
              className={cn(
                "gap-2 rounded-md",
                viewMode === "daily" &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              <Calendar className="h-4 w-4" />
              รายวัน
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange("weekly")}
              className={cn(
                "gap-2 rounded-md",
                viewMode === "weekly" &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              <CalendarDays className="h-4 w-4" />
              รายสัปดาห์
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm text-muted-foreground">
            วันที่เริ่มต้น (Start Date)
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            max={endDate}
            className={cn(
              "w-[180px] bg-black/30 border-white/20 focus:border-primary",
              dateError && "border-destructive focus:border-destructive",
            )}
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-sm text-muted-foreground">
            วันที่สิ้นสุด (End Date)
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            min={startDate}
            max={getMaxEndDate()}
            className={cn(
              "w-[180px] bg-black/30 border-white/20 focus:border-primary",
              dateError && "border-destructive focus:border-destructive",
            )}
          />
        </div>

        {/* Search Input */}
        {onSearchChange && (
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm text-muted-foreground">
              {searchLabel}
            </Label>
            <div className="relative w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-black/30 border-white/20 focus:border-primary"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-white/10"
                  onClick={() => onSearchChange("")}
                >
                  <span className="sr-only">Clear</span>
                  <span className="text-xs">✕</span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Fetch Button */}
        <Button
          onClick={onFetch}
          disabled={isLoading || !isAuthenticated || !!dateError}
          className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
        >
          <Search className="h-4 w-4 mr-2" />
          {isLoading ? "กำลังค้นหา..." : "Fetch Data"}
        </Button>

        {/* Export Button */}
        {showExport && onExport && (
          <Button
            onClick={onExport}
            disabled={isLoading || !isAuthenticated || !!dateError || !hasData}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        )}
      </div>

      {/* Date validation error */}
      {dateError && (
        <p className="mt-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {dateError}
        </p>
      )}
    </div>
  );
}
