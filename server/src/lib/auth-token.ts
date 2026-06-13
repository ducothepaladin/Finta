import type { Request } from "express"

export function extractAccessToken(req: Request): string | null {
  const cookieToken = req.cookies?.accessToken
  if (typeof cookieToken === "string" && cookieToken.trim()) {
    return cookieToken.trim()
  }

  const header = req.headers.authorization
  if (typeof header === "string") {
    const match = header.match(/^Bearer\s+(.+)$/i)
    if (match?.[1]?.trim()) {
      return match[1].trim()
    }
  }

  return null
}
