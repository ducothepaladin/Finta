import type { ReactNode } from "react"

import { useProfileQuery } from "@/queries/auth.query"

type AuthBootstrapProps = {
  children: ReactNode
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  useProfileQuery()
  return children
}
