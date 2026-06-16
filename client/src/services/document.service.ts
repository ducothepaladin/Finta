import apiClient from "@/app/api/api-client"
import {
  combineDocumentUploadProgress,
  resolveAxiosTransferProgress,
  sleep,
  type DocumentUploadProgress,
  type UploadSessionProgress,
} from "@/lib/upload-progress"
import type {
  DocumentDetailApiResponse,
  DocumentListApiResponse,
  DocumentListParams,
  DocumentListResponse,
  DocumentUploadApiResponse,
  DocumentUploadResponse,
  DocumentDto,
  UploadSessionApiResponse,
  UploadSessionSnapshot,
} from "@/types/document"

const UPLOAD_SESSION_POLL_MS = 150

function mapUploadSession(snapshot: UploadSessionSnapshot): UploadSessionProgress {
  return {
    status: snapshot.status,
    stage: snapshot.stage,
    percent: snapshot.percent,
    message: snapshot.message,
  }
}

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

  getById: async (id: string): Promise<DocumentDto> => {
    const response = await apiClient.get<DocumentDetailApiResponse>(
      `/documents/${id}`,
    )
    return response.data.data.document
  },

  getUploadSession: async (
    sessionId: string,
  ): Promise<UploadSessionSnapshot | null> => {
    try {
      const response = await apiClient.get<UploadSessionApiResponse>(
        `/documents/upload-sessions/${sessionId}`,
      )
      return response.data.data.session
    } catch {
      return null
    }
  },

  upload: async (
    file: File,
    onProgress?: (progress: DocumentUploadProgress) => void,
  ): Promise<DocumentUploadResponse> => {
    const sessionId = crypto.randomUUID()
    const formData = new FormData()
    formData.append("file", file)

    let transfer = resolveAxiosTransferProgress(
      { loaded: 0, total: file.size },
      file.size,
    )
    let session: UploadSessionProgress | null = null
    let stopPolling = false

    const emit = () => {
      onProgress?.(combineDocumentUploadProgress(transfer, session))
    }

    emit()

    const pollSession = async () => {
      while (!stopPolling) {
        const snapshot = await documentService.getUploadSession(sessionId)
        if (snapshot) {
          session = mapUploadSession(snapshot)
          emit()

          if (snapshot.status === "complete" || snapshot.status === "failed") {
            break
          }
        }

        await sleep(UPLOAD_SESSION_POLL_MS)
      }
    }

    const polling = pollSession()

    try {
      const response = await apiClient.post<DocumentUploadApiResponse>(
        "/documents/upload",
        formData,
        {
          headers: {
            "X-Upload-Session": sessionId,
          },
          onUploadProgress: (event) => {
            transfer = resolveAxiosTransferProgress(event, file.size)
            emit()
          },
        },
      )

      stopPolling = true
      await polling

      onProgress?.({
        percent: 100,
        phase: "processing",
        message: "Upload complete",
        loadedBytes: file.size,
        totalBytes: file.size,
      })

      return response.data.data
    } catch (error) {
      stopPolling = true
      await polling
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`)
  },
}
