import { Link } from '@tanstack/react-router'
import { ArrowLeft, GitCommit, Sparkles, Bug, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChangelogEntry {
  version: string
  date: string
  changes: {
    type: 'feature' | 'fix' | 'improvement'
    description: string
  }[]
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.1.0',
    date: '25 ม.ค. 2569',
    changes: [
      { type: 'feature', description: 'เพิ่ม Mini History แสดงประวัติสัปดาห์นี้ในหน้า Worklog' },
      { type: 'feature', description: 'เพิ่ม Quick Actions Menu (คลิกขวา) สำหรับ Copy, Duplicate, Delete worklog' },
      { type: 'feature', description: 'เพิ่มฟีเจอร์คัดลอกและวางข้อมูล worklog ระหว่างหน้า History และ Worklog' },
      { type: 'feature', description: 'เพิ่ม Recent Tasks Quick Access แสดง 4 tasks ที่ใช้ล่าสุด' },
      { type: 'feature', description: 'เพิ่ม Toast Notification แจ้งเตือนเมื่อสร้าง Worklog สำเร็จ' },
      { type: 'feature', description: 'เพิ่มปุ่ม "บันทึก & เพิ่มรายการใหม่" vs "บันทึก & เสร็จสิ้น"' },
      { type: 'fix', description: 'แก้ไขการคำนวณสัปดาห์ให้แสดงสัปดาห์ปัจจุบันเมื่อเป็นวันจันทร์' },
      { type: 'fix', description: 'แก้ไข Calendar/Clock icon ให้เห็นชัดบน dark theme' },
      { type: 'improvement', description: 'จำกัดช่วงวันที่ในหน้า History ไม่เกิน 2 เดือน (60 วัน)' },
      { type: 'improvement', description: 'ไม่ Clear Form ทั้งหมดหลังสร้าง Worklog เพื่อให้เพิ่มรายการใหม่ได้สะดวก' },
      { type: 'improvement', description: 'Date/Time picker เปิดได้เมื่อคลิกที่ input โดยตรง' },
      { type: 'improvement', description: 'บันทึกการใช้งาน task เฉพาะเมื่อสร้าง worklog สำเร็จเท่านั้น' },
    ],
  },
]

const typeIcon = {
  feature: <Sparkles className="h-4 w-4 text-emerald-400" />,
  fix: <Bug className="h-4 w-4 text-amber-400" />,
  improvement: <Wrench className="h-4 w-4 text-blue-400" />,
}

const typeLabel = {
  feature: 'ฟีเจอร์ใหม่',
  fix: 'แก้ไขบัค',
  improvement: 'ปรับปรุง',
}

export function ChangelogPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/20">
                <GitCommit className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Change Log</h1>
                <p className="text-sm text-muted-foreground">
                  ประวัติการอัปเดตและการเปลี่ยนแปลง
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Changelog entries */}
        <div className="space-y-8">
          {CHANGELOG.map((entry, index) => (
            <div
              key={entry.version}
              className="relative pl-8 pb-8 border-l-2 border-white/10 last:border-l-0 last:pb-0"
            >
              {/* Version dot */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />
              
              {/* Version header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl font-bold text-primary">v{entry.version}</span>
                <span className="text-sm text-muted-foreground px-2 py-0.5 bg-white/5 rounded">
                  {entry.date}
                </span>
                {index === 0 && (
                  <span className="text-xs text-emerald-400 px-2 py-0.5 bg-emerald-500/20 rounded-full">
                    ล่าสุด
                  </span>
                )}
              </div>

              {/* Changes list */}
              <div className="space-y-3">
                {entry.changes.map((change, changeIndex) => (
                  <div
                    key={changeIndex}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="shrink-0 mt-0.5">
                      {typeIcon[change.type]}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-muted-foreground mr-2">
                        [{typeLabel[change.type]}]
                      </span>
                      <span className="text-foreground">{change.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 py-4 border-t border-white/10">
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for better productivity
          </p>
        </footer>
      </div>
    </div>
  )
}
