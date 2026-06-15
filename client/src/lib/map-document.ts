import { formatFileSize } from "@/lib/format-file-size"
import type { DocumentDto, DocumentItem } from "@/types/document"

export function mapDocumentDtoToItem(document: DocumentDto): DocumentItem {
  return {
    id: document.id,
    name: document.originalFileName || document.name,
    originalFileName: document.originalFileName,
    fileUrl: document.fileUrl,
    thumbnailUrl: document.thumbnailUrl,
    size: formatFileSize(document.sizeBytes),
    sizeBytes: document.sizeBytes,
    type: document.type,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    currentPage: 1,
    totalPages: 1,
  }
}
