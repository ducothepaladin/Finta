import { Router } from "express"

import { documentsController } from "../controllers/documents.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { pdfUpload } from "../middlewares/upload.middleware.js"

export const documentsRouter = Router()

documentsRouter.use(authMiddleware)

documentsRouter.get("/", documentsController.list)
documentsRouter.post("/upload", pdfUpload.single("file"), documentsController.upload)
