import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react"

export type VirtualPageRange = {
  start: number
  end: number
}

type UseVirtualPdfPagesOptions = {
  overscan?: number
  currentPage: number
  pageStride: number
  onPageChange?: (page: number) => void
  resetKey?: number | string
}

const DEFAULT_PAGE_STRIDE = 900

function createInitialRange(totalPages: number, overscan: number): VirtualPageRange {
  if (totalPages <= 0) return { start: 1, end: 1 }
  return {
    start: 1,
    end: Math.min(totalPages, 1 + overscan * 2),
  }
}

function pageFromScrollOffset(
  scrollTop: number,
  viewportHeight: number,
  pageStride: number,
  totalPages: number,
) {
  const centerOffset = scrollTop + viewportHeight / 2
  const page = Math.floor(centerOffset / pageStride) + 1
  return Math.min(Math.max(page, 1), totalPages)
}

export function useVirtualPdfPages(
  containerRef: RefObject<HTMLDivElement | null>,
  totalPages: number,
  {
    overscan = 2,
    currentPage,
    pageStride,
    onPageChange,
    resetKey,
  }: UseVirtualPdfPagesOptions,
) {
  const stride =
    pageStride > 0 ? pageStride : DEFAULT_PAGE_STRIDE

  const [visibleRange, setVisibleRange] = useState<VirtualPageRange>(() =>
    createInitialRange(totalPages, overscan),
  )

  const isProgrammaticScrollRef = useRef(false)
  const lastSyncedPageRef = useRef(currentPage)
  const onPageChangeRef = useRef(onPageChange)
  onPageChangeRef.current = onPageChange

  const scrollToPage = useCallback(
    (page: number, behavior: ScrollBehavior = "instant") => {
      const container = containerRef.current
      if (!container || totalPages <= 0) return

      const safePage = Math.min(Math.max(page, 1), totalPages)
      const targetTop = (safePage - 1) * stride

      isProgrammaticScrollRef.current = true
      container.scrollTo({
        top: targetTop,
        behavior,
      })

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isProgrammaticScrollRef.current = false
        })
      })
    },
    [containerRef, stride, totalPages],
  )

  const updateVisibleRange = useCallback(() => {
    const container = containerRef.current
    if (!container || totalPages <= 0) return

    const scrollTop = container.scrollTop
    const viewportHeight = container.clientHeight
    const firstVisible = Math.floor(scrollTop / stride) + 1
    const lastVisible = Math.ceil((scrollTop + viewportHeight) / stride)

    setVisibleRange({
      start: Math.max(1, firstVisible - overscan),
      end: Math.min(totalPages, lastVisible + overscan),
    })

    if (isProgrammaticScrollRef.current) return

    const topVisiblePage = pageFromScrollOffset(
      scrollTop,
      viewportHeight,
      stride,
      totalPages,
    )

    if (topVisiblePage !== lastSyncedPageRef.current) {
      lastSyncedPageRef.current = topVisiblePage
      onPageChangeRef.current?.(topVisiblePage)
    }
  }, [containerRef, overscan, stride, totalPages])

  useEffect(() => {
    setVisibleRange(createInitialRange(totalPages, overscan))
  }, [totalPages, overscan])

  useEffect(() => {
    if (totalPages <= 0) return
    if (currentPage === lastSyncedPageRef.current) return

    scrollToPage(currentPage)
    lastSyncedPageRef.current = currentPage
  }, [currentPage, scrollToPage, totalPages])

  useEffect(() => {
    const container = containerRef.current
    if (!container || totalPages <= 0) return

    container.addEventListener("scroll", updateVisibleRange, { passive: true })
    updateVisibleRange()

    return () => container.removeEventListener("scroll", updateVisibleRange)
  }, [containerRef, totalPages, updateVisibleRange, stride])

  useEffect(() => {
    if (totalPages <= 0) return

    scrollToPage(currentPage)
    updateVisibleRange()
  }, [resetKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (totalPages <= 0 || pageStride <= 0) return

    scrollToPage(currentPage)
    updateVisibleRange()
  }, [pageStride]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    visibleRange,
    scrollToPage,
    updateVisibleRange,
    pageStride: stride,
  }
}
