import apiClient from "@/app/api/api-client"
import type {
  ApiEnvelope,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
  VerifyOtpPayload,
} from "@/types/auth"

export const authService = {
  refresh: async () => {
    const response = await apiClient.post<ApiEnvelope<Record<string, never>>>(
      "/auth/refresh",
    )
    return response.data
  },

  logout: async () => {
    const response = await apiClient.post<ApiEnvelope<Record<string, never>>>(
      "/auth/logout",
    )
    return response.data
  },

  register: async (payload: RegisterPayload) => {
    const response = await apiClient.post<ApiEnvelope<Record<string, never>>>(
      "/auth/register",
      payload,
    )
    return response.data
  },

  login: async (payload: LoginPayload) => {
    const response = await apiClient.post<ApiEnvelope<Record<string, never>>>(
      "/auth/login",
      payload,
    )
    return response.data
  },

  sendOtp: async () => {
    const response = await apiClient.post<ApiEnvelope<Record<string, never>>>(
      "/auth/send-otp",
    )
    return response.data
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<User> => {
    const response = await apiClient.post<ApiEnvelope<User>>(
      "/auth/verify-otp",
      payload,
    )
    return response.data.data
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiEnvelope<User>>("/auth/me")
    return response.data.data
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const response = await apiClient.patch<ApiEnvelope<User>>(
      "/auth/profile",
      payload,
    )
    return response.data.data
  },

  changePassword: async (payload: ChangePasswordPayload) => {
    const response = await apiClient.post<ApiEnvelope<Record<string, never>>>(
      "/auth/change-password",
      payload,
    )
    return response.data
  },
}
