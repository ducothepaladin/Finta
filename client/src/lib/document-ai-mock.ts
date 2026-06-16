export const CHAT_SUGGESTIONS = [
  "What is the main argument here?",
  "Summarize this page",
  "Explain the highlighted text",
] as const

export function createHistoryId(): string {
  return `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createChatMessageId(): string {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
