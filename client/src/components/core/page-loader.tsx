import { Spinner } from "@/components/ui/spinner"

export function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background"
    >
      <Spinner className="size-5 text-primary" />
      <p className="text-xs text-muted-foreground">Loading page...</p>
    </div>
  )
}
