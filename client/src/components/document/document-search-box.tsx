import { Search } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

type DocumentSearchBoxProps = {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function DocumentSearchBox({
  value,
  onChange,
  placeholder = "Search documents...",
  className,
}: DocumentSearchBoxProps) {
  return (
    <InputGroup className={cn("h-9 bg-input", className)}>
      <InputGroupAddon align="inline-start">
        <Search className="size-4 text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        aria-label="Search documents"
      />
    </InputGroup>
  )
}
