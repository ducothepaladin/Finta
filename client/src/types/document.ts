import type { ApiEnvelope } from "./auth"

export type DocumentPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type DocumentDto = {
  id: string
  name: string
  originalFileName: string
  fileUrl: string
  sizeBytes: number
  type: string
  createdAt: string
  updatedAt: string
}

export type DocumentListResponse = {
  documents: DocumentDto[]
  pagination: DocumentPagination
}

export type DocumentListParams = {
  page: number
  limit: number
  q?: string
}

export type DocumentUploadResponse = {
  document: DocumentDto
}

export type DocumentItem = {
  id: string
  name: string
  originalFileName: string
  fileUrl: string
  size: string
  sizeBytes: number
  type: string
  createdAt: string
  updatedAt: string
  currentPage: number
  totalPages: number
}

export type DocumentViewMode = "grid" | "list"

export type DocumentListApiResponse = ApiEnvelope<DocumentListResponse>
export type DocumentUploadApiResponse = ApiEnvelope<DocumentUploadResponse>
