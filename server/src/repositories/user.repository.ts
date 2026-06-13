import type { Types } from "mongoose"

import { User, type UserDocument } from "../models/user.model.js"

export type CreateUserRecord = {
  name: string
  username: string
  email: string
  password: string
}

export type UpdateProfileRecord = {
  name?: string
  username?: string
}

class UserRepository {
  findById(id: string) {
    return User.findById(id).exec()
  }

  findByEmail(email: string) {
    return User.findOne({ email: email.toLowerCase() }).exec()
  }

  findByUsername(username: string) {
    return User.findOne({ username: username.toLowerCase() }).exec()
  }

  findByUsernameExcludingId(username: string, excludeUserId: string) {
    return User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: excludeUserId },
    }).exec()
  }

  create(data: CreateUserRecord) {
    return User.create({
      name: data.name,
      username: data.username.toLowerCase(),
      email: data.email.toLowerCase(),
      password: data.password,
    })
  }

  updateRefreshTokenHash(userId: string, refreshTokenHash: string | null) {
    return User.findByIdAndUpdate(userId, { refreshTokenHash }).exec()
  }

  updateProfile(userId: string, data: UpdateProfileRecord) {
    return User.findByIdAndUpdate(userId, data, { new: true }).exec()
  }

  updatePassword(userId: string, passwordHash: string) {
    return User.findByIdAndUpdate(userId, {
      password: passwordHash,
      refreshTokenHash: null,
    }).exec()
  }

  setOtp(userId: string, otpHash: string, otpExpiresAt: Date) {
    return User.findByIdAndUpdate(userId, { otpHash, otpExpiresAt }).exec()
  }

  clearOtp(userId: string) {
    return User.findByIdAndUpdate(userId, {
      otpHash: null,
      otpExpiresAt: null,
    }).exec()
  }

  markOtpVerified(userId: string) {
    return User.findByIdAndUpdate(
      userId,
      {
        isOtpVerified: true,
        otpHash: null,
        otpExpiresAt: null,
      },
      { new: true },
    ).exec()
  }
}

export const userRepository = new UserRepository()

export type UserEntity = UserDocument & {
  _id: Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}
