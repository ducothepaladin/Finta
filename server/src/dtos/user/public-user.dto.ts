import type { Types } from "mongoose"

import type { UserDocument } from "../../models/user.model.js"

export type PublicUserDto = {
  id: string
  name: string
  username: string
  email: string
  isActive: boolean
  isOtpVerified: boolean
  createdAt: string
}

type UserLike = UserDocument & {
  _id: Types.ObjectId
  createdAt?: Date
}

export function toPublicUserDto(user: UserLike): PublicUserDto {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    email: user.email,
    isActive: user.isActive,
    isOtpVerified: user.isOtpVerified,
    createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
  }
}
