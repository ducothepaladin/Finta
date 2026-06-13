import { HttpError } from "../../lib/http-error.js"

export type VerifyOtpDto = {
  code: string
}

export function parseVerifyOtpDto(body: unknown): VerifyOtpDto {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Request body is required")
  }

  const code = (body as Record<string, unknown>).code
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    throw new HttpError(400, "A valid 6-digit code is required")
  }

  return { code }
}
