import { Send } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type DocumentAiChatBotPromptAreaProps = {
  disabled?: boolean
  onSend: (text: string) => void
}

export function DocumentAiChatBotPromptArea({
  disabled = false,
  onSend,
}: DocumentAiChatBotPromptAreaProps) {
  const [value, setValue] = useState("")

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5 border-t border-border px-2.5 py-2">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") handleSend()
        }}
        placeholder="Ask anything about this page…"
        disabled={disabled}
        className="h-8 bg-secondary/50 text-xs"
      />
      <Button
        type="button"
        size="icon-sm"
        className="shrink-0 rounded-full"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <Send className="size-3.5" />
      </Button>
    </div>
  )
}
