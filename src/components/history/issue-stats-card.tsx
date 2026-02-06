/**
 * IssueStatsCard Component
 *
 * Collapsible card showing worklog statistics grouped by issue.
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDurationSeconds } from "@/lib/date-utils";

interface IssueStat {
  key: string;
  summary: string;
  totalSeconds: number;
  count: number;
}

interface IssueStatsCardProps {
  issueStats: IssueStat[];
  defaultExpanded?: boolean;
}

export function IssueStatsCard({
  issueStats,
  defaultExpanded = false,
}: IssueStatsCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (issueStats.length === 0) return null;

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          สรุปงานแยกตาม Task ({issueStats.length} งาน)
        </h2>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {issueStats.map((stat) => (
            <div
              key={stat.key}
              className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {stat.key}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.count} logs
                </div>
              </div>
              <div className="text-sm font-medium line-clamp-2 mb-2 h-10">
                {stat.summary}
              </div>
              <div className="flex items-end justify-between">
                <div className="text-xs text-muted-foreground">ใช้เวลา</div>
                <div className="text-lg font-bold text-success">
                  {formatDurationSeconds(stat.totalSeconds)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
