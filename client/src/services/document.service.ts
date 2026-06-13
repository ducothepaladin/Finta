import type { AxiosProgressEvent } from "axios"

import apiClient from "@/app/api/api-client"
import type {
  DocumentListApiResponse,
  DocumentListParams,
  DocumentListResponse,
  DocumentUploadApiResponse,
  DocumentUploadResponse,
} from "@/types/document"

export const documentService = {
  list: async (params: DocumentListParams): Promise<DocumentListResponse> => {
    const response = await apiClient.get<DocumentListApiResponse>(
      "/documents",
      {
        params: {
          page: params.page,
          limit: params.limit,
          ...(params.q ? { q: params.q } : {}),
        },
      },
    )
    return response.data.data
  },

  upload: async (
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<DocumentUploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.post<DocumentUploadApiResponse>(
      "/documents/upload",
      formData,
      {
        onUploadProgress: (event: AxiosProgressEvent) => {
          if (!event.total) return
          onProgress?.(Math.round((event.loaded / event.total) * 100))
        },
      },
    )

    return response.data.data
  },
}
