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
  thumbnailUrl?: string
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

export type UploadSessionSnapshot = {
  sessionId: string
  status: "active" | "complete" | "failed"
  stage:
    | "storing_pdf"
    | "generating_thumbnail"
    | "storing_thumbnail"
    | "saving"
  percent: number
  message: string
  document?: DocumentDto
  error?: string
}

export type UploadSessionResponse = {
  session: UploadSessionSnapshot
}

export type DocumentDetailResponse = {
  document: DocumentDto
}

export type DocumentItem = {
  id: string
  name: string
  originalFileName: string
  fileUrl: string
  thumbnailUrl?: string
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
export type UploadSessionApiResponse = ApiEnvelope<UploadSessionResponse>

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

export type DocumentChatHistoryEntry = {
  role: "user" | "assistant"
  content: string
}

export type DocumentAiTaskType = "translate" | "summarize"

export type DocumentAiTask = {
  id: string
  type: DocumentAiTaskType
  output: string
  pageNumber: number
  createdAt: string
}

export type DocumentAiHistoryResponse = {
  tasks: DocumentAiTask[]
}
