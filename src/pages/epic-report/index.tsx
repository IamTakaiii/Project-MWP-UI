import { useState, useEffect, useMemo } from "react";
import { jiraService, jiraAuthService } from "@/services";
import { PageContainer, PageHeader } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type {
  EpicWorklogReportResponse,
  ProjectResponse,
  BoardResponse,
  MonthlyReportResponse,
  MonthlyEpicReport,
} from "@/services/jira/jira.types";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  Download,
  BarChart3,
  Users,
  Clock,
  FileSpreadsheet,
  Loader2,
  Search,
  Calendar,
  ChevronDown,
  Layers,
  User,
  FolderKanban,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const USER_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-red-500",
  "from-indigo-500 to-violet-500",
  "from-lime-500 to-green-500",
  "from-fuchsia-500 to-purple-500",
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function formatHours(seconds: number): string {
  return (seconds / 3600).toFixed(1) + "h";
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "violet" | "emerald" | "amber" | "blue";
}) {
  const colors = {
    violet:
      "from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400",
    emerald:
      "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
    amber:
      "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400",
  };
  const iconColors = {
    violet: "bg-violet-500/20 text-violet-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/20 text-amber-400",
    blue: "bg-blue-500/20 text-blue-400",
  };
  return (
    <div
      className={cn("p-4 rounded-2xl bg-gradient-to-br border", colors[color])}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            iconColors[color],
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

// Component for expandable Epic card in monthly report
function MonthlyEpicCard({
  epic,
  defaultExpanded = false,
  jiraUrl,
}: {
  epic: MonthlyEpicReport;
  defaultExpanded?: boolean;
  jiraUrl: string;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden transition-all duration-300",
        isExpanded
          ? "border-primary/30 bg-primary/5"
          : "border-white/10 bg-card/30",
      )}
    >
      {/* Header - Clickable */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <a
                href={`${jiraUrl}/browse/${epic.epicKey}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-mono font-semibold text-primary hover:underline"
              >
                {epic.epicKey}
              </a>
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-[400px]">
              {epic.epicSummary}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right">
            <div className="font-mono font-bold text-emerald-400 text-lg">
              {formatSeconds(epic.totalTimeSeconds)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatHours(epic.totalTimeSeconds)}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {epic.users.slice(0, 4).map((user, idx) => (
              <div
                key={user.accountId}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br -ml-2 first:ml-0 ring-2 ring-background",
                  USER_COLORS[idx % USER_COLORS.length],
                )}
                title={user.displayName}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            ))}
            {epic.users.length > 4 && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-xs font-medium -ml-2 ring-2 ring-background">
                +{epic.users.length - 4}
              </div>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-300",
              isExpanded && "rotate-180",
            )}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
          {epic.users.map((user, idx) => {
            const percentage =
              (user.totalTimeSeconds / epic.totalTimeSeconds) * 100;
            return (
              <div
                key={user.accountId}
                className="p-4 rounded-xl bg-black/20 hover:bg-black/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br shrink-0",
                      USER_COLORS[idx % USER_COLORS.length],
                    )}
                  >
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-lg">
                        {user.displayName}
                      </span>
                      <div className="text-right">
                        <span className="font-mono text-emerald-400 font-bold text-lg">
                          {formatSeconds(user.totalTimeSeconds)}
                        </span>
                        <span className="text-muted-foreground text-sm ml-2">
                          ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    {/* Issues */}
                    <div className="flex flex-wrap gap-2">
                      {user.issues.map((issue) => (
                        <a
                          key={issue.issueKey}
                          href={`${jiraUrl}/browse/${issue.issueKey}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-colors"
                          title={issue.issueSummary}
                        >
                          <span className="font-mono text-primary">
                            {issue.issueKey}
                          </span>
                          <span className="text-emerald-400 font-medium">
                            {formatSeconds(issue.timeSpentSeconds)}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EpicReportPage() {
  const [activeTab, setActiveTab] = useState("monthly-report");

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Epic Reports"
        description="วิเคราะห์ worklog และ performance ของทีม"
        icon={<BarChart3 className="h-5 w-5" />}
        iconGradient="from-violet-500 to-purple-600"
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-black/30 border border-white/10 p-1.5 h-auto">
          <TabsTrigger
            value="monthly-report"
            className="gap-2 px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500"
          >
            <Calendar className="h-4 w-4" />
            Monthly Report
          </TabsTrigger>
          <TabsTrigger
            value="epic-report"
            className="gap-2 px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Single Epic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly-report" className="space-y-6">
          <MonthlyReportTab />
        </TabsContent>

        <TabsContent value="epic-report" className="space-y-6">
          <SingleEpicReportTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function MonthlyReportTab() {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<"my" | "all">(() => {
    const saved = localStorage.getItem("epic-report-mode");
    return saved === "my" || saved === "all" ? saved : "my";
  });
  const [filterType, setFilterType] = useState<"board" | "project">(() => {
    const saved = localStorage.getItem("epic-report-filter-type");
    return saved === "board" || saved === "project" ? saved : "board";
  });
  const [projectKey, setProjectKey] = useState(
    () => localStorage.getItem("epic-report-project") || "",
  );
  const [boardId, setBoardId] = useState(
    () => localStorage.getItem("epic-report-board") || "",
  );
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [monthlyReport, setMonthlyReport] =
    useState<MonthlyReportResponse | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [jiraUrl, setJiraUrl] = useState("");

  // Save selections to localStorage
  useEffect(() => {
    localStorage.setItem("epic-report-mode", mode);
  }, [mode]);
  useEffect(() => {
    localStorage.setItem("epic-report-filter-type", filterType);
  }, [filterType]);
  useEffect(() => {
    if (projectKey) localStorage.setItem("epic-report-project", projectKey);
  }, [projectKey]);
  useEffect(() => {
    if (boardId) localStorage.setItem("epic-report-board", boardId);
  }, [boardId]);

  // Reset report when mode or filter changes
  const handleModeChange = (newMode: "my" | "all") => {
    setMode(newMode);
    setMonthlyReport(null);
    setError("");
  };

  const handleFilterTypeChange = (newFilterType: "board" | "project") => {
    setFilterType(newFilterType);
    setMonthlyReport(null);
    setError("");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingOptions(true);
      try {
        const [projectsData, boardsData, sessionData] = await Promise.all([
          jiraService.fetchMyProjects(),
          jiraService.fetchBoards(),
          jiraAuthService.getCurrentSession(),
        ]);
        setProjects(projectsData);
        setBoards(boardsData);
        if (sessionData.jiraUrl) {
          setJiraUrl(sessionData.jiraUrl);
        }
      } catch {
        // Silently fail
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchData();
  }, []);

  const handlePreview = async () => {
    setLoadingReport(true);
    setError("");
    setMonthlyReport(null);
    try {
      const date = new Date(month);
      const startDate = format(startOfMonth(date), "yyyy-MM-dd");
      const endDate = format(endOfMonth(date), "yyyy-MM-dd");

      let report: MonthlyReportResponse;

      if (mode === "my") {
        report = await jiraService.fetchMonthlyReport(startDate, endDate);
      } else if (filterType === "board") {
        if (!boardId) {
          toast.error("กรุณาเลือก Board");
          setLoadingReport(false);
          return;
        }
        console.log(
          "Fetching report for boardId:",
          boardId,
          "as number:",
          Number(boardId),
        );
        report = await jiraService.fetchMonthlyReportByBoard(
          Number(boardId),
          startDate,
          endDate,
        );
      } else {
        if (!projectKey) {
          toast.error("กรุณาเลือก Project");
          setLoadingReport(false);
          return;
        }
        report = await jiraService.fetchMonthlyReportByProject(
          projectKey,
          startDate,
          endDate,
        );
      }

      setMonthlyReport(report);
    } catch (err) {
      setError((err as Error)?.message || "Failed to fetch report");
    } finally {
      setLoadingReport(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const date = new Date(month);
      const startDate = format(startOfMonth(date), "yyyy-MM-dd");
      const endDate = format(endOfMonth(date), "yyyy-MM-dd");

      let blob: Blob;
      let filename: string;

      if (mode === "my") {
        blob = await jiraService.exportMonthlyReport(startDate, endDate);
        filename = `my-epics-report-${month}.xlsx`;
      } else if (filterType === "board") {
        if (!boardId) {
          toast.error("กรุณาเลือก Board");
          setExporting(false);
          return;
        }
        blob = await jiraService.exportMonthlyReportByBoard(
          Number(boardId),
          startDate,
          endDate,
        );
        const selectedBoard = boards.find((b) => b.id === Number(boardId));
        filename = `board-report-${selectedBoard?.name || boardId}-${month}.xlsx`;
      } else {
        if (!projectKey) {
          toast.error("กรุณาเลือก Project");
          setExporting(false);
          return;
        }
        blob = await jiraService.exportMonthlyReportByProject(
          projectKey,
          startDate,
          endDate,
        );
        filename = `project-report-${projectKey}-${month}.xlsx`;
      }

      downloadBlob(blob, filename);
      toast.success("ดาวน์โหลดไฟล์ Excel สำเร็จ");
    } catch {
      toast.error("ไม่สามารถ export ได้");
    } finally {
      setExporting(false);
    }
  };

  const canAction =
    mode === "my" || (filterType === "board" ? !!boardId : !!projectKey);
  const uniqueContributors = monthlyReport
    ? new Set(
        monthlyReport.epics.flatMap((e) => e.users.map((u) => u.accountId)),
      ).size
    : 0;

  // Prepare options for SearchableSelect
  const boardOptions = useMemo(
    () =>
      boards.map((board) => ({
        value: String(board.id),
        label: board.name,
        sublabel: board.projectKey ? `Project: ${board.projectKey}` : undefined,
      })),
    [boards],
  );

  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        value: project.key,
        label: `${project.key} - ${project.name}`,
        sublabel: project.name,
      })),
    [projects],
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Filter Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 border border-white/10 backdrop-blur-sm">
        <div className="space-y-5">
          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleModeChange("my")}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-300 text-left",
                mode === "my"
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-white/10 hover:border-white/20 bg-black/20",
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    mode === "my" ? "bg-emerald-500/20" : "bg-white/10",
                  )}
                >
                  <User
                    className={cn(
                      "w-5 h-5",
                      mode === "my"
                        ? "text-emerald-400"
                        : "text-muted-foreground",
                    )}
                  />
                </div>
                <div>
                  <div
                    className={cn(
                      "font-semibold",
                      mode === "my" && "text-emerald-400",
                    )}
                  >
                    My Epics
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Epic ที่ฉันลง worklog
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => handleModeChange("all")}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-300 text-left",
                mode === "all"
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-white/10 hover:border-white/20 bg-black/20",
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    mode === "all" ? "bg-violet-500/20" : "bg-white/10",
                  )}
                >
                  <Users
                    className={cn(
                      "w-5 h-5",
                      mode === "all"
                        ? "text-violet-400"
                        : "text-muted-foreground",
                    )}
                  />
                </div>
                <div>
                  <div
                    className={cn(
                      "font-semibold",
                      mode === "all" && "text-violet-400",
                    )}
                  >
                    All Epics
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ทุก Epic ใน Board/Project
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* All Epics Options */}
          {mode === "all" && (
            <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterTypeChange("board")}
                    className={cn(
                      "rounded-md px-4 gap-2",
                      filterType === "board" &&
                        "bg-violet-500 text-white hover:bg-violet-500 hover:text-white",
                    )}
                  >
                    <FolderKanban className="w-4 h-4" />
                    Board
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterTypeChange("project")}
                    className={cn(
                      "rounded-md px-4 gap-2",
                      filterType === "project" &&
                        "bg-violet-500 text-white hover:bg-violet-500 hover:text-white",
                    )}
                  >
                    <Layers className="w-4 h-4" />
                    Project
                  </Button>
                </div>
              </div>
              {filterType === "board" ? (
                <SearchableSelect
                  value={boardId}
                  onChange={setBoardId}
                  options={boardOptions}
                  placeholder="เลือก Board"
                  searchPlaceholder="ค้นหา Board..."
                  loading={loadingOptions}
                />
              ) : (
                <SearchableSelect
                  value={projectKey}
                  onChange={setProjectKey}
                  options={projectOptions}
                  placeholder="เลือก Project"
                  searchPlaceholder="ค้นหา Project..."
                  loading={loadingOptions}
                />
              )}
            </div>
          )}

          {/* Month & Actions */}
          <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-[180px] bg-black/30 border-white/10"
              />
            </div>
            <div className="flex-1" />
            <Button
              onClick={handlePreview}
              disabled={loadingReport || !canAction}
              variant="outline"
              className="gap-2 border-white/20"
            >
              {loadingReport ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loadingReport ? "กำลังโหลด..." : "ดูผลลัพธ์บนหน้าเว็บ"}
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting || !canAction}
              className={cn(
                "gap-2",
                mode === "my"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  : "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600",
              )}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? "กำลัง Export..." : "Export Excel"}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* Report Preview */}
      {monthlyReport && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={Layers}
              label="Epics"
              value={monthlyReport.epics.length}
              color="violet"
            />
            <StatCard
              icon={Clock}
              label="Total Time"
              value={formatSeconds(monthlyReport.totalTimeSeconds)}
              color="emerald"
            />
            <StatCard
              icon={Users}
              label="Contributors"
              value={uniqueContributors}
              color="amber"
            />
          </div>

          {/* Epics List */}
          {monthlyReport.epics.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                รายละเอียด Epics ({monthlyReport.epics.length})
              </h3>
              {monthlyReport.epics.map((epic, idx) => (
                <MonthlyEpicCard
                  key={epic.epicKey}
                  epic={epic}
                  defaultExpanded={idx === 0}
                  jiraUrl={jiraUrl}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-card/30">
              <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                ไม่พบ Epic ในช่วงเวลาที่เลือก
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!monthlyReport && !loadingReport && !error && (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-card/30">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-primary/50" />
          </div>
          <p className="text-muted-foreground font-medium">
            เลือกเดือนและกด "ดูตัวอย่าง" เพื่อดูรายงาน
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            หรือกด "Export Excel" เพื่อดาวน์โหลดไฟล์
          </p>
        </div>
      )}
    </div>
  );
}

function SingleEpicReportTab() {
  const [epicKey, setEpicKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<EpicWorklogReportResponse | null>(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleGenerate = async () => {
    if (!epicKey) return;
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const data = await jiraService.fetchEpicWorklogReport(epicKey);
      setReport(data);
    } catch (err) {
      setError((err as Error)?.message || "Failed to fetch report.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!epicKey) return;
    setExporting(true);
    try {
      const blob = await jiraService.exportEpicReport(epicKey);
      downloadBlob(blob, `epic-report-${epicKey}.xlsx`);
      toast.success("ดาวน์โหลดไฟล์ Excel สำเร็จ");
    } catch {
      toast.error("ไม่สามารถ export ได้");
    } finally {
      setExporting(false);
    }
  };

  const usersWithPercentage =
    report?.users.map((user, index) => ({
      ...user,
      percentage:
        report.totalTimeSeconds > 0
          ? (user.totalTimeSeconds / report.totalTimeSeconds) * 100
          : 0,
      color: USER_COLORS[index % USER_COLORS.length],
    })) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Search Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold">Single Epic Report</h2>
              <p className="text-sm text-muted-foreground">
                ดูรายละเอียด worklog ของ Epic เดียว
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Epic Key (e.g. PROJ-123)"
              value={epicKey}
              onChange={(e) => setEpicKey(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              className="max-w-xs bg-black/30 border-white/10 font-mono text-lg"
            />
            <Button
              onClick={handleGenerate}
              disabled={loading || !epicKey.trim()}
              className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? "กำลังโหลด..." : "ค้นหา"}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* Report Display */}
      {report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={FileSpreadsheet}
              label="Issues"
              value={report.totalIssues}
              color="blue"
            />
            <StatCard
              icon={Clock}
              label="Total Time"
              value={formatSeconds(report.totalTimeSeconds)}
              color="emerald"
            />
            <StatCard
              icon={Users}
              label="Contributors"
              value={report.users.length}
              color="violet"
            />
          </div>

          {/* Contribution Chart */}
          {usersWithPercentage.length > 0 && (
            <div className="p-6 rounded-2xl bg-card/50 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Contribution Overview
                </h3>
                <Button
                  onClick={handleExport}
                  disabled={exporting}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Export
                </Button>
              </div>
              <div className="h-4 rounded-full overflow-hidden flex mb-4 bg-black/30">
                {usersWithPercentage.map((user) => (
                  <div
                    key={user.accountId}
                    className={cn(
                      "h-full bg-gradient-to-r transition-all duration-500",
                      user.color,
                    )}
                    style={{ width: `${user.percentage}%` }}
                    title={`${user.displayName}: ${user.percentage.toFixed(1)}%`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {usersWithPercentage.map((user) => (
                  <div
                    key={user.accountId}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/20"
                  >
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full bg-gradient-to-r",
                        user.color,
                      )}
                    />
                    <span className="text-sm">{user.displayName}</span>
                    <span className="text-xs text-muted-foreground">
                      ({user.percentage.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contributors Table */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-card/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-black/30 hover:bg-black/30">
                  <TableHead className="w-[250px]">Contributor</TableHead>
                  <TableHead className="w-[200px]">Time & Progress</TableHead>
                  <TableHead>Tasks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersWithPercentage.map((user) => (
                  <TableRow key={user.accountId} className="hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-semibold",
                            user.color,
                          )}
                        >
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{user.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-emerald-400">
                            {formatSeconds(user.totalTimeSeconds)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-black/30">
                          <div
                            className={cn(
                              "h-full bg-gradient-to-r",
                              user.color,
                            )}
                            style={{ width: `${user.percentage}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {user.issues.map((issue) => (
                          <span
                            key={issue}
                            className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!report && !loading && !error && (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-card/30">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="h-8 w-8 text-blue-400/50" />
          </div>
          <p className="text-muted-foreground font-medium">
            ใส่ Epic Key เพื่อดูรายงาน
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            เช่น PROJ-123, ABC-456
          </p>
        </div>
      )}
    </div>
  );
}
