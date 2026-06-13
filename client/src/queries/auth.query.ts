import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { authService } from "@/services/auth.service"
import { useUserStore } from "@/stores/user-store"
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from "@/types/auth"

export const authQueryKeys = {
  me: ["auth", "me"] as const,
}

export function useProfileQuery() {
  const setUser = useUserStore((state) => state.setUser)
  const clearUser = useUserStore((state) => state.clearUser)

  const query = useQuery({
    queryKey: authQueryKeys.me,
    queryFn: () => authService.getMe(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    }
  }, [query.data, setUser])

  useEffect(() => {
    if (query.isError) {
      clearUser()
    }
  }, [query.isError, clearUser])

  return query
}

export function useRegisterMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.me })
      toast.success("Account created")
    },
    onError: () => {
      toast.error("Registration failed")
    },
  })
}

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.me })
      toast.success("Signed in")
    },
    onError: () => {
      toast.error("Invalid email or password")
    },
  })
}

export function useSendOtpMutation() {
  return useMutation({
    mutationFn: () => authService.sendOtp(),
    onSuccess: () => {
      toast.success("Verification code sent")
    },
    onError: () => {
      toast.error("Failed to send verification code")
    },
  })
}

export function useVerifyOtpMutation() {
  const queryClient = useQueryClient()
  const setUser = useUserStore((state) => state.setUser)

  return useMutation({
    mutationFn: (payload: { code: string }) => authService.verifyOtp(payload),
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(authQueryKeys.me, user)
      toast.success("Email verified")
    },
    onError: () => {
      toast.error("Invalid or expired code")
    },
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  const setUser = useUserStore((state) => state.setUser)

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      authService.updateProfile(payload),
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(authQueryKeys.me, user)
      toast.success("Profile updated")
    },
    onError: () => {
      toast.error("Failed to update profile")
    },
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      authService.changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed")
    },
    onError: () => {
      toast.error("Could not change password")
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const clearUser = useUserStore((state) => state.clearUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearUser()
      queryClient.removeQueries({ queryKey: authQueryKeys.me })
      navigate("/login")
    },
  })
}
