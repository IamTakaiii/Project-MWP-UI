import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { TIME_SPENT_OPTIONS } from '@/lib/constants'
import { formatDateTag, formatTimeSpent } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

type DateMode = 'single' | 'range'

interface DateTimeFormProps {
  startDate: string
  endDate: string
  startTime: string
  timeSpent: string
  skipWeekends: boolean
  comment: string
  previewDates: Date[]
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onStartTimeChange: (value: string) => void
  onTimeSpentChange: (value: string) => void
  onSkipWeekendsChange: (value: boolean) => void
  onCommentChange: (value: string) => void
}

export function DateTimeForm({
  startDate,
  endDate,
  startTime,
  timeSpent,
  skipWeekends,
  comment,
  previewDates,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onTimeSpentChange,
  onSkipWeekendsChange,
  onCommentChange,
}: DateTimeFormProps) {
  const [dateMode, setDateMode] = useState<DateMode>('single')

  // Sync endDate with startDate when in single mode
  useEffect(() => {
    if (dateMode === 'single' && startDate) {
      onEndDateChange(startDate)
    }
  }, [dateMode, startDate, onEndDateChange])

  const handleDateModeChange = (mode: DateMode) => {
    setDateMode(mode)
    if (mode === 'single' && startDate) {
      onEndDateChange(startDate)
    }
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-3 text-xl font-semibold text-foreground">
          <span className="text-2xl">📅</span>
          ช่วงเวลา
        </h2>

        {/* Date Mode Toggle */}
        <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleDateModeChange('single')}
            className={cn(
              'rounded-md px-3 h-8 text-sm',
              dateMode === 'single' 
                ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            วันเดียว
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleDateModeChange('range')}
            className={cn(
              'rounded-md px-3 h-8 text-sm',
              dateMode === 'range' 
                ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            หลายวัน
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={cn("space-y-2", dateMode === 'single' && "md:col-span-2")}>
          <Label htmlFor="startDate">
            {dateMode === 'single' ? 'วันที่' : 'วันที่เริ่มต้น'}
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="bg-input border-[rgba(255,255,255,0.15)] focus:border-ring"
            required
          />
        </div>

        {dateMode === 'range' && (
          <div className="space-y-2">
            <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="bg-input border-[rgba(255,255,255,0.15)] focus:border-ring"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="startTime">เวลาเริ่มงาน</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="bg-input border-[rgba(255,255,255,0.15)] focus:border-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeSpent">ระยะเวลา</Label>
          <Combobox
            value={timeSpent}
            onChange={onTimeSpentChange}
            options={TIME_SPENT_OPTIONS}
            placeholder="เช่น 15m, 1h, 2h 30m"
            formatValue={formatTimeSpent}
            required
          />
        </div>
      </div>

      {dateMode === 'range' && (
        <div className="flex items-center gap-3 mt-5">
          <Checkbox
            id="skipWeekends"
            checked={skipWeekends}
            onCheckedChange={(checked) => onSkipWeekendsChange(checked as boolean)}
          />
          <Label htmlFor="skipWeekends" className="cursor-pointer">
            ข้ามวันเสาร์-อาทิตย์
          </Label>
        </div>
      )}

      <div className="mt-5 space-y-2">
        <Label htmlFor="comment">หมายเหตุ (Optional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="รายละเอียดงานที่ทำ..."
          rows={3}
          className="bg-input border-[rgba(255,255,255,0.15)] focus:border-ring resize-y"
        />
      </div>

      {/* Preview dates */}
      {previewDates.length > 0 && (
        <div className="mt-6 p-5 bg-[#4C9AFF]/10 border border-[#4C9AFF]/20 rounded-2xl">
          <h3 className="text-sm font-semibold text-[#4C9AFF] mb-4">
            📆 วันที่จะสร้าง worklog ({previewDates.length} วัน)
          </h3>
          <div className="flex flex-wrap gap-2">
            {previewDates.map((date, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-[#4C9AFF]/15 text-[#4C9AFF] text-sm font-medium rounded-full border border-[#4C9AFF]/25"
              >
                {formatDateTag(date)}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
