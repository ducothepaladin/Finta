import cors from "cors"
import express from "express"
import helmet from "helmet"
import { env } from "../config/env.js"
import { errorHandler } from "../middlewares/error-handler.js"
import { apiRouter } from "../routes/index.js"

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  )
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.use("/api", apiRouter)

  app.use(errorHandler)

  return app
}
