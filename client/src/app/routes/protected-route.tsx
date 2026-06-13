import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { useProfileQuery } from "@/queries/auth.query"
import { useUserStore } from "@/stores/user-store"

type ProtectedRouteProps = {
  children: ReactNode
  requireAuth?: boolean
  guestOnly?: boolean
  requireUnverifiedOtp?: boolean
}

export function ProtectedRoute({
  children,
  requireAuth = false,
  guestOnly = false,
  requireUnverifiedOtp = false,
}: ProtectedRouteProps) {
  const location = useLocation()
  const user = useUserStore((state) => state.user)
  const { isPending, isFetching, isFetched } = useProfileQuery()

  const isLoading = isPending || (isFetching && !isFetched)

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (guestOnly && user) {
    if (!user.isOtpVerified) {
      return (
        <Navigate
          to="/verify-otp"
          replace
          state={{ from: location.pathname }}
        />
      )
    }

    const redirectTo =
      typeof location.state?.from === "string" ? location.state.from : "/documents"
    return <Navigate to={redirectTo} replace />
  }

  if (requireAuth && !user) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    )
  }

  if (requireAuth && user && !user.isOtpVerified && !requireUnverifiedOtp) {
    return (
      <Navigate
        to="/verify-otp"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (requireUnverifiedOtp && user?.isOtpVerified) {
    const redirectTo =
      typeof location.state?.from === "string" ? location.state.from : "/documents"
    return <Navigate to={redirectTo} replace />
  }

  return children
}
