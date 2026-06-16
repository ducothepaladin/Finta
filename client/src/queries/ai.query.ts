import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { documentAiService } from "@/services/document-ai.service"
import { documentQueryKeys } from "@/queries/document.query"
import type { DocumentAiTask } from "@/types/document"

export const aiQueryKeys = {
  history: (documentId: string) =>
    [...documentQueryKeys.detail(documentId), "ai-history"] as const,
}

function invalidateAiHistory(
  queryClient: ReturnType<typeof useQueryClient>,
  documentId: string,
) {
  return queryClient.invalidateQueries({
    queryKey: aiQueryKeys.history(documentId),
  })
}

export function useDocumentAiHistoryQuery(documentId: string | undefined) {
  return useQuery({
    queryKey: aiQueryKeys.history(documentId ?? ""),
    queryFn: () => documentAiService.getHistory(documentId!),
    enabled: Boolean(documentId),
  })
}

export function useTranslateDocumentMutation(documentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      selectedText: string
      pageNumber: number
      targetLanguage?: string
    }) =>
      documentAiService.translate({
        documentId,
        ...params,
      }),
    onSuccess: async () => {
      await invalidateAiHistory(queryClient, documentId)
    },
    onError: () => {
      toast.error("Translation failed")
    },
  })
}

export function useSummarizeDocumentMutation(documentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { selectedText: string; pageNumber: number }) =>
      documentAiService.summarize({
        documentId,
        ...params,
      }),
    onSuccess: async () => {
      await invalidateAiHistory(queryClient, documentId)
    },
    onError: () => {
      toast.error("Summarize failed")
    },
  })
}

export function mapAiTaskToHistoryItem(task: DocumentAiTask) {
  return {
    id: task.id,
    kind: task.type === "summarize" ? ("summary" as const) : ("translate" as const),
    text: task.output,
    pageNumber: task.pageNumber,
  }
}
