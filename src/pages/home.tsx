import { Link } from '@tanstack/react-router'
import { History, Rocket, BarChart3, Terminal, FileJson } from 'lucide-react'

interface AppCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  gradient: string
  available: boolean
}

const apps: AppCard[] = [
  {
    id: 'worklog-creator',
    title: 'Jira Worklog Creator',
    description: 'สร้าง worklog หลายวันพร้อมกัน',
    icon: <Rocket className="w-8 h-8" />,
    href: '/worklog',
    gradient: 'from-blue-500 to-cyan-400',
    available: true,
  },
  {
    id: 'worklog-history',
    title: 'Jira Worklog History',
    description: 'ดูประวัติ worklog แก้ไข ลบ และตรวจสอบชั่วโมงทำงาน',
    icon: <History className="w-8 h-8" />,
    href: '/history',
    gradient: 'from-purple-500 to-pink-400',
    available: true,
  },
  // {
  //   id: 'time-tracker',
  //   title: 'Time Tracker',
  //   description: 'จับเวลาทำงานแบบ real-time พร้อมบันทึกอัตโนมัติ',
  //   icon: <Clock className="w-8 h-8" />,
  //   href: '/tracker',
  //   gradient: 'from-orange-500 to-amber-400',
  //   available: false,
  // },
  // {
  //   id: 'calendar-view',
  //   title: 'Calendar View',
  //   description: 'ดู worklog ในรูปแบบปฏิทิน วางแผนงานล่วงหน้า',
  //   icon: <Calendar className="w-8 h-8" />,
  //   href: '/calendar',
  //   gradient: 'from-green-500 to-emerald-400',
  //   available: false,
  // },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    description: 'วิเคราะห์เวลาทำงาน สร้างรายงานรายสัปดาห์/เดือน',
    icon: <BarChart3 className="w-8 h-8" />,
    href: '/epic-report',
    gradient: 'from-rose-500 to-red-400',
    available: true,
  },
  // {
  //   id: 'settings',
  //   title: 'Settings',
  //   description: 'ตั้งค่าการเชื่อมต่อและค่าเริ่มต้นต่างๆ',
  //   icon: <Settings className="w-8 h-8" />,
  //   href: '/settings',
  //   gradient: 'from-slate-500 to-slate-400',
  //   available: false,
  // },
  {
    id: 'sse-monitor',
    title: 'SSE Monitor',
    description: 'ดู Server-Sent Events แบบ real-time สำหรับ debug',
    icon: <Terminal className="w-8 h-8" />,
    href: '/sse-monitor',
    gradient: 'from-emerald-500 to-teal-400',
    available: true,
  },
  {
    id: 'json-formatter',
    title: 'JSON Formatter',
    description: 'จัดรูปแบบ ตรวจสอบ เปรียบเทียบ และ query JSON',
    icon: <FileJson className="w-8 h-8" />,
    href: '/json-formatter',
    gradient: 'from-amber-500 to-orange-400',
    available: true,
  },
]

function AppCardComponent({ app }: { app: AppCard }) {
  const cardContent = (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border border-border/50 
        bg-card/50 backdrop-blur-sm p-6 h-full
        transition-all duration-300 ease-out
        ${app.available
          ? 'hover:border-primary/50 hover:shadow-[0_8px_40px_rgba(0,82,204,0.15)] hover:-translate-y-1 cursor-pointer'
          : 'opacity-50 cursor-not-allowed'
        }
      `}
    >
      {/* Gradient background on hover */}
      <div
        className={`
          absolute inset-0 opacity-0 transition-opacity duration-300
          bg-gradient-to-br ${app.gradient}
          ${app.available ? 'group-hover:opacity-5' : ''}
        `}
      />

      {/* Icon */}
      <div
        className={`
          inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4
          bg-gradient-to-br ${app.gradient} text-white
          shadow-lg transition-transform duration-300
          ${app.available ? 'group-hover:scale-110' : ''}
        `}
      >
        {app.icon}
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
        {app.title}
        {!app.available && (
          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            เร็วๆ นี้
          </span>
        )}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {app.description}
      </p>

      {/* Arrow indicator */}
      {app.available && (
        <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white`}>
            →
          </div>
        </div>
      )}
    </div>
  )

  if (app.available) {
    return (
      <Link to={app.href} className="block h-full">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}

export function HomePage() {
  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg">
              🚀
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              My Workspace
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ใช้ไม่ใช้ก็แล้วแต่
          </p>
        </header>

        {/* App Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppCardComponent key={app.id} app={app} />
          ))}
        </div>
      </div>
    </div>
  )
}
