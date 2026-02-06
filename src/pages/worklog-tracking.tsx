import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Calendar,
  TrendingUp,
  FileText,
  Clock,
  Activity,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components";
import { useWorklogTracking, useAuth } from "@/hooks";
import { validateDateRange } from "@/lib/validation-utils";
import { cn } from "@/lib/utils";
import type {
  WorklogTrackingEntry,
  WorklogTrackingSummaryResponse,
} from "@/services/jira/jira.types";

export function WorklogTrackingPage() {
  // Auth state (using centralized hook)
  const { isAuthenticated, isCheckingAuth } = useAuth();

  // Date filter
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default: last 30 days
    return format(date, "yyyy-MM-dd");
  });
  const [endDate, setEndDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  // Data state
  const [summary, setSummary] =
    useState<WorklogTrackingSummaryResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [issueHistory, setIssueHistory] = useState<WorklogTrackingEntry[]>([]);

  // Hook
  const {
    isLoading,
    error,
    getSummary,
    getFailedSubmissions,
    getIssueHistory,
  } = useWorklogTracking();

  // Validation (using centralized utility)
  const dateValidation = validateDateRange(startDate, endDate);
  const { isValid: isDateRangeValid, isWithinLimit, error: dateError } = dateValidation;

  // Filter history by search query
  const filteredHistory = useMemo(() => {
    if (!summary?.data?.history) return [];
    if (!searchQuery.trim()) return summary.data.history;

    const query = searchQuery.toLowerCase();
    return summary.data.history.filter(
      (entry) =>
        entry.jiraIssueKey.toLowerCase().includes(query) ||
        entry.errorMessage?.toLowerCase().includes(query) ||
        entry.status.toLowerCase().includes(query),
    );
  }, [summary, searchQuery]);

  // Group by date for calendar view
  const dateSubmissions = useMemo(() => {
    if (!summary?.data?.history) return new Map();

    const grouped = new Map<
      string,
      { success: number; failed: number; total: number }
    >();

    summary.data.history.forEach((entry) => {
      const date = entry.worklogDate;
      const current = grouped.get(date) || { success: 0, failed: 0, total: 0 };

      if (entry.status === "success") {
        current.success++;
      } else {
        current.failed++;
      }
      current.total++;

      grouped.set(date, current);
    });

    return grouped;
  }, [summary]);

  // Fetch data
  const fetchData = async () => {
    if (!isAuthenticated || !isDateRangeValid || !isWithinLimit) return;

    const summaryData = await getSummary(startDate, endDate);
    console.log('Summary data received:', summaryData);
    console.log('Summary data structure:', {
      hasData: !!summaryData,
      hasDataProp: !!summaryData?.data,
      dataKeys: summaryData?.data ? Object.keys(summaryData.data) : [],
      failedDates: summaryData?.data?.failedDates,
      history: summaryData?.data?.history
    });
    if (summaryData) {
      setSummary(summaryData);
    }

    // Also fetch failed submissions for additional info
    await getFailedSubmissions(startDate, endDate);
  };

  // Auto fetch on mount
  useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      fetchData();
    }
  }, [isAuthenticated, isCheckingAuth]);

  // Fetch issue history
  const handleViewIssueHistory = async (issueKey: string) => {
    setSelectedIssue(issueKey);
    const history = await getIssueHistory(issueKey);
    if (history) {
      setIssueHistory(history.data);
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
          title="Worklog Tracking"
          description="ตรวจสอบสถานะการส่ง Worklog ไปยัง Jira API"
          icon={<Activity className="h-5 w-5" />}
          iconGradient="from-blue-500 to-purple-500"
        />

        {/* Date Filter */}
        <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">ตัวกรองวันที่</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm text-muted-foreground">
                วันที่เริ่มต้น
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
                className={cn(
                  "w-[180px] bg-black/30 border-white/20",
                  dateError && "border-destructive",
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm text-muted-foreground">
                วันที่สิ้นสุด
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className={cn(
                  "w-[180px] bg-black/30 border-white/20",
                  dateError && "border-destructive",
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm text-muted-foreground">
                ค้นหา Issue / Error
              </Label>
              <div className="relative w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="พิมพ์คำค้นหา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-black/30 border-white/20"
                />
              </div>
            </div>
            <Button
              onClick={fetchData}
              disabled={isLoading || !isAuthenticated || !!dateError}
              className="bg-primary hover:bg-primary/90"
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? "กำลังค้นหา..." : "ค้นหา"}
            </Button>
          </div>
          {dateError && (
            <p className="mt-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {dateError}
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive">
            <p className="font-medium">❌ เกิดข้อผิดพลาด</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* No Auth */}
        {!isAuthenticated && !isCheckingAuth && (
          <div className="text-center py-12 bg-card/50 border border-white/10 rounded-2xl">
            <p className="text-muted-foreground mb-4">
              กรุณาเข้าสู่ระบบก่อน
            </p>
            <Link to="/">
              <Button>ไปหน้า Worklog</Button>
            </Link>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-muted-foreground">กำลังโหลด...</p>
          </div>
        )}

        {/* Summary Cards */}
        {!isLoading && summary?.data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Submissions */}
              <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <span className="text-2xl font-bold">
                    {summary.data.totalSubmissions || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ทั้งหมด (Total)
                </p>
              </div>

              {/* Success Count */}
              <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-2xl font-bold text-success">
                    {summary.data.successCount || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  สำเร็จ (Success)
                </p>
              </div>

              {/* Failed Count */}
              <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="text-2xl font-bold text-destructive">
                    {summary.data.failedCount || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ล้มเหลว (Failed)
                </p>
              </div>

              {/* Success Rate */}
              <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {(summary.data.successRate || 0).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  อัตราสำเร็จ (Success Rate)
                </p>
              </div>
            </div>

            {/* Failed Dates */}
            {summary.data.failedDates && summary.data.failedDates.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  วันที่มีการส่งล้มเหลว ({summary.data.failedDates?.length || 0} วัน)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {summary.data.failedDates.map((date) => (
                    <span
                      key={date}
                      className="px-3 py-1 bg-destructive/20 border border-destructive/40 rounded-lg text-sm font-mono"
                    >
                      {format(parseISO(date), "dd MMM yyyy", { locale: th })}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar View */}
            {dateSubmissions.size > 0 && (
              <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  สถานะการส่งแยกตามวัน
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {Array.from(dateSubmissions.entries())
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([date, stats]) => (
                      <div
                        key={date}
                        className={cn(
                          "p-3 rounded-lg border transition-all hover:scale-105",
                          stats.failed > 0
                            ? "bg-destructive/10 border-destructive/30"
                            : "bg-success/10 border-success/30",
                        )}
                      >
                        <div className="text-xs text-muted-foreground mb-1">
                          {format(parseISO(date), "dd MMM", { locale: th })}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {stats.failed > 0 ? (
                              <XCircle className="h-4 w-4 text-destructive" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-success">
                              ✓ {stats.success}
                            </div>
                            {stats.failed > 0 && (
                              <div className="text-xs text-destructive">
                                ✗ {stats.failed}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* History Table */}
            <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                ประวัติการส่ง ({filteredHistory.length} รายการ)
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead>วันที่ Worklog</TableHead>
                      <TableHead>Issue Key</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>วันที่ส่ง</TableHead>
                      <TableHead>HTTP Status</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Retry</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-muted-foreground py-8"
                        >
                          ไม่พบข้อมูล
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHistory.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className="border-white/10 hover:bg-white/5"
                        >
                          <TableCell className="font-mono text-sm">
                            {format(
                              parseISO(entry.worklogDate),
                              "dd/MM/yyyy",
                            )}
                          </TableCell>
                          <TableCell className="font-mono font-semibold text-[#4C9AFF]">
                            <button
                              onClick={() =>
                                handleViewIssueHistory(entry.jiraIssueKey)
                              }
                              className="hover:underline"
                            >
                              {entry.jiraIssueKey}
                            </button>
                          </TableCell>
                          <TableCell>
                            {entry.status === "success" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/20 text-success rounded text-xs font-medium">
                                <CheckCircle2 className="h-3 w-3" />
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/20 text-destructive rounded text-xs font-medium">
                                <XCircle className="h-3 w-3" />
                                Failed
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(
                              parseISO(entry.executionTimestamp),
                              "dd/MM/yyyy HH:mm",
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {entry.httpStatusCode || "-"}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {entry.errorMessage || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {entry.retryCount > 0 && (
                              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                                {entry.retryCount}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Issue History Modal */}
            {selectedIssue && issueHistory && issueHistory.length > 0 && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-white/10 rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">
                      ประวัติ Issue: {selectedIssue}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedIssue(null);
                        setIssueHistory([]);
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead>วันที่ Worklog</TableHead>
                        <TableHead>วันที่ส่ง</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead>HTTP Status</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issueHistory.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className="border-white/10"
                        >
                          <TableCell className="font-mono text-sm">
                            {format(
                              parseISO(entry.worklogDate),
                              "dd/MM/yyyy",
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {format(
                              parseISO(entry.executionTimestamp),
                              "dd/MM/yyyy HH:mm:ss",
                            )}
                          </TableCell>
                          <TableCell>
                            {entry.status === "success" ? (
                              <span className="text-success text-xs">
                                ✓ Success
                              </span>
                            ) : (
                              <span className="text-destructive text-xs">
                                ✗ Failed
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {entry.httpStatusCode || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.errorMessage || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}
    </PageContainer>
  );
}
