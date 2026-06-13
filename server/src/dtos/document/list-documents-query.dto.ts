import { HttpError } from "../../lib/http-error.js"

export type ListDocumentsQuery = {
  page: number
  limit: number
  q: string
}

function parsePositiveInt(raw: unknown, fallback: number): number {
  if (raw == null || raw === "") return fallback
  const n = Number.parseInt(String(raw), 10)
  if (!Number.isFinite(n) || n < 1) return fallback
  return n
}

export function parseListDocumentsQuery(query: unknown): ListDocumentsQuery {
  if (!query || typeof query !== "object") {
    return { page: 1, limit: 12, q: "" }
  }

  const record = query as Record<string, unknown>
  const page = parsePositiveInt(record.page, 1)
  const limit = Math.min(parsePositiveInt(record.limit, 12), 50)
  const q = typeof record.q === "string" ? record.q.trim() : ""

  if (page < 1) {
    throw new HttpError(400, "page must be a positive integer")
  }

  return { page, limit, q }
}
