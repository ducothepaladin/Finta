import type { DocumentDto } from "../dtos/document/document.dto.js"

export type UploadSessionStatus = "active" | "complete" | "failed"

export type UploadSessionStage =
  | "storing_pdf"
  | "generating_thumbnail"
  | "storing_thumbnail"
  | "saving"

export type UploadSessionSnapshot = {
  sessionId: string
  status: UploadSessionStatus
  stage: UploadSessionStage
  percent: number
  message: string
  document?: DocumentDto
  error?: string
}

type UploadSessionRecord = UploadSessionSnapshot & {
  userId: string
  updatedAt: number
}

const SESSION_TTL_MS = 5 * 60 * 1000
const sessions = new Map<string, UploadSessionRecord>()

function pruneExpiredSessions() {
  const cutoff = Date.now() - SESSION_TTL_MS
  for (const [id, session] of sessions) {
    if (session.updatedAt < cutoff) {
      sessions.delete(id)
    }
  }
}

export function createUploadSession(sessionId: string, userId: string) {
  pruneExpiredSessions()
  sessions.set(sessionId, {
    sessionId,
    userId,
    status: "active",
    stage: "storing_pdf",
    percent: 0,
    message: "Saving document...",
    updatedAt: Date.now(),
  })
}

export function updateUploadSession(
  sessionId: string,
  patch: Partial<
    Pick<
      UploadSessionRecord,
      "stage" | "percent" | "message" | "status" | "document" | "error"
    >
  >,
) {
  const session = sessions.get(sessionId)
  if (!session) return

  Object.assign(session, patch, { updatedAt: Date.now() })
}

export function completeUploadSession(
  sessionId: string,
  document: DocumentDto,
) {
  updateUploadSession(sessionId, {
    status: "complete",
    stage: "saving",
    percent: 100,
    message: "Upload complete",
    document,
  })
}

export function failUploadSession(sessionId: string, error: string) {
  updateUploadSession(sessionId, {
    status: "failed",
    error,
    message: error,
  })
}

export function getUploadSessionForUser(
  sessionId: string,
  userId: string,
): UploadSessionSnapshot | null {
  pruneExpiredSessions()
  const session = sessions.get(sessionId)
  if (!session || session.userId !== userId) return null

  return {
    sessionId: session.sessionId,
    status: session.status,
    stage: session.stage,
    percent: session.percent,
    message: session.message,
    document: session.document,
    error: session.error,
  }
}

export function deleteUploadSession(sessionId: string) {
  sessions.delete(sessionId)
}
