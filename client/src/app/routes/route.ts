import { createElement } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"

import { lazyPages } from "@/app/constants/lazyload"
import { ProtectedRoute } from "@/app/routes/protected-route"
import { AuthLayout } from "@/components/core/layouts/auth-layout"
import { MainLayout } from "@/components/core/layouts/main-layout"
import { ReadingLayout } from "@/components/core/layouts/reading-layout"

export const router = createBrowserRouter([
  {
    path: "/",
    element: createElement(AuthLayout),
    children: [
      {
        path: "login",
        element: createElement(
          ProtectedRoute,
          { guestOnly: true },
          createElement(lazyPages.LoginPage),
        ),
      },
      {
        path: "register",
        element: createElement(
          ProtectedRoute,
          { guestOnly: true },
          createElement(lazyPages.RegisterPage),
        ),
      },
      {
        path: "verify-otp",
        element: createElement(
          ProtectedRoute,
          { requireAuth: true, requireUnverifiedOtp: true },
          createElement(lazyPages.VerifyOtpPage),
        ),
      },
    ],
  },
  {
    path: "/",
    element: createElement(
      ProtectedRoute,
      { requireAuth: true },
      createElement(MainLayout),
    ),
    children: [
      {
        index: true,
        element: createElement(Navigate, { to: "/documents", replace: true }),
      },
      {
        path: "documents",
        element: createElement(lazyPages.DocumentsPage),
      },
    ],
  },
  {
    path: "/",
    element: createElement(
      ProtectedRoute,
      { requireAuth: true },
      createElement(ReadingLayout),
    ),
    children: [
      {
        path: "document/:id",
        element: createElement(lazyPages.DocumentPage),
      },
    ],
  },
])
