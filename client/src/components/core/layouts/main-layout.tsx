import { Outlet } from "react-router-dom"

import { MainNavbar } from "@/components/core/main-navbar"

export function MainLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <MainNavbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
