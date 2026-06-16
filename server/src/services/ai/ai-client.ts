import { env } from "../../config/env.js"
import type {
  AiCompleteOptions,
  AiCompleteResult,
  AiMessage,
  AiStreamChunk,
} from "./ai.types.js"
import { HttpError } from "../../lib/http-error.js"

type GeneratePayload = {
  messages: AiMessage[]
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (env.aiInternalToken) {
    headers["X-Internal-Token"] = env.aiInternalToken
  }
  return headers
}

function aiUrl(path: string): string {
  return `${env.aiServiceUrl.replace(/\/+$/, "")}${path}`
}

export async function completeMessages(
  messages: AiMessage[],
  options: AiCompleteOptions = {},
): Promise<AiCompleteResult> {
  const payload: GeneratePayload = {
    messages,
    model: options.model ?? env.aiDefaultModel,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 2048,
    stream: false,
  }

  let response: Response
  try {
    response = await fetch(aiUrl("/v1/generate"), {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new HttpError(502, `AI service unreachable: ${message}`)
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new HttpError(
      502,
      `AI service error (${response.status}): ${body || response.statusText}`,
    )
  }

  const data = (await response.json()) as AiCompleteResult & { error?: string }
  if (!data.content?.trim()) {
    throw new HttpError(502, "AI service returned an empty response")
  }

  return data
}

export async function* streamMessages(
  messages: AiMessage[],
  options: AiCompleteOptions = {},
): AsyncGenerator<AiStreamChunk> {
  const payload: GeneratePayload = {
    messages,
    model: options.model ?? env.aiDefaultModel,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 2048,
    stream: true,
  }

  let response: Response
  try {
    response = await fetch(aiUrl("/v1/generate"), {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new HttpError(502, `AI service unreachable: ${message}`)
  }

  if (!response.ok || !response.body) {
    const body = await response.text().catch(() => "")
    throw new HttpError(
      502,
      `AI service error (${response.status}): ${body || response.statusText}`,
    )
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
      const lines = part.split("\n")
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue
        const raw = line.slice(6).trim()
        if (!raw) continue

        const parsed = JSON.parse(raw) as AiStreamChunk & { error?: string }
        if (parsed.error) {
          throw new HttpError(502, parsed.error)
        }
        yield parsed
      }
    }
  }
}
