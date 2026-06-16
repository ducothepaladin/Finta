export type AiMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type AiCompleteOptions = {
  model?: string
  temperature?: number
  maxTokens?: number
}

export type AiCompleteResult = {
  content: string
  model: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

export type AiStreamChunk = {
  delta: string
  done: boolean
}
