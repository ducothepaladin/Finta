import { createApp } from "./bootstrap/create-app.js"
import { env } from "./config/env.js"
import { connectDb, disconnectDb } from "./db/connect.js"

async function main() {
  await connectDb()

  const app = createApp()

  const server = app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`)
  })

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down...`)
    server.close(async () => {
      await disconnectDb()
      process.exit(0)
    })
  }

  process.on("SIGINT", () => void shutdown("SIGINT"))
  process.on("SIGTERM", () => void shutdown("SIGTERM"))
}

main().catch((error) => {
  console.error("Failed to start server:", error)
  process.exit(1)
})
