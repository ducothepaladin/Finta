import type { Types } from "mongoose"

import type { NormalizedRect } from "../../models/types.js"
import { AiTask } from "../../models/ai-task.model.js"
import { Selection } from "../../models/selection.model.js"
import { HttpError } from "../../lib/http-error.js"
import { workspaceRepository } from "../../repositories/workspace.repository.js"
import {
  buildChatMessages,
  buildSummarizeMessages,
  buildTranslateMessages,
} from "./prompts.js"
import { completeMessages, streamMessages } from "./ai-client.js"
import { env } from "../../config/env.js"

export type TranslateDocumentInput = {
  userId: string
  documentId: string
  selectedText: string
  pageNumber: number
  targetLanguage?: string
  rects?: NormalizedRect[]
}

export type SummarizeDocumentInput = {
  userId: string
  documentId: string
  selectedText: string
  pageNumber: number
  rects?: NormalizedRect[]
}

export type ChatDocumentInput = {
  userId: string
  documentId: string
  message: string
  pageNumber: number
  history?: Array<{ role: "user" | "assistant"; content: string }>
}

export type AiTaskResult = {
  id: string
  type: "translate" | "summarize"
  output: string
  pageNumber: number
  createdAt: string
}

async function getOwnedDocument(userId: string, documentId: string) {
  const workspace = await workspaceRepository.findByIdForUser(documentId, userId)
  if (!workspace) {
    throw new HttpError(404, "Document not found")
  }
  return workspace
}

async function createSelection(params: {
  userId: string
  workspaceId: Types.ObjectId
  pageNumber: number
  selectedText: string
  rects?: NormalizedRect[]
}) {
  const rects =
    params.rects && params.rects.length > 0
      ? params.rects
      : [{ x: 0, y: 0, w: 1, h: 0.01 }]

  return Selection.create({
    userId: params.userId,
    workspaceId: params.workspaceId,
    pageNumber: params.pageNumber,
    selectedText: params.selectedText,
    rects,
  })
}

export async function translateDocument(
  input: TranslateDocumentInput,
): Promise<AiTaskResult> {
  const workspace = await getOwnedDocument(input.userId, input.documentId)
  const selectedText = input.selectedText.trim()
  if (!selectedText) {
    throw new HttpError(400, "selectedText is required")
  }

  const startedAt = Date.now()
  const messages = buildTranslateMessages({
    selectedText,
    targetLanguage: input.targetLanguage?.trim() || "English",
    documentName: workspace.name,
    pageNumber: input.pageNumber,
  })

  const result = await completeMessages(messages, { temperature: 0.2 })
  const selection = await createSelection({
    userId: input.userId,
    workspaceId: workspace._id,
    pageNumber: input.pageNumber,
    selectedText,
    rects: input.rects,
  })

  const task = await AiTask.create({
    userId: input.userId,
    workspaceId: workspace._id,
    selectionId: selection._id,
    type: "translate",
    config: {
      targetLanguage: input.targetLanguage ?? "English",
      pageNumber: input.pageNumber,
    },
    input: selectedText,
    output: result.content,
    model: result.model ?? env.aiDefaultModel,
    status: "completed",
    duration: Date.now() - startedAt,
  })

  return {
    id: task._id.toString(),
    type: "translate",
    output: result.content,
    pageNumber: input.pageNumber,
    createdAt: task.createdAt?.toISOString() ?? new Date().toISOString(),
  }
}

export async function summarizeDocument(
  input: SummarizeDocumentInput,
): Promise<AiTaskResult> {
  const workspace = await getOwnedDocument(input.userId, input.documentId)
  const selectedText = input.selectedText.trim()
  if (!selectedText) {
    throw new HttpError(400, "selectedText is required")
  }

  const startedAt = Date.now()
  const messages = buildSummarizeMessages({
    selectedText,
    documentName: workspace.name,
    pageNumber: input.pageNumber,
  })

  const result = await completeMessages(messages, { temperature: 0.3 })
  const selection = await createSelection({
    userId: input.userId,
    workspaceId: workspace._id,
    pageNumber: input.pageNumber,
    selectedText,
    rects: input.rects,
  })

  const task = await AiTask.create({
    userId: input.userId,
    workspaceId: workspace._id,
    selectionId: selection._id,
    type: "summarize",
    config: { pageNumber: input.pageNumber },
    input: selectedText,
    output: result.content,
    model: result.model ?? env.aiDefaultModel,
    status: "completed",
    duration: Date.now() - startedAt,
  })

  return {
    id: task._id.toString(),
    type: "summarize",
    output: result.content,
    pageNumber: input.pageNumber,
    createdAt: task.createdAt?.toISOString() ?? new Date().toISOString(),
  }
}

export async function streamDocumentChat(input: ChatDocumentInput) {
  const workspace = await getOwnedDocument(input.userId, input.documentId)
  const message = input.message.trim()
  if (!message) {
    throw new HttpError(400, "message is required")
  }

  const messages = buildChatMessages({
    documentName: workspace.name,
    pageNumber: input.pageNumber,
    message,
    history: input.history ?? [],
  })

  return streamMessages(messages, { temperature: 0.4 })
}

export async function listDocumentAiHistory(
  userId: string,
  documentId: string,
): Promise<AiTaskResult[]> {
  await getOwnedDocument(userId, documentId)

  const tasks = await AiTask.find({
    userId,
    workspaceId: documentId,
    type: { $in: ["translate", "summarize"] },
    status: "completed",
  })
    .sort({ createdAt: -1 })
    .limit(50)

  return tasks.map((task) => {
    const config = (task.config ?? {}) as { pageNumber?: number }
    return {
      id: task._id.toString(),
      type: task.type as "translate" | "summarize",
      output: task.output ?? "",
      pageNumber: config.pageNumber ?? 1,
      createdAt: task.createdAt?.toISOString() ?? new Date().toISOString(),
    }
  })
}

export async function saveChatTask(params: {
  userId: string
  documentId: string
  pageNumber: number
  message: string
  output: string
  model: string
  duration: number
}) {
  const workspace = await getOwnedDocument(params.userId, params.documentId)
  const selection = await createSelection({
    userId: params.userId,
    workspaceId: workspace._id,
    pageNumber: params.pageNumber,
    selectedText: params.message,
  })

  await AiTask.create({
    userId: params.userId,
    workspaceId: workspace._id,
    selectionId: selection._id,
    type: "chat",
    config: { pageNumber: params.pageNumber },
    input: params.message,
    output: params.output,
    model: params.model,
    status: "completed",
    duration: params.duration,
  })
}
