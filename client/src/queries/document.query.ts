import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { documentService } from "@/services/document.service"
import type { DocumentUploadProgress } from "@/lib/upload-progress"
import type { DocumentListParams } from "@/types/document"

export const documentQueryKeys = {
  all: ["documents"] as const,
  list: (params: DocumentListParams) =>
    [...documentQueryKeys.all, "list", params] as const,
  detail: (id: string) => [...documentQueryKeys.all, "detail", id] as const,
}

export function useDocumentsQuery(params: DocumentListParams) {
  return useQuery({
    queryKey: documentQueryKeys.list(params),
    queryFn: () => documentService.list(params),
  })
}

export function useDocumentQuery(id: string | undefined) {
  return useQuery({
    queryKey: documentQueryKeys.detail(id ?? ""),
    queryFn: () => documentService.getById(id!),
    enabled: Boolean(id),
  })
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: documentQueryKeys.all })
      toast.success("Document deleted")
    },
    onError: () => {
      toast.error("Could not delete document")
    },
  })
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File
      onProgress?: (progress: DocumentUploadProgress) => void
    }) => documentService.upload(file, onProgress),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: documentQueryKeys.all })
      toast.success(`${data.document.originalFileName} uploaded successfully`)
    },
    onError: () => {
      toast.error("Upload failed")
    },
  })
}
