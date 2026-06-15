import type { RequestHandler } from "express"
import { Readable } from "node:stream"
import type { ReadableStream } from "node:stream/web"

import { asyncHandler } from "../lib/async-handler.js"
import { HttpError } from "../lib/http-error.js"
import { fetchFileFromService } from "../services/file-proxy.service.js"

export const fileProxyController = {
  getFile: (asyncHandler(async (req, res) => {
    const relativePath = req.query.relativePath
    if (typeof relativePath !== "string" || !relativePath.trim()) {
      throw new HttpError(400, "relativePath is required")
    }

    const response = await fetchFileFromService(relativePath)

    if (response.status === 404) {
      throw new HttpError(404, "File not found")
    }
    if (response.status === 400) {
      throw new HttpError(400, "Invalid relativePath")
    }
    if (!response.ok || !response.body) {
      throw new HttpError(502, "File service is unavailable")
    }

    const contentType =
      response.headers.get("content-type") ?? "application/octet-stream"
    const contentLength = response.headers.get("content-length")
    const contentDisposition = response.headers.get("content-disposition")

    res.setHeader("Content-Type", contentType)
    if (contentLength) res.setHeader("Content-Length", contentLength)
    if (contentDisposition) {
      res.setHeader("Content-Disposition", contentDisposition)
    }

    const stream = Readable.fromWeb(response.body as ReadableStream)
    stream.on("error", () => {
      if (!res.headersSent) {
        res.status(500).end()
      }
    })
    stream.pipe(res)
  }) satisfies RequestHandler),
}
