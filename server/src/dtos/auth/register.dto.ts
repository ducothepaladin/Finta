import { HttpError } from "../../lib/http-error.js"

export type RegisterDto = {
  name: string
  username: string
  email: string
  password: string
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined
}

export function parseRegisterDto(body: unknown): RegisterDto {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Request body is required")
  }

  const record = body as Record<string, unknown>
  const name = readString(record.name)
  const username = readString(record.username)
  const email = readString(record.email)?.toLowerCase()
  const password = readString(record.password)

  if (!name || !username || !email || !password) {
    throw new HttpError(400, "name, username, email, and password are required")
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "A valid email is required")
  }

  if (password.length < 6) {
    throw new HttpError(400, "Password must be at least 6 characters")
  }

  return { name, username, email, password }
}
