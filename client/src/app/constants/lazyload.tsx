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
  import("@/app/pages/documents-page").then((module) => ({
    default: module.DocumentsPage,
  })),
)

const LazyDocumentPage = lazy(() =>
  import("@/app/pages/document-page").then((module) => ({
    default: module.DocumentPage,
  })),
)

export const lazyPages = {
  DocumentsPage: withPageLoader(LazyDocumentsPage),
  DocumentPage: withPageLoader(LazyDocumentPage),
} as const

export type LazyPageKey = keyof typeof lazyPages
