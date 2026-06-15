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
): Promise<DocumentDto> {
  if (!file?.buffer?.length) {
    throw new HttpError(400, "file is required")
  }

  if (!isPdf(file)) {
    throw new HttpError(400, "Only PDF files are supported")
  }

  const uploaded = await uploadBufferToFileService({
    fileServiceBase: env.fileServiceUrl,
    buffer: new Uint8Array(file.buffer),
    originalName: file.originalname,
    mimeType: file.mimetype || "application/pdf",
    folderPath: env.uploadFilePath,
  })

  const originalFileName = file.originalname.trim() || "document.pdf"
  const workspace = await workspaceRepository.create({
    userId,
    name: stripExtension(originalFileName),
    originalFileName,
    type: "application/pdf",
    fileUrl: uploaded.fileUrl,
    size: file.size,
  })

  return toDocumentDto(workspace)
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
