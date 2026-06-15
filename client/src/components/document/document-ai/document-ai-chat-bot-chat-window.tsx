import { DocumentAiChatBotChatMessage } from "@/components/document/document-ai/document-ai-chat-bot-chat-message"
import { CHAT_SUGGESTIONS } from "@/lib/document-ai-mock"
import type { DocumentChatMessage } from "@/types/document"

type DocumentAiChatBotChatWindowProps = {
  messages: DocumentChatMessage[]
  showSuggestions: boolean
  onSuggestionSelect: (text: string) => void
}

export function DocumentAiChatBotChatWindow({
  messages,
  showSuggestions,
  onSuggestionSelect,
}: DocumentAiChatBotChatWindowProps) {
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2.5">
        {messages.map((message) => (
          <DocumentAiChatBotChatMessage key={message.id} message={message} />
        ))}
      </div>

      {showSuggestions && (
        <>
          <p className="px-2.5 text-[10px] tracking-[0.03em] text-muted-foreground">
            Suggested
          </p>
          <div className="flex shrink-0 flex-col gap-1.5 px-2.5 pb-2">
            {CHAT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionSelect(suggestion)}
                className="rounded-md border border-border bg-secondary/50 px-2.5 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:border-border-emphasis hover:bg-secondary"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}
