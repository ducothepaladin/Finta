import { Router } from "express"

import { documentsController } from "../controllers/documents.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { pdfUpload } from "../middlewares/upload.middleware.js"

export const documentsRouter = Router()

documentsRouter.use(authMiddleware)

documentsRouter.get("/", documentsController.list)
documentsRouter.get(
  "/upload-sessions/:sessionId",
  documentsController.getUploadSession,
)
documentsRouter.get("/:id", documentsController.getById)
documentsRouter.delete("/:id", documentsController.delete)
documentsRouter.post("/upload", pdfUpload.single("file"), documentsController.upload)
