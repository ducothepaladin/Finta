import type { Response } from "express"
import { env } from "../config/env.js"

function resolveAccessTokenMaxAgeMs(): number {
  const expiresIn = env.jwtAccessExpiresIn
  const matches = /^(\d+)([smhd])$/.exec(expiresIn)
  if (!matches) {
    return 15 * 60 * 1000
  }

  const value = Number(matches[1])
  const unit = matches[2]
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return value * multipliers[unit]
}

function accessCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: resolveAccessTokenMaxAgeMs(),
  }
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax" as const,
    path: "/api/auth",
    maxAge: env.jwtRefreshCookieMaxAgeMs,
  }
}

export function setAccessTokenCookie(res: Response, accessToken: string) {
  res.cookie("accessToken", accessToken, accessCookieOptions())
}

export function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie("refreshToken", refreshToken, refreshCookieOptions())
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", accessCookieOptions())
  res.clearCookie("refreshToken", refreshCookieOptions())
}
