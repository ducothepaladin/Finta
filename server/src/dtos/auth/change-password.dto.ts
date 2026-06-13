import { HttpError } from "../../lib/http-error.js"

export type ChangePasswordDto = {
  currentPassword: string
  newPassword: string
}

export function parseChangePasswordDto(body: unknown): ChangePasswordDto {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Request body is required")
  }

  const record = body as Record<string, unknown>
  const currentPassword =
    typeof record.currentPassword === "string" ? record.currentPassword : ""
  const newPassword =
    typeof record.newPassword === "string" ? record.newPassword : ""

  if (!currentPassword || !newPassword) {
    throw new HttpError(400, "currentPassword and newPassword are required")
  }

  if (newPassword.length < 6) {
    throw new HttpError(400, "New password must be at least 6 characters")
  }

  return { currentPassword, newPassword }
}
