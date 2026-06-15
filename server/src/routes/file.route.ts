import { Router } from "express"

import { fileProxyController } from "../controllers/file-proxy.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

export const fileRouter = Router()

fileRouter.use(authMiddleware)
fileRouter.get("/file", fileProxyController.getFile)
