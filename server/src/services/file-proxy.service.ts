import { env } from "../config/env.js"
import { HttpError } from "../lib/http-error.js"

function validateRelativePath(relativePath: string): string {
  const trimmed = relativePath.trim()
  if (!trimmed) {
    throw new HttpError(400, "relativePath is required")
  }
  if (trimmed.startsWith("/") || trimmed.includes("..")) {
    throw new HttpError(400, "Invalid relativePath")
  }
  return trimmed
}

export async function fetchFileFromService(relativePath: string): Promise<Response> {
  const safePath = validateRelativePath(relativePath)
  const baseUrl = env.fileServiceUrl.replace(/\/+$/, "")
  const url = `${baseUrl}/file?relativePath=${encodeURIComponent(safePath)}`

  let response: Response
  try {
    response = await fetch(url)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new HttpError(502, `File service unreachable: ${message}`)
  }

  return response
}
