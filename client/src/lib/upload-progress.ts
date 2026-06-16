import type { AxiosProgressEvent } from "axios"

export type UploadProgressPhase = "uploading" | "processing"

export type UploadTransferProgress = {
  loadedBytes: number
  totalBytes: number
  ratio: number
  uploadComplete: boolean
}

export type UploadSessionStage =
  | "storing_pdf"
  | "generating_thumbnail"
  | "storing_thumbnail"
  | "saving"

export type UploadSessionStatus = "active" | "complete" | "failed"

export type UploadSessionProgress = {
  status: UploadSessionStatus
  stage: UploadSessionStage
  percent: number
  message: string
}

export type DocumentUploadProgress = {
  percent: number
  phase: UploadProgressPhase
  message: string
  loadedBytes: number
  totalBytes: number
}

/** Client transfer accounts for ~42% of the overall bar. */
const TRANSFER_WEIGHT = 0.42

export function resolveAxiosTransferProgress(
  event: AxiosProgressEvent,
  fileSize: number,
): UploadTransferProgress {
  const loaded = event.loaded ?? 0
  const total =
    event.total && event.total > 0
      ? event.total
      : fileSize > 0
        ? fileSize
        : 0

  if (total <= 0) {
    return {
      loadedBytes: loaded,
      totalBytes: 0,
      ratio: loaded > 0 ? 0.01 : 0,
      uploadComplete: false,
    }
  }

  const uploadComplete = loaded >= total
  const ratio = uploadComplete ? 1 : Math.min(1, loaded / total)

  return {
    loadedBytes: Math.min(loaded, total),
    totalBytes: total,
    ratio,
    uploadComplete,
  }
}

export function combineDocumentUploadProgress(
  transfer: UploadTransferProgress,
  session: UploadSessionProgress | null,
): DocumentUploadProgress {
  const loadedBytes = transfer.totalBytes
    ? Math.min(transfer.loadedBytes, transfer.totalBytes)
    : transfer.loadedBytes
  const totalBytes = transfer.totalBytes

  if (!transfer.uploadComplete) {
    const percent =
      transfer.ratio > 0
        ? Math.max(1, Math.round(transfer.ratio * TRANSFER_WEIGHT * 100))
        : 0

    return {
      percent,
      phase: "uploading",
      message: "Uploading...",
      loadedBytes,
      totalBytes,
    }
  }

  if (!session) {
    return {
      percent: Math.round(TRANSFER_WEIGHT * 100),
      phase: "processing",
      message: "Processing...",
      loadedBytes: totalBytes,
      totalBytes,
    }
  }

  if (session.status === "failed") {
    return {
      percent: Math.round(TRANSFER_WEIGHT * 100),
      phase: "processing",
      message: session.message || "Upload failed",
      loadedBytes: totalBytes,
      totalBytes,
    }
  }

  if (session.status === "complete") {
    return {
      percent: 100,
      phase: "processing",
      message: "Upload complete",
      loadedBytes: totalBytes,
      totalBytes,
    }
  }

  const processingSpan = 1 - TRANSFER_WEIGHT
  const combined = Math.round(
    TRANSFER_WEIGHT * 100 + session.percent * processingSpan,
  )

  return {
    percent: Math.min(99, combined),
    phase: "processing",
    message: session.message,
    loadedBytes: totalBytes,
    totalBytes,
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
