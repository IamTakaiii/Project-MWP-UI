# Project-MWP (My Workspace)

**My Workspace** คือชุดเครื่องมือแบบ All-in-One สำหรับนักพัฒนา ช่วยอำนวยความสะดวกในการทำงานประจำวัน (Daily Tasks) เช่น การจัดการ Jira Worklog, การวิเคราะห์รายงาน, การ Debug SSE, และการจัดการข้อมูล JSON

## ✨ ฟีเจอร์หลัก (Features)

โปรเจคนี้ประกอบด้วยเครื่องมือต่างๆ ดังนี้:

- **🚀 Jira Worklog Creator**
  - สร้าง worklog หลายวันพร้อมกัน ช่วยลดเวลาในการกรอกข้อมูลซ้ำๆ

- **📜 Jira Worklog History**
  - ดูประวัติ worklog แก้ไข ลบ และตรวจสอบชั่วโมงทำงานที่บันทึกไปแล้ว

- **📊 Reports & Analytics** (Epic Report)
  - วิเคราะห์เวลาทำงาน สร้างรายงานรายสัปดาห์หรือรายเดือน เพื่อดูภาพรวมประสิทธิภาพ

- **💻 SSE Monitor**
  - เครื่องมือสำหรับดู Server-Sent Events แบบ Real-time เหมาะสำหรับการ Debugging

- **📝 JSON Formatter**
  - จัดรูปแบบ (Format), ตรวจสอบความถูกต้อง (Validate), เปรียบเทียบ (Compare) และ Query ข้อมูล JSON

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) / [Shadcn UI](https://ui.shadcn.com/) Pattern
- **Routing:** [TanStack Router](https://tanstack.com/router)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 การเริ่มต้นใช้งาน (Getting Started)

### 1. สิ่งที่ต้องมี (Prerequisites)
โปรเจคนี้ใช้ **Bun** ในการจัดการแพ็คเกจและรันสคริปต์ กรุณาติดตั้ง Bun ก่อน:
[วิธีติดตั้ง Bun](https://bun.sh/docs/installation)

### 2. ติดตั้ง Dependencies
```bash
bun install
```

### 3. รัน Development Server
```bash
bun run dev
```
เว็บจะเปิดที่ `http://localhost:5173` (หรือพอร์ตอื่นที่ Vite กำหนด)

## 📂 โครงสร้างโปรเจค (Project Structure)

```
src/
├── assets/         # ไฟล์รูปภาพและ static assets
├── components/     # UI Components ที่ใช้ร่วมกัน
├── config/         # การตั้งค่าต่างๆ ของระบบ
├── hooks/          # Custom React Hooks
├── layouts/        # Layout หลักของหน้าเว็บ (เช่น RootLayout)
├── lib/            # Utility functions และ libraries
├── pages/          # หน้าเว็บหลักของแต่ละเครื่องมือ
│   ├── home.tsx            # หน้าเลือกเครื่องมือ
│   ├── worklog.tsx         # หน้า Worklog Creator
│   ├── history.tsx         # หน้า Worklog History
│   ├── sse-monitor.tsx     # หน้า SSE Monitor
│   ├── json-formatter.tsx  # หน้า JSON Formatter
│   └── ...
├── services/       # API services และ logic การเชื่อมต่อข้อมูล
├── types/          # TypeScript definitions
├── main.tsx        # Entry point ของ Application
└── router.tsx      # การตั้งค่า Routing (TanStack Router)
```

## 📜 คำสั่งที่ใช้บ่อย (Scripts)

| คำสั่ง | รายละเอียด |
|-------|------------|
| `bun run dev` | รันเซิร์ฟเวอร์สำหรับพัฒนา (Development) |
| `bun run build` | สร้างไฟล์สำหรับ Production |
| `bun run preview` | ดูตัวอย่างเว็บที่ Build แล้ว |
| `bun run lint` | ตรวจสอบ Code Quality ด้วย ESLint |
| `bun run format` | จัดรูปแบบโค้ดด้วย Prettier |
