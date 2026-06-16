import "dotenv/config"

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optional(name: string, fallback: string): string {
  const value = process.env[name]?.trim()
  return value || fallback
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3001),
  clientOrigin: required("CLIENT_ORIGIN"),
  mongodbUri: required("MONGODB_URI"),
  isDev: (process.env.NODE_ENV ?? "development") === "development",
  isProd: process.env.NODE_ENV === "production",

  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: optional("JWT_ACCESS_EXPIRES_IN", "15m"),
  jwtRefreshExpiresIn: optional("JWT_REFRESH_EXPIRES_IN", "7d"),
  jwtRefreshCookieMaxAgeMs: Number(
    optional("JWT_REFRESH_COOKIE_MAX_AGE_MS", "604800000"),
  ),

  brevoApiKey: process.env.BREVO_API_KEY?.trim() ?? "",
  brevoFromEmail: process.env.BREVO_FROM_EMAIL?.trim() ?? "",
  brevoFromName: process.env.BREVO_FROM_NAME?.trim() ?? "",

  fileServiceUrl: required("FILE_SERVICE_URL"),
  uploadFilePath: optional("UPLOAD_FILE_PATH", "finta/documents"),

  aiServiceUrl: optional("AI_SERVICE_URL", "http://localhost:8081"),
  aiInternalToken: process.env.AI_INTERNAL_TOKEN?.trim() ?? "",
  aiDefaultModel: optional("AI_DEFAULT_MODEL", "gpt-4o-mini"),
} as const
