import { Outlet } from "react-router-dom"

import { MainNavbar } from "@/components/core/main-navbar"

export function ReadingLayout() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <MainNavbar />
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
