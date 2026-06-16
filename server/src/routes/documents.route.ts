import { Router } from "express"

import { documentsController } from "../controllers/documents.controller.js"
import { documentAiController } from "../controllers/document-ai.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { pdfUpload } from "../middlewares/upload.middleware.js"

export const documentsRouter = Router()

documentsRouter.use(authMiddleware)

documentsRouter.get("/", documentsController.list)
documentsRouter.get("/:id/ai/history", documentAiController.history)
documentsRouter.post("/:id/translate", documentAiController.translate)
documentsRouter.post("/:id/summarize", documentAiController.summarize)
documentsRouter.post("/:id/chat", documentAiController.chat)
documentsRouter.get(
  "/upload-sessions/:sessionId",
  documentsController.getUploadSession,
)
documentsRouter.get("/:id", documentsController.getById)
documentsRouter.delete("/:id", documentsController.delete)
documentsRouter.post("/upload", pdfUpload.single("file"), documentsController.upload)
