import { Bot, X } from "lucide-react"

import { DocumentAiChatBotChatWindow } from "@/components/document/document-ai/document-ai-chat-bot-chat-window"
import { DocumentAiChatBotPromptArea } from "@/components/document/document-ai/document-ai-chat-bot-prompt-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DocumentChatMessage } from "@/types/document"

type DocumentAiChatBotDrawerProps = {
  open: boolean
  currentPage: number
  messages: DocumentChatMessage[]
  showSuggestions: boolean
  isSending: boolean
  onClose: () => void
  onSend: (text: string) => void
  onSuggestionSelect: (text: string) => void
}

export function DocumentAiChatBotDrawer({
  open,
  currentPage,
  messages,
  showSuggestions,
  isSending,
  onClose,
  onSend,
  onSuggestionSelect,
}: DocumentAiChatBotDrawerProps) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col overflow-hidden border-l border-border bg-card transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        open ? "w-[360px]" : "w-0 border-l-0",
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "flex min-w-[360px] flex-1 flex-col",
          !open && "invisible",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Bot className="size-4 text-primary" />
            Ask about page {currentPage}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close chat"
          >
            <X className="size-4" />
          </Button>
        </div>

        <DocumentAiChatBotChatWindow
          messages={messages}
          showSuggestions={showSuggestions}
          onSuggestionSelect={onSuggestionSelect}
        />

        <DocumentAiChatBotPromptArea disabled={isSending} onSend={onSend} />
      </div>
    </aside>
  )
}
