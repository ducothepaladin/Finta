import { HttpError } from "../../lib/http-error.js"

export type LoginDto = {
  email: string
  password: string
}

export function parseLoginDto(body: unknown): LoginDto {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Request body is required")
  }

  const record = body as Record<string, unknown>
  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : ""
  const password = typeof record.password === "string" ? record.password : ""

  if (!email || !password) {
    throw new HttpError(400, "email and password are required")
  }

  return { email, password }
}
