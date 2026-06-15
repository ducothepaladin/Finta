import type { Types } from "mongoose"

import type { WorkspaceDocument } from "../../models/workspace.model.js"

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

export type DocumentPaginationDto = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type DocumentListDto = {
  documents: DocumentDto[]
  pagination: DocumentPaginationDto
}

type WorkspaceLike = WorkspaceDocument & {
  _id: Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

export function toDocumentDto(workspace: WorkspaceLike): DocumentDto {
  return {
    id: workspace._id.toString(),
    name: workspace.name,
    originalFileName: workspace.originalFileName,
    fileUrl: workspace.fileUrl,
    thumbnailUrl: workspace.thumbnailUrl || undefined,
    sizeBytes: workspace.size ?? 0,
    type: workspace.type,
    createdAt: workspace.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: workspace.updatedAt?.toISOString() ?? new Date().toISOString(),
  }
}

export function toDocumentListDto(
  workspaces: WorkspaceLike[],
  pagination: DocumentPaginationDto,
): DocumentListDto {
  return {
    documents: workspaces.map(toDocumentDto),
    pagination,
  }
}

export type CreateWorkspaceDto = {
  userId: string
  name: string
  originalFileName: string
  type: string
  fileUrl: string
  thumbnailUrl?: string
  size: number
}
