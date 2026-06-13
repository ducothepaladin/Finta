import multer from "multer"

import { HttpError } from "../lib/http-error.js"

const MAX_FILE_SIZE = 50 * 1024 * 1024

export const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
})

export function handleMulterError(error: unknown): HttpError | null {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return new HttpError(413, "File too large")
    }
    return new HttpError(400, error.message)
  }

  return null
}
