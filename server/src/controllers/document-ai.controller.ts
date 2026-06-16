import type { RequestHandler } from "express"

import { successResponse } from "../lib/api-response.js"
import { asyncHandler } from "../lib/async-handler.js"
import { HttpError } from "../lib/http-error.js"
import { env } from "../config/env.js"
import * as documentAiService from "../services/ai/document-ai.service.js"

function parsePageNumber(value: unknown): number {
  const page = Number(value)
  if (!Number.isFinite(page) || page < 1) return 1
  return Math.floor(page)
}

function parseHistory(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .filter(
      (entry): entry is { role: "user" | "assistant"; content: string } =>
        typeof entry === "object" &&
        entry !== null &&
        (entry.role === "user" || entry.role === "assistant") &&
        typeof entry.content === "string",
    )
    .slice(-20)
}

class DocumentAiController {
  translate: RequestHandler = asyncHandler(async (req, res) => {
    const documentId = String(req.params.id)
    const selectedText =
      typeof req.body?.selectedText === "string" ? req.body.selectedText : ""
    const targetLanguage =
      typeof req.body?.targetLanguage === "string"
        ? req.body.targetLanguage
        : undefined
    const pageNumber = parsePageNumber(req.body?.pageNumber)
    const rects = Array.isArray(req.body?.rects) ? req.body.rects : undefined

    const result = await documentAiService.translateDocument({
      userId: req.user!.id,
      documentId,
      selectedText,
      pageNumber,
      targetLanguage,
      rects,
    })

    res.json(
      successResponse({
        meta: {
          endpoint: `/api/documents/${documentId}/translate`,
          method: "POST",
        },
        data: { task: result },
        message: "Translation completed",
      }),
    )
  })

  summarize: RequestHandler = asyncHandler(async (req, res) => {
    const documentId = String(req.params.id)
    const selectedText =
      typeof req.body?.selectedText === "string" ? req.body.selectedText : ""
    const pageNumber = parsePageNumber(req.body?.pageNumber)
    const rects = Array.isArray(req.body?.rects) ? req.body.rects : undefined

    const result = await documentAiService.summarizeDocument({
      userId: req.user!.id,
      documentId,
      selectedText,
      pageNumber,
      rects,
    })

    res.json(
      successResponse({
        meta: {
          endpoint: `/api/documents/${documentId}/summarize`,
          method: "POST",
        },
        data: { task: result },
        message: "Summary completed",
      }),
    )
  })

  chat: RequestHandler = asyncHandler(async (req, res) => {
    const documentId = String(req.params.id)
    const message = typeof req.body?.message === "string" ? req.body.message : ""
    const pageNumber = parsePageNumber(req.body?.pageNumber)
    const history = parseHistory(req.body?.history)

    if (!message.trim()) {
      throw new HttpError(400, "message is required")
    }

    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    const startedAt = Date.now()
    let fullReply = ""

    try {
      const stream = await documentAiService.streamDocumentChat({
        userId: req.user!.id,
        documentId,
        message,
        pageNumber,
        history,
      })

      for await (const chunk of stream) {
        if (chunk.delta) {
          fullReply += chunk.delta
        }
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
      }

      await documentAiService.saveChatTask({
        userId: req.user!.id,
        documentId,
        pageNumber,
        message,
        output: fullReply,
        model: env.aiDefaultModel,
        duration: Date.now() - startedAt,
      })

      res.end()
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Chat stream failed"
      res.write(`data: ${JSON.stringify({ error: messageText })}\n\n`)
      res.end()
    }
  })

  history: RequestHandler = asyncHandler(async (req, res) => {
    const documentId = String(req.params.id)
    const tasks = await documentAiService.listDocumentAiHistory(
      req.user!.id,
      documentId,
    )

    res.json(
      successResponse({
        meta: {
          endpoint: `/api/documents/${documentId}/ai/history`,
          method: "GET",
        },
        data: { tasks },
        message: "AI history fetched successfully",
      }),
    )
  })
}

export const documentAiController = new DocumentAiController()
