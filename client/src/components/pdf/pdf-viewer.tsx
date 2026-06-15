import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react"

import { Document, Page } from "@/lib/pdf"
import { useVirtualPdfPages } from "@/hooks/use-virtual-pdf-pages"
import {
  applyActiveSearchHighlight,
  countSearchHighlightsInContainer,
  createPdfSearchTextRenderer,
  PDF_BASE_WIDTH,
  scrollToActiveSearchHighlight,
} from "@/lib/pdf-page-search"
import { cn } from "@/lib/utils"

const DEFAULT_PAGE_STRIDE = 900

type PdfViewerProps = {
  file: string | File
  pageNumber: number
  numPages: number
  zoom?: number
  searchQuery?: string
  activeMatchIndex?: number
  searchScrollRequest?: number
  onDocumentLoad?: (info: { numPages: number }) => void
  onPageChange?: (page: number) => void
  onSearchMatchCountChange?: (count: number) => void
  className?: string
  onTextLayerMouseUp?: () => void
  scrollContainerRef?: RefObject<HTMLDivElement | null>
}

export function PdfViewer({
  file,
  pageNumber,
  numPages,
  zoom = 1,
  searchQuery = "",
  activeMatchIndex = 0,
  searchScrollRequest = 0,
  onDocumentLoad,
  onPageChange,
  onSearchMatchCountChange,
  className,
  onTextLayerMouseUp,
  scrollContainerRef,
}: PdfViewerProps) {
  const searchQueryRef = useRef(searchQuery)
  const activeMatchIndexRef = useRef(activeMatchIndex)
  const pageNumberRef = useRef(pageNumber)
  searchQueryRef.current = searchQuery
  activeMatchIndexRef.current = activeMatchIndex
  pageNumberRef.current = pageNumber

  const [pageStride, setPageStride] = useState(0)

  useEffect(() => {
    setPageStride(0)
  }, [zoom, file])

  const { visibleRange, updateVisibleRange, pageStride: stride } =
    useVirtualPdfPages(scrollContainerRef ?? { current: null }, numPages, {
      currentPage: pageNumber,
      pageStride,
      onPageChange,
      resetKey: zoom,
    })

  const effectiveStride = stride > 0 ? stride : DEFAULT_PAGE_STRIDE

  const visiblePages = useMemo(() => {
    const pages = new Set<number>()

    for (
      let page = visibleRange.start;
      page <= visibleRange.end;
      page += 1
    ) {
      pages.add(page)
    }

    pages.add(pageNumber)

    return [...pages].sort((a, b) => a - b)
  }, [pageNumber, visibleRange.end, visibleRange.start])

  const handleLoadSuccess = useCallback(
    ({ numPages: total }: { numPages: number }) => {
      onDocumentLoad?.({ numPages: total })
    },
    [onDocumentLoad],
  )

  const customTextRenderer = useMemo(
    () => createPdfSearchTextRenderer(searchQuery),
    [searchQuery],
  )

  const getCurrentPageRoot = useCallback(() => {
    const container = scrollContainerRef?.current ?? null
    if (!container) return null

    const sentinel = container.querySelector(
      `[data-page-sentinel="${pageNumberRef.current}"]`,
    )
    return sentinel instanceof HTMLElement ? sentinel : container
  }, [scrollContainerRef])

  const syncSearchHighlights = useCallback(
    (shouldScroll: boolean) => {
      const pageRoot = getCurrentPageRoot()
      const query = searchQueryRef.current.trim()

      if (!query) {
        onSearchMatchCountChange?.(0)
        return
      }

      const matchCount = countSearchHighlightsInContainer(pageRoot)
      onSearchMatchCountChange?.(matchCount)

      if (matchCount === 0) return

      const safeIndex = Math.min(activeMatchIndexRef.current, matchCount - 1)
      applyActiveSearchHighlight(pageRoot, safeIndex)

      if (shouldScroll) {
        scrollToActiveSearchHighlight(scrollContainerRef?.current ?? pageRoot)
      }
    },
    [getCurrentPageRoot, onSearchMatchCountChange, scrollContainerRef],
  )

  const handlePageRenderSuccess = useCallback(
    (page: { height: number }) => {
      setPageStride((current) => {
        const next = Math.ceil(page.height) + 16
        return current > 0 ? current : next
      })
      updateVisibleRange()
    },
    [updateVisibleRange],
  )

  const handleRenderTextLayerSuccess = useCallback(() => {
    syncSearchHighlights(false)
  }, [syncSearchHighlights])

  useEffect(() => {
    if (!searchQuery.trim()) {
      onSearchMatchCountChange?.(0)
      return
    }

    const pageRoot = getCurrentPageRoot()
    if (!pageRoot?.querySelector(".pdf-search-highlight")) return

    applyActiveSearchHighlight(pageRoot, activeMatchIndex)
  }, [
    activeMatchIndex,
    getCurrentPageRoot,
    onSearchMatchCountChange,
    searchQuery,
  ])

  useEffect(() => {
    if (searchScrollRequest <= 0) return
    if (!searchQuery.trim()) return

    const pageRoot = getCurrentPageRoot()
    if (!pageRoot?.querySelector(".pdf-search-highlight")) return

    applyActiveSearchHighlight(pageRoot, activeMatchIndex)
    scrollToActiveSearchHighlight(scrollContainerRef?.current ?? pageRoot)
  }, [
    activeMatchIndex,
    getCurrentPageRoot,
    scrollContainerRef,
    searchQuery,
    searchScrollRequest,
  ])

  return (
    <div className={cn("w-full p-4", className)} onMouseUp={onTextLayerMouseUp}>
      <Document
        file={file}
        onLoadSuccess={handleLoadSuccess}
        loading={
          <p className="py-12 text-center text-sm text-muted-foreground">
            Loading PDF…
          </p>
        }
        error={
          <p className="py-12 text-center text-sm text-destructive">
            Failed to load PDF.
          </p>
        }
      >
        {numPages > 0 && (
          <div
            className="relative w-full"
            style={{ height: numPages * effectiveStride }}
          >
            {visiblePages.map((pageNum) => {
              const isCurrentPage = pageNum === pageNumber

              return (
                <div
                  key={pageNum}
                  data-page-sentinel={pageNum}
                  style={{
                    top: (pageNum - 1) * effectiveStride,
                    minHeight: effectiveStride,
                  }}
                  className="absolute right-0 left-0 flex w-full justify-center pb-4"
                >
                  <Page
                    pageNumber={pageNum}
                    className="rounded-sm shadow-sm"
                    width={PDF_BASE_WIDTH}
                    scale={zoom}
                    renderTextLayer
                    renderAnnotationLayer={true}
                    customTextRenderer={
                      isCurrentPage ? customTextRenderer : undefined
                    }
                    onRenderSuccess={handlePageRenderSuccess}
                    onRenderTextLayerSuccess={
                      isCurrentPage ? handleRenderTextLayerSuccess : undefined
                    }
                  />
                </div>
              )
            })}
          </div>
        )}
      </Document>
    </div>
  )
}
