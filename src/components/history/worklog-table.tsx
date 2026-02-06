/**
 * WorklogTable Component
 *
 * Reusable table for displaying worklog entries.
 * Responsive: Card layout on mobile, table on desktop.
 */

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTimeRange } from "@/lib/date-utils";
import type { WorklogEntry } from "@/services";

interface WorklogTableProps {
  worklogs: WorklogEntry[];
  jiraUrl: string;
  onEdit: (worklog: WorklogEntry) => void;
  onDelete: (worklog: WorklogEntry) => void;
  onContextMenu?: (e: React.MouseEvent, worklog: WorklogEntry) => void;
}

export function WorklogTable({
  worklogs,
  jiraUrl,
  onEdit,
  onDelete,
  onContextMenu,
}: WorklogTableProps) {
  return (
    <>
      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {worklogs.map((worklog) => (
          <div
            key={worklog.id}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
            onContextMenu={(e) => onContextMenu?.(e, worklog)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <a
                  href={`${jiraUrl}/browse/${worklog.issueKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-semibold text-[#4C9AFF] hover:underline"
                >
                  {worklog.issueKey}
                </a>
                <p className="text-sm mt-1 truncate">{worklog.issueSummary}</p>
                {worklog.comment && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {worklog.comment}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(worklog)}
                  className="h-8 w-8 hover:bg-white/10 hover:text-[#4C9AFF]"
                  title="แก้ไข"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(worklog)}
                  className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                  title="ลบ"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-sm">
              <span className="font-mono text-muted-foreground">
                {formatTimeRange(worklog.started, worklog.timeSpentSeconds)}
              </span>
              <span className="font-semibold">{worklog.timeSpent}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-[100px]">Issue Key</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="w-[130px]">From - To</TableHead>
              <TableHead className="w-[80px] text-right">Time</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {worklogs.map((worklog) => (
              <TableRow
                key={worklog.id}
                className="border-white/10 hover:bg-white/5 relative"
                onContextMenu={(e) => onContextMenu?.(e, worklog)}
              >
                <TableCell className="font-mono font-semibold text-[#4C9AFF]">
                  <a
                    href={`${jiraUrl}/browse/${worklog.issueKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {worklog.issueKey}
                  </a>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {worklog.issueSummary}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[150px] truncate">
                  {worklog.comment || "-"}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatTimeRange(worklog.started, worklog.timeSpentSeconds)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {worklog.timeSpent}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(worklog)}
                      className="h-8 w-8 hover:bg-white/10 hover:text-[#4C9AFF]"
                      title="แก้ไข"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(worklog)}
                      className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                      title="ลบ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
