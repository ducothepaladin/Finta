const SEARCH_HIGHLIGHT_CLASS = "pdf-search-highlight"
const SEARCH_HIGHLIGHT_ACTIVE_CLASS = "pdf-search-highlight-active"

export type PdfSearchMatch = {
  itemIndex: number
  start: number
  end: number
}

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase()
}

export function findMatchesInText(
  text: string,
  query: string,
): PdfSearchMatch[] {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) return []

  const lowerText = text.toLowerCase()
  const matches: PdfSearchMatch[] = []
  let start = 0

  while (start <= lowerText.length - normalizedQuery.length) {
    const index = lowerText.indexOf(normalizedQuery, start)
    if (index === -1) break
    matches.push({ itemIndex: -1, start: index, end: index + normalizedQuery.length })
    start = index + normalizedQuery.length
  }

  return matches
}

export function countPageSearchMatches(
  items: Array<{ str: string }>,
  query: string,
): number {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) return 0

  return items.reduce((total, item) => {
    return total + findMatchesInText(item.str, normalizedQuery).length
  }, 0)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function createPdfSearchTextRenderer(query: string) {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) return undefined

  return ({ str }: { str: string }) => {
    const lowerText = str.toLowerCase()
    let cursor = 0
    let result = ""
    let index = lowerText.indexOf(normalizedQuery, cursor)

    while (index !== -1) {
      result += escapeHtml(str.slice(cursor, index))
      result += `<mark class="${SEARCH_HIGHLIGHT_CLASS}">${escapeHtml(str.slice(index, index + normalizedQuery.length))}</mark>`

      cursor = index + normalizedQuery.length
      index = lowerText.indexOf(normalizedQuery, cursor)
    }

    result += escapeHtml(str.slice(cursor))
    return result
  }
}

export function countSearchHighlightsInContainer(
  container: HTMLElement | null,
): number {
  if (!container) return 0
  return container.querySelectorAll(`.${SEARCH_HIGHLIGHT_CLASS}`).length
}

export function applyActiveSearchHighlight(
  container: HTMLElement | null,
  activeIndex: number,
) {
  if (!container) return

  const marks = container.querySelectorAll(`.${SEARCH_HIGHLIGHT_CLASS}`)
  marks.forEach((mark, index) => {
    mark.classList.toggle(SEARCH_HIGHLIGHT_ACTIVE_CLASS, index === activeIndex)
  })
}

export function scrollToActiveSearchHighlight(container: HTMLElement | null) {
  if (!container) return

  const active = container.querySelector(`.${SEARCH_HIGHLIGHT_ACTIVE_CLASS}`)
  if (!(active instanceof HTMLElement)) return

  const containerRect = container.getBoundingClientRect()
  const activeRect = active.getBoundingClientRect()
  const targetTop =
    activeRect.top -
    containerRect.top +
    container.scrollTop -
    container.clientHeight / 2 +
    activeRect.height / 2

  container.scrollTo({
    top: Math.max(0, targetTop),
    behavior: "smooth",
  })
}

export const PDF_SEARCH_HIGHLIGHT_CLASS = SEARCH_HIGHLIGHT_CLASS

export const PDF_ZOOM_MIN = 0.5
export const PDF_ZOOM_MAX = 2.5
export const PDF_ZOOM_STEP = 0.25
export const PDF_BASE_WIDTH = 420

export function clampPdfZoom(value: number): number {
  return Math.min(PDF_ZOOM_MAX, Math.max(PDF_ZOOM_MIN, value))
}
