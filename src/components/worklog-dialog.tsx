import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WorklogEntry } from "@/types";

interface WorklogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorklogFormData) => Promise<void>;
  worklog?: WorklogEntry | null; // null = create new, WorklogEntry = edit
  issueKey?: string;
  issueSummary?: string;
}

export interface WorklogFormData {
  issueKey: string;
  date: string;
  startTime: string;
  timeSpent: string;
  comment: string;
}

export function WorklogDialog({
  isOpen,
  onClose,
  onSave,
  worklog,
  issueKey = "",
  issueSummary = "",
}: WorklogDialogProps) {
  const isEdit = !!worklog;

  const [formData, setFormData] = useState<WorklogFormData>({
    issueKey: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    timeSpent: "1h",
    comment: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (worklog) {
        // Edit mode - populate from worklog
        const startDate = new Date(worklog.started);
        setFormData({
          issueKey: worklog.issueKey,
          date: format(startDate, "yyyy-MM-dd"),
          startTime: format(startDate, "HH:mm"),
          timeSpent: worklog.timeSpent,
          comment: worklog.comment || "",
        });
      } else {
        // Create mode
        setFormData({
          issueKey: issueKey,
          date: format(new Date(), "yyyy-MM-dd"),
          startTime: "09:00",
          timeSpent: "1h",
          comment: "",
        });
      }
      setError(null);
    }
  }, [isOpen, worklog, issueKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.issueKey.trim()) {
      setError("กรุณาระบุ Issue Key");
      return;
    }

    if (!formData.timeSpent.trim()) {
      setError("กรุณาระบุเวลา");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {isEdit ? "✏️ แก้ไข Worklog" : "➕ เพิ่ม Worklog"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Issue info (if editing) */}
        {isEdit && issueSummary && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-muted-foreground">Task</p>
            <p className="font-mono text-[#4C9AFF]">{worklog?.issueKey}</p>
            <p className="text-sm truncate">{issueSummary}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Issue Key (only for create) */}
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="issueKey">Issue Key *</Label>
              <Input
                id="issueKey"
                placeholder="เช่น ADM-17"
                value={formData.issueKey}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    issueKey: e.target.value.toUpperCase(),
                  })
                }
                className="bg-black/30 border-white/20"
              />
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">วันที่ *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="bg-black/30 border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">เวลาเริ่ม</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="bg-black/30 border-white/20"
              />
            </div>
          </div>

          {/* Time Spent */}
          <div className="space-y-2">
            <Label htmlFor="timeSpent">ระยะเวลา *</Label>
            <Input
              id="timeSpent"
              placeholder="เช่น 1h, 30m, 1h 30m"
              value={formData.timeSpent}
              onChange={(e) =>
                setFormData({ ...formData, timeSpent: e.target.value })
              }
              className="bg-black/30 border-white/20"
            />
            <p className="text-xs text-muted-foreground">
              รูปแบบ: 1h, 30m, 1h 30m, 1d
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              placeholder="รายละเอียดงาน (ไม่บังคับ)"
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              className="bg-black/30 border-white/20 min-h-[80px]"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20"
              disabled={isLoading}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "⏳ กำลังบันทึก..." : isEdit ? "บันทึก" : "เพิ่ม"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Confirm Delete Dialog
interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  worklog: WorklogEntry | null;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  worklog,
}: DeleteConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !worklog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">🗑️ ยืนยันการลบ</h2>

        <div className="mb-6 p-3 bg-white/5 rounded-lg">
          <p className="font-mono text-[#4C9AFF]">{worklog.issueKey}</p>
          <p className="text-sm text-muted-foreground">
            {worklog.timeSpent} -{" "}
            {format(new Date(worklog.started), "dd/MM/yyyy HH:mm")}
          </p>
        </div>

        <p className="text-muted-foreground mb-6">
          คุณแน่ใจหรือไม่ที่จะลบ worklog นี้? การลบไม่สามารถยกเลิกได้
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/20"
            disabled={isLoading}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-destructive hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? "⏳ กำลังลบ..." : "ลบ"}
          </Button>
        </div>
      </div>
    </div>
  );
}
