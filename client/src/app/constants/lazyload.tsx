import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from "react"

import { PageLoader } from "@/components/core/page-loader"

function withPageLoader(
  Component: LazyExoticComponent<ComponentType<object>>,
): () => ReactNode {
  return function PageWithLoader() {
    return (
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    )
  }
}

const LazyDocumentsPage = lazy(() =>
  import("@/pages/documents-page").then((module) => ({
    default: module.DocumentsPage,
  })),
)

const LazyDocumentPage = lazy(() =>
  import("@/pages/document-page").then((module) => ({
    default: module.DocumentPage,
  })),
)

const LazyLoginPage = lazy(() =>
  import("@/pages/login-page").then((module) => ({
    default: module.LoginPage,
  })),
)

const LazyRegisterPage = lazy(() =>
  import("@/pages/register-page").then((module) => ({
    default: module.RegisterPage,
  })),
)

const LazyVerifyOtpPage = lazy(() =>
  import("@/pages/verify-otp-page").then((module) => ({
    default: module.VerifyOtpPage,
  })),
)

export const lazyPages = {
  DocumentsPage: withPageLoader(LazyDocumentsPage),
  DocumentPage: withPageLoader(LazyDocumentPage),
  LoginPage: withPageLoader(LazyLoginPage),
  RegisterPage: withPageLoader(LazyRegisterPage),
  VerifyOtpPage: withPageLoader(LazyVerifyOtpPage),
} as const

export type LazyPageKey = keyof typeof lazyPages
