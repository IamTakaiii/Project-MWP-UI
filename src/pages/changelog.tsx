import { GitCommit, Sparkles, Bug, Wrench } from "lucide-react";
import { PageContainer, PageHeader } from "@/components";

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: "feature" | "fix" | "improvement";
    description: string;
  }[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.4.0",
    date: "6 ก.พ. 2569",
    changes: [
      {
        type: "feature",
        description: "เพิ่มฟีเจอร์ความสามารถตรวจสอบการทำงานของ Worklog Tracking ในหน้า Worklog Tracking",
      },
      {
        type: "feature",
        description: "เพิ่ม navbar",
      }
    ],
  },
  {
    version: "1.3.0",
    date: "4 ก.พ. 2569",
    changes: [
      {
        type: "feature",
        description:
          "เพิ่มเมนู \"ลบทั้งหมดในช่วงนี้\" (Bulk Delete) ในคลิกขวาหน้า History",
      },
      {
        type: "feature",
        description:
          "เพิ่มส่วนแสดงผล \"สรุปงานแยกตาม Task\" (Issue Summary Stats) ในหน้า History",
      },
      {
        type: "feature",
        description:
          "เพิ่มช่องค้นหา (Search Filter) ในหน้า History กรองตาม Issue Key หรือรายละเอียด",
      },
      {
        type: "improvement",
        description:
          "ปรับปรุงดีไซน์ \"Recent Tasks\" ใหม่ เป็นแบบ Chips สวยงามและประหยัดพื้นที่",
      },
      {
        type: "improvement",
        description:
          "เพิ่มปุ่มย่อ/ขยายส่วนสรุปงานในหน้า History (เริ่มต้นแบบซ่อน)",
      },
    ],
  },
  {
    version: "1.2.0",
    date: "30 ม.ค. 2569",
    changes: [
      {
        type: "feature",
        description: "เพิ่มการ report จำนวน ชั่วโมงในการทำงาน",
      },
      { type: "feature", description: "เพิ่มการ export exel ชั่วโมงการทำงาน" },
      {
        type: "feature",
        description: "เพิ่มปุ่ม generate markdown การทำงานรายวัน",
      },
      {
        type: "improvement",
        description: "ปรับปรุง UI ให้ responsive สำหรับ mobile view",
      },
    ],
  },
  {
    version: "1.1.0",
    date: "25 ม.ค. 2569",
    changes: [
      {
        type: "feature",
        description: "เพิ่ม Mini History แสดงประวัติสัปดาห์นี้ในหน้า Worklog",
      },
      {
        type: "feature",
        description:
          "เพิ่ม Quick Actions Menu (คลิกขวา) สำหรับ Copy, Duplicate, Delete worklog",
      },
      {
        type: "feature",
        description:
          "เพิ่มฟีเจอร์คัดลอกและวางข้อมูล worklog ระหว่างหน้า History และ Worklog",
      },
      {
        type: "feature",
        description:
          "เพิ่ม Recent Tasks Quick Access แสดง 4 tasks ที่ใช้ล่าสุด",
      },
      {
        type: "feature",
        description:
          "เพิ่ม Toast Notification แจ้งเตือนเมื่อสร้าง Worklog สำเร็จ",
      },
      {
        type: "feature",
        description:
          'เพิ่มปุ่ม "บันทึก & เพิ่มรายการใหม่" vs "บันทึก & เสร็จสิ้น"',
      },
      {
        type: "fix",
        description:
          "แก้ไขการคำนวณสัปดาห์ให้แสดงสัปดาห์ปัจจุบันเมื่อเป็นวันจันทร์",
      },
      {
        type: "fix",
        description: "แก้ไข Calendar/Clock icon ให้เห็นชัดบน dark theme",
      },
      {
        type: "improvement",
        description: "จำกัดช่วงวันที่ในหน้า History ไม่เกิน 2 เดือน (60 วัน)",
      },
      {
        type: "improvement",
        description:
          "ไม่ Clear Form ทั้งหมดหลังสร้าง Worklog เพื่อให้เพิ่มรายการใหม่ได้สะดวก",
      },
      {
        type: "improvement",
        description: "Date/Time picker เปิดได้เมื่อคลิกที่ input โดยตรง",
      },
      {
        type: "improvement",
        description:
          "บันทึกการใช้งาน task เฉพาะเมื่อสร้าง worklog สำเร็จเท่านั้น",
      },
    ],
  },
];

const typeIcon = {
  feature: <Sparkles className="h-4 w-4 text-emerald-400" />,
  fix: <Bug className="h-4 w-4 text-amber-400" />,
  improvement: <Wrench className="h-4 w-4 text-blue-400" />,
};

const typeLabel = {
  feature: "ฟีเจอร์ใหม่",
  fix: "แก้ไขบัค",
  improvement: "ปรับปรุง",
};

export function ChangelogPage() {
  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
          title="Change Log"
          description="ประวัติการอัปเดตและการเปลี่ยนแปลง"
          icon={<GitCommit className="h-5 w-5" />}
          iconGradient="from-violet-500 to-purple-500"
        />

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
                <span className="text-xl font-bold text-primary">
                  v{entry.version}
                </span>
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
                      <span className="text-foreground">
                        {change.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
    </PageContainer>
  );
}
