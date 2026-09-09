'use client'

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar, FloatingChat, Header } from '@/components/layout'
import { DashboardSessionSync } from '@/components/dashboard/dashboard-session-sync'

/** Same chrome as the dashboard so Study Rooms keep sidebar + header (no fullscreen takeover). */
export default function StudyRoomLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSessionSync />
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
      <FloatingChat />
    </SidebarProvider>
  )
}
