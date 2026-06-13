import "dotenv/config"

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3001),
  clientOrigin: required("CLIENT_ORIGIN"),
  mongodbUri: required("MONGODB_URI"),
  isDev: (process.env.NODE_ENV ?? "development") === "development",
} as const
