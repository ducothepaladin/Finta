import type { RequestHandler } from "express"

import {
  parseChangePasswordDto,
  parseLoginDto,
  parseRegisterDto,
  parseUpdateProfileDto,
  parseVerifyOtpDto,
} from "../dtos/auth/index.js"
import { successResponse } from "../lib/api-response.js"
import {
  clearAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "../lib/auth-cookies.js"
import { asyncHandler } from "../lib/async-handler.js"
import { HttpError } from "../lib/http-error.js"
import * as authService from "../services/auth.service.js"

class AuthController {
  register: RequestHandler = asyncHandler(async (req, res) => {
    const dto = parseRegisterDto(req.body)
    const { accessToken, refreshToken } = await authService.register(dto)

    setAccessTokenCookie(res, accessToken)
    setRefreshTokenCookie(res, refreshToken)

    res.status(201).json(
      successResponse({
        code: 201,
        meta: { endpoint: "/api/auth/register", method: "POST" },
        message: "Register successful",
      }),
    )
  })

  login: RequestHandler = asyncHandler(async (req, res) => {
    const dto = parseLoginDto(req.body)
    const { accessToken, refreshToken } = await authService.login(dto)

    setAccessTokenCookie(res, accessToken)
    setRefreshTokenCookie(res, refreshToken)

    res.json(
      successResponse({
        meta: { endpoint: "/api/auth/login", method: "POST" },
        message: "Login successful",
      }),
    )
  })

  refresh: RequestHandler = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken as string | undefined
    if (!refreshToken) {
      throw new HttpError(401, "Refresh token is missing")
    }

    const { accessToken, refreshToken: rotatedRefreshToken } =
      await authService.refreshTokens(refreshToken)

    setAccessTokenCookie(res, accessToken)
    setRefreshTokenCookie(res, rotatedRefreshToken)

    res.json(
      successResponse({
        meta: { endpoint: "/api/auth/refresh", method: "POST" },
        message: "Token refreshed successfully",
      }),
    )
  })

  logout: RequestHandler = asyncHandler(async (req, res) => {
    await authService.clearRefreshToken(req.user!.id)
    clearAuthCookies(res)

    res.json(
      successResponse({
        meta: { endpoint: "/api/auth/logout", method: "POST" },
        message: "Logout successful",
      }),
    )
  })

  me: RequestHandler = asyncHandler(async (req, res) => {
    res.json(await this.buildProfileResponse(req.user!.id, "/api/auth/me", "GET"))
  })

  profile: RequestHandler = asyncHandler(async (req, res) => {
    res.json(
      await this.buildProfileResponse(req.user!.id, "/api/auth/profile", "GET"),
    )
  })

  updateProfile: RequestHandler = asyncHandler(async (req, res) => {
    const dto = parseUpdateProfileDto(req.body)
    const profile = await authService.updateProfile(req.user!.id, dto)

    res.json(
      successResponse({
        meta: { endpoint: "/api/auth/profile", method: "PATCH" },
        data: profile,
        message: "Profile updated successfully",
      }),
    )
  })

  changePassword: RequestHandler = asyncHandler(async (req, res) => {
    const dto = parseChangePasswordDto(req.body)
    await authService.changePassword(req.user!.id, dto)

    res.json(
      successResponse({
        meta: { endpoint: "/api/auth/change-password", method: "POST" },
        message: "Password changed successfully",
      }),
    )
  })

  sendOtp: RequestHandler = asyncHandler(async (req, res) => {
    await authService.sendOtp(req.user!.id)

    res.json(
      successResponse({
        meta: { endpoint: "/api/auth/send-otp", method: "POST" },
        message: "OTP sent successfully",
      }),
    )
  })

  verifyOtp: RequestHandler = asyncHandler(async (req, res) => {
    const dto = parseVerifyOtpDto(req.body)
    const profile = await authService.verifyOtp(req.user!.id, dto.code)

    res.json(
      successResponse({
        meta: { endpoint: "/api/auth/verify-otp", method: "POST" },
        data: profile,
        message: "OTP verified successfully",
      }),
    )
  })

  private async buildProfileResponse(
    userId: string,
    endpoint: string,
    method: string,
  ) {
    const profile = await authService.getProfile(userId)
    return successResponse({
      meta: { endpoint, method },
      data: profile,
      message: "Profile fetched successfully",
    })
  }
}

export const authController = new AuthController()
