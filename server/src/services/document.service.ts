import { env } from "../config/env.js"
import type { ListDocumentsQuery } from "../dtos/document/list-documents-query.dto.js"
import {
  toDocumentDto,
  toDocumentListDto,
  type DocumentDto,
  type DocumentListDto,
} from "../dtos/document/document.dto.js"
import { HttpError } from "../lib/http-error.js"
import { AiTask } from "../models/ai-task.model.js"
import { Note } from "../models/note.model.js"
import { Selection } from "../models/selection.model.js"
import { workspaceRepository } from "../repositories/workspace.repository.js"
import { uploadBufferToFileService } from "./file-service-upload.util.js"
import { renderPdfFirstPageThumbnail } from "./pdf-thumbnail.util.js"
import {
  completeUploadSession,
  failUploadSession,
  getUploadSessionForUser,
  updateUploadSession,
  type UploadSessionSnapshot,
  type UploadSessionStage,
} from "./upload-session.store.js"

const STAGE_BASE_PERCENT: Record<UploadSessionStage, number> = {
  storing_pdf: 8,
  generating_thumbnail: 28,
  storing_thumbnail: 78,
  saving: 92,
}

function thumbnailStageMessage(subPercent: number): string {
  if (subPercent < 30) return "Opening PDF for preview..."
  if (subPercent < 60) return "Rendering first page..."
  return "Creating preview image..."
}

function reportSession(
  sessionId: string | undefined,
  stage: UploadSessionStage,
  percent: number,
  message: string,
) {
  if (!sessionId) return
  updateUploadSession(sessionId, { stage, percent, message })
}

function stripExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".")
  if (dot <= 0) return fileName
  return fileName.slice(0, dot)
}

function isPdf(file: Express.Multer.File): boolean {
  const mime = (file.mimetype || "").trim().toLowerCase()
  if (mime === "application/pdf") return true
  return file.originalname.toLowerCase().endsWith(".pdf")
}

export async function listDocuments(
  userId: string,
  query: ListDocumentsQuery,
): Promise<DocumentListDto> {
  const { data, total } = await workspaceRepository.findPaginated({
    userId,
    page: query.page,
    limit: query.limit,
    q: query.q || undefined,
  })

  const totalPages = Math.max(1, Math.ceil(total / query.limit))

  return toDocumentListDto(data, {
    page: query.page,
    limit: query.limit,
    total,
    totalPages,
  })
}

export async function getDocumentById(
  userId: string,
  id: string,
): Promise<DocumentDto> {
  const workspace = await workspaceRepository.findByIdForUser(id, userId)
  if (!workspace) {
    throw new HttpError(404, "Document not found")
  }
  return toDocumentDto(workspace)
}

export async function uploadDocument(
  userId: string,
  file: Express.Multer.File,
  sessionId?: string,
): Promise<DocumentDto> {
  if (!file?.buffer?.length) {
    throw new HttpError(400, "file is required")
  }

  if (!isPdf(file)) {
    throw new HttpError(400, "Only PDF files are supported")
  }

  try {
    reportSession(
      sessionId,
      "storing_pdf",
      STAGE_BASE_PERCENT.storing_pdf,
      "Saving document...",
    )

    const uploaded = await uploadBufferToFileService({
      fileServiceBase: env.fileServiceUrl,
      buffer: new Uint8Array(file.buffer),
      originalName: file.originalname,
      mimeType: file.mimetype || "application/pdf",
      folderPath: env.uploadFilePath,
    })

    const originalFileName = file.originalname.trim() || "document.pdf"
    const pdfBuffer = new Uint8Array(file.buffer)
    let thumbnailUrl: string | undefined

    reportSession(
      sessionId,
      "generating_thumbnail",
      STAGE_BASE_PERCENT.generating_thumbnail,
      "Generating preview...",
    )

    const thumbnailBuffer = await renderPdfFirstPageThumbnail(
      pdfBuffer,
      (subPercent) => {
        if (!sessionId) return
        const span = STAGE_BASE_PERCENT.storing_thumbnail - STAGE_BASE_PERCENT.generating_thumbnail
        const percent =
          STAGE_BASE_PERCENT.generating_thumbnail +
          Math.round((subPercent / 100) * span)
        updateUploadSession(sessionId, {
          stage: "generating_thumbnail",
          percent,
          message: thumbnailStageMessage(subPercent),
        })
      },
    )

    if (thumbnailBuffer) {
      reportSession(
        sessionId,
        "storing_thumbnail",
        STAGE_BASE_PERCENT.storing_thumbnail,
        "Saving preview...",
      )

      const thumbBaseName = stripExtension(originalFileName)
      const uploadedThumbnail = await uploadBufferToFileService({
        fileServiceBase: env.fileServiceUrl,
        buffer: thumbnailBuffer,
        originalName: `${thumbBaseName}-thumb.jpg`,
        mimeType: "image/jpeg",
        folderPath: `${env.uploadFilePath}/thumbnails`,
      })
      thumbnailUrl = uploadedThumbnail.fileUrl
    }

    reportSession(
      sessionId,
      "saving",
      STAGE_BASE_PERCENT.saving,
      "Finalizing...",
    )

    const workspace = await workspaceRepository.create({
      userId,
      name: stripExtension(originalFileName),
      originalFileName,
      type: "application/pdf",
      fileUrl: uploaded.fileUrl,
      thumbnailUrl,
      size: file.size,
    })

    const document = toDocumentDto(workspace)

    if (sessionId) {
      completeUploadSession(sessionId, document)
    }

    return document
  } catch (error) {
    if (sessionId) {
      const message =
        error instanceof HttpError
          ? error.message
          : "Upload failed"
      failUploadSession(sessionId, message)
    }
    throw error
  }
}

export async function getUploadSession(
  userId: string,
  sessionId: string,
): Promise<UploadSessionSnapshot> {
  const session = getUploadSessionForUser(sessionId, userId)
  if (!session) {
    throw new HttpError(404, "Upload session not found")
  }
  return session
}

export async function deleteDocument(userId: string, id: string): Promise<void> {
  const workspace = await workspaceRepository.findByIdForUser(id, userId)
  if (!workspace) {
    throw new HttpError(404, "Document not found")
  }

  await Promise.all([
    Note.deleteMany({ workspaceId: workspace._id }),
    AiTask.deleteMany({ workspaceId: workspace._id }),
    Selection.deleteMany({ workspaceId: workspace._id }),
  ])

  const result = await workspaceRepository.deleteByIdForUser(id, userId)
  if (result.deletedCount === 0) {
    throw new HttpError(404, "Document not found")
  }
}
