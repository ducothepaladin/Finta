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

export type DocumentDetailResponse = {
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
export type DocumentDetailApiResponse = ApiEnvelope<DocumentDetailResponse>

export type DocumentHistoryTab = "all" | "translate" | "summary"

export type DocumentHistoryKind = "note" | "translate" | "summary"

export type DocumentHistoryItem = {
  id: string
  kind: DocumentHistoryKind
  text: string
  pageNumber: number
}

export type DocumentChatMessage = {
  id: string
  role: "user" | "ai"
  text: string
  isTyping?: boolean
}
