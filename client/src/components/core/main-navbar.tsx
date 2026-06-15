import { LogIn, LogOut, User } from "lucide-react"
import { Link, NavLink, useSearchParams } from "react-router-dom"

import { DocumentSearchBox } from "@/components/document/document-search-box"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useLogoutMutation } from "@/queries/auth.query"
import { useUserStore } from "@/stores/user-store"

function userInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function MainNavbar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useUserStore((state) => state.user)
  const logoutMutation = useLogoutMutation()

  const handleSearchChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams)
    if (value.trim()) {
      nextParams.set("q", value)
    } else {
      nextParams.delete("q")
    }
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to="/documents"
            className="text-[15px] font-medium text-foreground"
          >
            FINTA
          </Link>
          <NavLink
            to="/documents"
            className={({ isActive }) =>
              cn(
                "hidden rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex",
                isActive && "text-foreground",
              )
            }
          >
            Documents
          </NavLink>
        </div>

        <div className="min-w-0 flex-1">
          <DocumentSearchBox
            className="mx-auto w-full max-w-md"
            value={searchParams.get("q") ?? ""}
            onChange={handleSearchChange}
            placeholder="Search documents..."
          />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {!user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/register">Sign up</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                asChild
                className="sm:hidden"
                aria-label="Log in"
              >
                <Link to="/login">
                  <LogIn />
                </Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full p-0"
                  aria-label="Profile menu"
                >
                  <Avatar size="sm">
                    <AvatarFallback>{userInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={logoutMutation.isPending}
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
