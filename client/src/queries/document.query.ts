import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { documentService } from "@/services/document.service"
import type { DocumentListParams } from "@/types/document"

export const documentQueryKeys = {
  all: ["documents"] as const,
  list: (params: DocumentListParams) =>
    [...documentQueryKeys.all, "list", params] as const,
}

export function useDocumentsQuery(params: DocumentListParams) {
  return useQuery({
    queryKey: documentQueryKeys.list(params),
    queryFn: () => documentService.list(params),
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
      onProgress?: (progress: number) => void
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
