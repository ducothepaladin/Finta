import type { AiMessage } from "./ai.types.js"

export type TranslatePromptInput = {
  selectedText: string
  targetLanguage: string
  documentName: string
  pageNumber: number
}

export type SummarizePromptInput = {
  selectedText: string
  documentName: string
  pageNumber: number
}

export type ChatPromptInput = {
  documentName: string
  pageNumber: number
  message: string
  history: Array<{ role: "user" | "assistant"; content: string }>
}

export function buildTranslateMessages(
  input: TranslatePromptInput,
): AiMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a professional document translator. Preserve meaning, tone, and formatting cues. Return only the translated text without commentary.",
    },
    {
      role: "user",
      content: `Document: ${input.documentName}\nPage: ${input.pageNumber}\nTarget language: ${input.targetLanguage}\n\nTranslate the following text:\n\n${input.selectedText}`,
    },
  ]
}

export function buildSummarizeMessages(
  input: SummarizePromptInput,
): AiMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a concise document summarizer. Produce a clear summary in 2-4 sentences. Return only the summary.",
    },
    {
      role: "user",
      content: `Document: ${input.documentName}\nPage: ${input.pageNumber}\n\nSummarize the following text:\n\n${input.selectedText}`,
    },
  ]
}

export function buildChatMessages(input: ChatPromptInput): AiMessage[] {
  const messages: AiMessage[] = [
    {
      role: "system",
      content: `You are a helpful assistant answering questions about the document "${input.documentName}". Focus on page ${input.pageNumber} unless the user asks about the full document. Be concise and accurate.`,
    },
  ]

  for (const entry of input.history) {
    messages.push({
      role: entry.role,
      content: entry.content,
    })
  }

  messages.push({
    role: "user",
    content: input.message,
  })

  return messages
}
