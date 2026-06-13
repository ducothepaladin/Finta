import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios"

import { appConfig } from "../config/app-config"
import { useUserStore } from "@/stores/user-store"

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

function isLoginOrRegister(url: string): boolean {
  return url.includes("/auth/login") || url.includes("/auth/register")
}

function isRefreshUrl(url: string): boolean {
  return url.includes("/auth/refresh")
}

function isLogoutUrl(url: string): boolean {
  return url.includes("/auth/logout")
}

let refreshPromise: Promise<void> | null = null

function getRefreshPromise(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post("/auth/refresh")
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

let sessionExpiredHandling: Promise<void> | null = null

function handleSessionExpired(): Promise<void> {
  if (!sessionExpiredHandling) {
    sessionExpiredHandling = (async () => {
      try {
        await apiClient.post("/auth/logout")
      } catch {
        // Session may already be invalid.
      }
      useUserStore.getState().clearUser()
      if (window.location.pathname !== "/login") {
        window.location.assign("/login")
      }
    })().finally(() => {
      sessionExpiredHandling = null
    })
  }
  return sessionExpiredHandling
}

apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"]
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error)
    }

    const url = originalRequest.url ?? ""

    if (isLoginOrRegister(url)) {
      return Promise.reject(error)
    }

    if (isRefreshUrl(url)) {
      await handleSessionExpired()
      return Promise.reject(error)
    }

    if (isLogoutUrl(url)) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      await handleSessionExpired()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      await getRefreshPromise()
      return apiClient(originalRequest)
    } catch {
      await handleSessionExpired()
      return Promise.reject(error)
    }
  },
)

export default apiClient
