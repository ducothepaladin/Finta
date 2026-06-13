import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

type AuthPageShellProps = {
  children: ReactNode
}

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <main className="relative flex min-h-svh flex-1 flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center px-4 sm:px-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/documents">
              <ArrowLeft className="size-4" />
              Back to app
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </div>
    </main>
  )
}
