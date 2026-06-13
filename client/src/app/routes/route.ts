import { createElement } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"

import { lazyPages } from "@/app/constants/lazyload"

export const router = createBrowserRouter([
  {
    path: "/",
    element: createElement(Navigate, { to: "/documents", replace: true }),
  },
  {
    path: "/documents",
    element: createElement(lazyPages.DocumentsPage),
  },
  {
    path: "/document/:id",
    element: createElement(lazyPages.DocumentPage),
  },
])
