import type { ErrorRequestHandler } from "express"
import multer from "multer"

import { HttpError } from "../lib/http-error.js"

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400
    res.status(status).json({
      success: 0,
      code: status,
      message: err.code === "LIMIT_FILE_SIZE" ? "File too large" : err.message,
    })
    return
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({
      success: 0,
      code: err.status,
      message: err.message,
    })
    return
  }

  console.error(err)

  res.status(500).json({
    success: 0,
    code: 500,
    message: "Internal server error",
  })
}
