import bcrypt from "bcrypt"
import jwt, { type SignOptions } from "jsonwebtoken"
import { randomInt } from "node:crypto"

import type { ChangePasswordDto } from "../dtos/auth/change-password.dto.js"
import type { LoginDto } from "../dtos/auth/login.dto.js"
import type { RegisterDto } from "../dtos/auth/register.dto.js"
import type { UpdateProfileDto } from "../dtos/auth/update-profile.dto.js"
import {
  toPublicUserDto,
  type PublicUserDto,
} from "../dtos/user/public-user.dto.js"
import { env } from "../config/env.js"
import { HttpError } from "../lib/http-error.js"
import { userRepository } from "../repositories/user.repository.js"
import type { JwtPayload } from "../types/jwt-payload.type.js"
import { sendOtpEmail } from "./mailer.service.js"

const BCRYPT_ROUNDS = 10

async function issueTokens(userId: string, email: string) {
  const payload: JwtPayload = { sub: userId, email }

  const accessToken = jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  } as SignOptions)
  const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  } as SignOptions)

  const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS)
  await userRepository.updateRefreshTokenHash(userId, refreshTokenHash)

  return { accessToken, refreshToken }
}

function verifyRefreshToken(refreshToken: string): JwtPayload {
  try {
    return jwt.verify(refreshToken, env.jwtRefreshSecret) as JwtPayload
  } catch {
    throw new HttpError(401, "Invalid refresh token")
  }
}

async function generateAndSendOtp(userId: string, email: string) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0")
  const otpHash = await bcrypt.hash(code, BCRYPT_ROUNDS)
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await userRepository.setOtp(userId, otpHash, otpExpiresAt)
  await sendOtpEmail(email, code)
}

export async function register(dto: RegisterDto) {
  const existingEmail = await userRepository.findByEmail(dto.email)
  if (existingEmail) {
    throw new HttpError(401, "Email already registered")
  }

  const existingUsername = await userRepository.findByUsername(dto.username)
  if (existingUsername) {
    throw new HttpError(409, "Username already taken")
  }

  const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)
  const user = await userRepository.create({
    name: dto.name,
    username: dto.username,
    email: dto.email,
    password: passwordHash,
  })

  await generateAndSendOtp(user._id.toString(), user.email)
  return issueTokens(user._id.toString(), user.email)
}

export async function login(dto: LoginDto) {
  const user = await userRepository.findByEmail(dto.email)
  if (!user) {
    throw new HttpError(401, "Invalid credentials")
  }

  const isPasswordValid = await bcrypt.compare(dto.password, user.password)
  if (!isPasswordValid) {
    throw new HttpError(401, "Invalid credentials")
  }

  if (!user.isActive) {
    throw new HttpError(401, "Account is deactivated")
  }

  return issueTokens(user._id.toString(), user.email)
}

export async function refreshTokens(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken)
  const user = await userRepository.findById(payload.sub)
  if (!user || !user.refreshTokenHash) {
    throw new HttpError(401, "Invalid refresh token")
  }

  const isTokenMatched = await bcrypt.compare(refreshToken, user.refreshTokenHash)
  if (!isTokenMatched) {
    throw new HttpError(401, "Invalid refresh token")
  }

  if (!user.isActive) {
    throw new HttpError(401, "Account is deactivated")
  }

  return issueTokens(user._id.toString(), user.email)
}

export async function clearRefreshToken(userId: string) {
  await userRepository.updateRefreshTokenHash(userId, null)
}

export async function getProfile(userId: string): Promise<PublicUserDto> {
  const user = await userRepository.findById(userId)
  if (!user) {
    throw new HttpError(401, "Invalid access token")
  }

  return toPublicUserDto(user)
}

export async function updateProfile(
  userId: string,
  dto: UpdateProfileDto,
): Promise<PublicUserDto> {
  if (dto.username) {
    const existing = await userRepository.findByUsernameExcludingId(
      dto.username,
      userId,
    )
    if (existing) {
      throw new HttpError(409, "Username already taken")
    }
  }

  const user = await userRepository.updateProfile(userId, dto)
  if (!user) {
    throw new HttpError(401, "Invalid access token")
  }

  return toPublicUserDto(user)
}

export async function changePassword(userId: string, dto: ChangePasswordDto) {
  const user = await userRepository.findById(userId)
  if (!user) {
    throw new HttpError(401, "Invalid access token")
  }

  const isCurrentValid = await bcrypt.compare(
    dto.currentPassword,
    user.password,
  )
  if (!isCurrentValid) {
    throw new HttpError(401, "Current password is incorrect")
  }

  if (dto.currentPassword === dto.newPassword) {
    throw new HttpError(400, "New password must be different from current password")
  }

  const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS)
  await userRepository.updatePassword(userId, passwordHash)

  return { success: true }
}

export async function sendOtp(userId: string) {
  const user = await userRepository.findById(userId)
  if (!user) {
    throw new HttpError(401, "Invalid access token")
  }

  if (user.isOtpVerified) {
    throw new HttpError(400, "OTP is already verified")
  }

  await generateAndSendOtp(user._id.toString(), user.email)
  return { success: true }
}

export async function verifyOtp(
  userId: string,
  code: string,
): Promise<PublicUserDto> {
  const user = await userRepository.findById(userId)
  if (!user) {
    throw new HttpError(401, "Invalid access token")
  }

  if (user.isOtpVerified) {
    return toPublicUserDto(user)
  }

  const otpHash = user.otpHash
  const otpExpiresAt = user.otpExpiresAt
  if (!otpHash || !otpExpiresAt) {
    throw new HttpError(400, "Invalid or expired code")
  }

  if (otpExpiresAt.getTime() < Date.now()) {
    await userRepository.clearOtp(userId)
    throw new HttpError(400, "Invalid or expired code")
  }

  const matched = await bcrypt.compare(code, otpHash)
  if (!matched) {
    throw new HttpError(400, "Invalid or expired code")
  }

  const updated = await userRepository.markOtpVerified(userId)
  if (!updated) {
    throw new HttpError(401, "Invalid access token")
  }

  return toPublicUserDto(updated)
}

export function verifyAccessToken(accessToken: string): JwtPayload {
  try {
    return jwt.verify(accessToken, env.jwtAccessSecret) as JwtPayload
  } catch {
    throw new HttpError(401, "Invalid or expired access token")
  }
}
