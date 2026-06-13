import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@/style/index.css"
import App from "./App.tsx"
import { QueryProvider } from "@/app/providers/query-provider"
import { AuthBootstrap } from "@/components/core/auth-bootstrap"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <TooltipProvider>
          <AuthBootstrap>
            <App />
          </AuthBootstrap>
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>,
)
