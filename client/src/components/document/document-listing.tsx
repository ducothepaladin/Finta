import { LayoutGrid, List } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { PageLoader } from "@/components/core/page-loader"
import { DocumentListCard } from "@/components/document/document-list-card"
import { DocumentListRow } from "@/components/document/document-list-row"
import { DocumentPagination } from "@/components/document/document-pagination"
import { DocumentUploadCard } from "@/components/document/document-upload-card"
import { DocumentUploadDialog } from "@/components/document/document-upload-dialog"
import { Button } from "@/components/ui/button"
import { usePagination } from "@/hooks/use-pagination"
import { mapDocumentDtoToItem } from "@/lib/map-document"
import { cn } from "@/lib/utils"
import { useDocumentsQuery } from "@/queries/document.query"
import { useDocumentStore } from "@/stores"

const DEFAULT_PAGE_SIZE = 12

function parseQueryPage(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? "1", 10)
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  return parsed
}

export function DocumentListing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get("q") ?? ""
  const previousSearchRef = useRef(searchQuery)
  const queryPage = parseQueryPage(searchParams.get("page"))

  const viewMode = useDocumentStore((state) => state.viewMode)
  const setViewMode = useDocumentStore((state) => state.setViewMode)

  const [uploadOpen, setUploadOpen] = useState(false)

  useEffect(() => {
    if (previousSearchRef.current === searchQuery) return
    previousSearchRef.current = searchQuery

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete("page")
        return next
      },
      { replace: true },
    )
  }, [searchQuery, setSearchParams])

  const listParams = useMemo(
    () => ({
      page: queryPage,
      limit: DEFAULT_PAGE_SIZE,
      q: searchQuery || undefined,
    }),
    [queryPage, searchQuery],
  )

  const { data, isPending, isError } = useDocumentsQuery(listParams)

  const totalPages = data?.pagination.totalPages ?? 1
  const total = data?.pagination.total ?? 0

  const { page, pageLink } = usePagination({
    defaultPageSize: DEFAULT_PAGE_SIZE,
    totalPages: data?.pagination.totalPages,
  })

  const documents = useMemo(
    () => (data?.documents ?? []).map(mapDocumentDtoToItem),
    [data?.documents],
  )

  const metaLabel =
    total === 0
      ? "No documents yet"
      : searchQuery
        ? `${total} result${total === 1 ? "" : "s"} for "${searchQuery}"`
        : `${total} file${total === 1 ? "" : "s"}`

  if (isPending) {
    return <PageLoader />
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        Could not load documents. Please try again.
      </p>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-medium text-foreground">My documents</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">{metaLabel}</p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className={cn(
                viewMode === "grid" && "border-primary/40 bg-primary/10 text-primary",
              )}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <LayoutGrid />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className={cn(
                viewMode === "list" && "border-primary/40 bg-primary/10 text-primary",
              )}
              onClick={() => setViewMode("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <List />
            </Button>
          </div>
        </header>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-3.5">
            <DocumentUploadCard onClick={() => setUploadOpen(true)} />
            {documents.map((document) => (
              <DocumentListCard key={document.id} document={document} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <DocumentUploadCard
              onClick={() => setUploadOpen(true)}
              variant="list"
            />
            {documents.map((document) => (
              <DocumentListRow key={document.id} document={document} />
            ))}
          </div>
        )}

        {documents.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {searchQuery
              ? "No documents match your search."
              : "Upload your first PDF to get started."}
          </p>
        )}

        <DocumentPagination
          page={page}
          totalPages={totalPages}
          pageLink={pageLink}
        />
      </div>

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  )
}
