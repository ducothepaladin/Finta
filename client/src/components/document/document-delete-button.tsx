import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DocumentDeleteButtonProps = {
  documentName: string
  onClick: () => void
  className?: string
}

export function DocumentDeleteButton({
  documentName,
  onClick,
  className,
}: DocumentDeleteButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={`Delete ${documentName}`}
      className={cn(
        "text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100",
        className,
      )}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick()
      }}
    >
      <Trash2 />
    </Button>
  )
}
