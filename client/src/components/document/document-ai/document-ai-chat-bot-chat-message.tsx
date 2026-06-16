import { cn } from "@/lib/utils"
import type { DocumentChatMessage } from "@/types/document"

type DocumentAiChatBotChatMessageProps = {
  message: DocumentChatMessage
}

export function DocumentAiChatBotChatMessage({
  message,
}: DocumentAiChatBotChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "max-w-[94%] rounded-[11px] px-[11px] py-2 text-xs leading-[1.55]",
        isUser
          ? "self-end rounded-br-[3px] bg-primary/10 text-primary"
          : "self-start rounded-bl-[3px] border border-border bg-secondary/50 text-foreground",
        message.isTyping && "text-muted-foreground italic",
      )}
    >
      {message.text || (message.isTyping ? "Thinking…" : "")}
    </div>
  )
}
