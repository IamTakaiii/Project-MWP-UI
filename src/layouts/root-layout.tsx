import { Outlet } from '@tanstack/react-router'

export default function RootLayout() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-[#4C9AFF]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-success/8 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-warning/5 rounded-full blur-[100px]" />
      </div>

      {/* Page content */}
      <Outlet />
    </div>
  )
}
