import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PdfViewerPaginationProps = {
  currentPage: number
  numPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function PdfViewerPagination({
  currentPage,
  numPages,
  onPageChange,
  className,
}: PdfViewerPaginationProps) {
  const [draftPage, setDraftPage] = useState(String(currentPage))

  useEffect(() => {
    setDraftPage(String(currentPage))
  }, [currentPage])

  if (numPages <= 1) return null

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < numPages

  const commitDraftPage = () => {
    const parsed = Number.parseInt(draftPage, 10)
    if (Number.isNaN(parsed)) {
      setDraftPage(String(currentPage))
      return
    }

    const nextPage = Math.min(Math.max(parsed, 1), numPages)
    setDraftPage(String(nextPage))
    if (nextPage !== currentPage) {
      onPageChange(nextPage)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    commitDraftPage()
  }

  return (
    <nav
      aria-label="PDF page navigation"
      className={cn(
        "pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-1 rounded-lg border border-border bg-card px-1.5 py-1",
          "dark:border-powder-blue-700 dark:bg-powder-blue-800",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 shrink-0 bg-dusty-taupe-50 dark:bg-powder-blue-900"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-1 px-1"
        >
          <Input
            value={draftPage}
            onChange={(event) => setDraftPage(event.target.value)}
            onBlur={commitDraftPage}
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label="Current page"
            className="h-7 w-10 border-border bg-dusty-taupe-50 px-1 text-center text-xs dark:border-powder-blue-700 dark:bg-powder-blue-900"
          />
          <span className="text-xs text-muted-foreground">/ {numPages}</span>
        </form>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 shrink-0 bg-dusty-taupe-50 dark:bg-powder-blue-900"
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  )
}
