import { Outlet } from "react-router-dom"

import { AuthPageShell } from "@/components/auth/auth-page-shell"

export function AuthLayout() {
  return (
    <AuthPageShell>
      <Outlet />
    </AuthPageShell>
  )
}
