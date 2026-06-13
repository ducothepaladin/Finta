import { useCallback, useEffect, useMemo } from "react"
import { useLocation, useSearchParams } from "react-router-dom"

export type UsePaginationOptions = {
  pageParam?: string
  pageSizeParam?: string
  defaultPageSize?: number
  totalItems?: number
  totalPages?: number
  replaceHistory?: boolean
  omitPageOne?: boolean
}

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (raw == null || raw === "") return fallback
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1) return fallback
  return n
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    pageParam = "page",
    pageSizeParam,
    defaultPageSize = 12,
    totalItems,
    totalPages: explicitTotalPages,
    replaceHistory = true,
    omitPageOne = true,
  } = options

  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPageSize = pageSizeParam
    ? parsePositiveInt(searchParams.get(pageSizeParam), defaultPageSize)
    : defaultPageSize

  const pageSize = Math.max(1, rawPageSize)

  const totalPages = useMemo(() => {
    if (explicitTotalPages != null && Number.isFinite(explicitTotalPages)) {
      return Math.max(1, Math.floor(explicitTotalPages))
    }
    if (totalItems != null && totalItems >= 0) {
      return Math.max(1, Math.ceil(totalItems / pageSize))
    }
    return undefined
  }, [explicitTotalPages, totalItems, pageSize])

  const rawPage = parsePositiveInt(searchParams.get(pageParam), 1)

  const page = useMemo(() => {
    let p = rawPage
    if (totalPages != null) {
      p = Math.min(Math.max(1, p), totalPages)
    }
    return p
  }, [rawPage, totalPages])

  const applyPaginationParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          mutate(next)
          return next
        },
        { replace: replaceHistory },
      )
    },
    [setSearchParams, replaceHistory],
  )

  useEffect(() => {
    if (totalPages == null) return
    if (rawPage === page) return
    applyPaginationParams((params) => {
      if (omitPageOne && page === 1) {
        params.delete(pageParam)
      } else {
        params.set(pageParam, String(page))
      }
    })
  }, [
    applyPaginationParams,
    omitPageOne,
    page,
    pageParam,
    rawPage,
    totalPages,
  ])

  const setPage = useCallback(
    (nextPage: number) => {
      let target = Math.max(1, nextPage)
      if (totalPages != null) {
        target = Math.min(target, totalPages)
      }
      applyPaginationParams((params) => {
        if (omitPageOne && target === 1) {
          params.delete(pageParam)
        } else {
          params.set(pageParam, String(target))
        }
      })
    },
    [applyPaginationParams, omitPageOne, pageParam, totalPages],
  )

  const pageLink = useCallback(
    (targetPage: number) => {
      let target = Math.max(1, targetPage)
      if (totalPages != null) {
        target = Math.min(target, totalPages)
      }
      const next = new URLSearchParams(searchParams)
      if (omitPageOne && target === 1) {
        next.delete(pageParam)
      } else {
        next.set(pageParam, String(target))
      }
      const qs = next.toString()
      return qs ? `${location.pathname}?${qs}` : location.pathname
    },
    [location.pathname, omitPageOne, pageParam, searchParams, totalPages],
  )

  return {
    page,
    pageSize,
    totalPages,
    setPage,
    pageLink,
  }
}
