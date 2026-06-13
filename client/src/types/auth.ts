export type ApiEnvelope<T> = {
  success: number
  code: number
  meta?: {
    endpoint: string
    method: string
  }
  data: T
  message: string
}

export type User = {
  id: string
  name: string
  username: string
  email: string
  isActive: boolean
  isOtpVerified: boolean
  createdAt: string
}

export type RegisterPayload = {
  name: string
  username: string
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type UpdateProfilePayload = {
  name?: string
  username?: string
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export type VerifyOtpPayload = {
  code: string
}
