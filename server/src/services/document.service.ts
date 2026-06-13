import { env } from "../config/env.js"
import type { ListDocumentsQuery } from "../dtos/document/list-documents-query.dto.js"
import {
  toDocumentDto,
  toDocumentListDto,
  type DocumentDto,
  type DocumentListDto,
} from "../dtos/document/document.dto.js"
import { HttpError } from "../lib/http-error.js"
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
