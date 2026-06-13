import type { RequestHandler } from "express"

import { parseListDocumentsQuery } from "../dtos/document/list-documents-query.dto.js"
import { successResponse } from "../lib/api-response.js"
import { asyncHandler } from "../lib/async-handler.js"
import { HttpError } from "../lib/http-error.js"
import * as documentService from "../services/document.service.js"

class DocumentsController {
  list: RequestHandler = asyncHandler(async (req, res) => {
    const query = parseListDocumentsQuery(req.query)
    const data = await documentService.listDocuments(req.user!.id, query)

    res.json(
      successResponse({
        meta: { endpoint: "/api/documents", method: "GET" },
        data,
        message: "Documents fetched successfully",
      }),
    )
  })

  upload: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new HttpError(400, "file is required")
    }

    const document = await documentService.uploadDocument(
      req.user!.id,
      req.file,
    )

    res.status(201).json(
      successResponse({
        code: 201,
        meta: { endpoint: "/api/documents/upload", method: "POST" },
        data: { document },
        message: "Document uploaded successfully",
      }),
    )
  })
}

export const documentsController = new DocumentsController()
