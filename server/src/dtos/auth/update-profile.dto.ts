import { HttpError } from "../../lib/http-error.js"

export type UpdateProfileDto = {
  name?: string
  username?: string
}

export function parseUpdateProfileDto(body: unknown): UpdateProfileDto {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Request body is required")
  }

  const record = body as Record<string, unknown>
  const dto: UpdateProfileDto = {}

  if (record.name !== undefined) {
    if (typeof record.name !== "string" || !record.name.trim()) {
      throw new HttpError(400, "name must be a non-empty string")
    }
    dto.name = record.name.trim()
  }

  if (record.username !== undefined) {
    if (typeof record.username !== "string" || !record.username.trim()) {
      throw new HttpError(400, "username must be a non-empty string")
    }
    dto.username = record.username.trim().toLowerCase()
  }

  if (dto.name === undefined && dto.username === undefined) {
    throw new HttpError(400, "At least one field is required to update profile")
  }

  return dto
}
