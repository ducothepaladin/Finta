import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DocumentPaginationProps = {
  page: number
  totalPages: number
  pageLink: (page: number) => string
  className?: string
}

export function DocumentPagination({
  page,
  totalPages,
  pageLink,
  className,
}: DocumentPaginationProps) {
  if (totalPages <= 1) return null

  const previousPage = Math.max(1, page - 1)
  const nextPage = Math.min(totalPages, page + 1)
  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  return (
    <nav
      aria-label="Document pagination"
      className={cn("flex items-center justify-end gap-2", className)}
    >
      {canGoPrevious ? (
        <Button variant="outline" size="sm" asChild>
          <Link to={pageLink(previousPage)}>
            <ChevronLeft className="size-4" />
            Previous
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="size-4" />
          Previous
        </Button>
      )}
      <span className="px-1 text-xs text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {canGoNext ? (
        <Button variant="outline" size="sm" asChild>
          <Link to={pageLink(nextPage)}>
            Next
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
          <ChevronRight className="size-4" />
        </Button>
      )}
    </nav>
  )
}
