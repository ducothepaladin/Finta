import { appConfig } from "@/app/config/app-config"
import type { ApiEnvelope } from "@/types/auth"
import type {
  DocumentAiHistoryResponse,
  DocumentAiTask,
  DocumentChatHistoryEntry,
} from "@/types/document"

type AiTaskApiResponse = ApiEnvelope<{ task: DocumentAiTask }>
type AiHistoryApiResponse = ApiEnvelope<DocumentAiHistoryResponse>

export type ChatStreamChunk = {
  delta?: string
  done?: boolean
  error?: string
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string }
    return payload.message ?? response.statusText
  } catch {
    return response.statusText
  }
}

export const documentAiService = {
  translate: async (params: {
    documentId: string
    selectedText: string
    pageNumber: number
    targetLanguage?: string
  }): Promise<DocumentAiTask> => {
    const response = await fetch(
      `${appConfig.apiBaseUrl}/documents/${params.documentId}/translate`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedText: params.selectedText,
          pageNumber: params.pageNumber,
          targetLanguage: params.targetLanguage,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(await parseApiError(response))
    }

    const payload = (await response.json()) as AiTaskApiResponse
    return payload.data.task
  },

  summarize: async (params: {
    documentId: string
    selectedText: string
    pageNumber: number
  }): Promise<DocumentAiTask> => {
    const response = await fetch(
      `${appConfig.apiBaseUrl}/documents/${params.documentId}/summarize`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedText: params.selectedText,
          pageNumber: params.pageNumber,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(await parseApiError(response))
    }

    const payload = (await response.json()) as AiTaskApiResponse
    return payload.data.task
  },

  getHistory: async (documentId: string): Promise<DocumentAiTask[]> => {
    const response = await fetch(
      `${appConfig.apiBaseUrl}/documents/${documentId}/ai/history`,
      {
        credentials: "include",
      },
    )

    if (!response.ok) {
      throw new Error(await parseApiError(response))
    }

    const payload = (await response.json()) as AiHistoryApiResponse
    return payload.data.tasks
  },

  streamChat: async function* (
    params: {
      documentId: string
      message: string
      pageNumber: number
      history: DocumentChatHistoryEntry[]
    },
    signal?: AbortSignal,
  ): AsyncGenerator<ChatStreamChunk> {
    const response = await fetch(
      `${appConfig.apiBaseUrl}/documents/${params.documentId}/chat`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message: params.message,
          pageNumber: params.pageNumber,
          history: params.history,
        }),
        signal,
      },
    )

    if (!response.ok || !response.body) {
      throw new Error(await parseApiError(response))
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split("\n\n")
      buffer = parts.pop() ?? ""

      for (const part of parts) {
        const line = part
          .split("\n")
          .find((entry) => entry.startsWith("data: "))
        if (!line) continue

        const raw = line.slice(6).trim()
        if (!raw) continue

        const parsed = JSON.parse(raw) as ChatStreamChunk
        yield parsed
      }
    }
  },
}
