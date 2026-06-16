import { HttpError } from "../lib/http-error.js"

export type FileServiceUploadResult = {
  fileUrl: string
  relativePath: string
  originalFileName?: string
  storedFileName?: string
}

function ensureFileNameHasExtension(
  fileName: string,
  mimeType: string,
): string {
  const t = (fileName || "upload").trim().replace(/[/\\]/g, "_") || "upload"
  if (/\.[a-zA-Z0-9]{1,16}$/.test(t)) return t

  const mime = (mimeType || "").trim().toLowerCase()
  if (mime.includes("pdf")) return `${t}.pdf`
  if (mime.includes("jpeg") || mime.includes("jpg")) return `${t}.jpg`
  if (mime.includes("png")) return `${t}.png`
  if (mime.includes("webp")) return `${t}.webp`
  return `${t}.bin`
}

async function postToFileService(
  endpoint: string,
  buffer: Uint8Array,
  fileName: string,
  mimeType: string,
  folderPath?: string,
): Promise<FileServiceUploadResult> {
  const form = new FormData()
  const safeName = ensureFileNameHasExtension(fileName, mimeType)
  const blob = new Blob([Uint8Array.from(buffer)], { type: mimeType })
  form.append("file", blob, safeName)

  const fp = folderPath?.trim()
  if (fp) {
    form.append("folderPath", fp)
  }

  let response: Response
  try {
    response = await fetch(endpoint, { method: "POST", body: form })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new HttpError(502, `File service unreachable: ${msg}`)
  }

  if (response.status !== 201) {
    const bodyText = await response.text().catch(() => "")
    throw new HttpError(
      502,
      `File service upload failed (${response.status}): ${bodyText || response.statusText}`,
    )
  }

  const payload = (await response.json()) as {
    success?: boolean
    data?: {
      fileUrl?: string
      relativePath?: string
      originalFileName?: string
      storedFileName?: string
    }
  }

  const data = payload?.data
  if (!payload?.success || !data) {
    throw new HttpError(502, "File service returned an invalid response")
  }

  const fileUrl = (data.fileUrl ?? "").trim()
  const relativePath = (data.relativePath ?? "").trim()
  const url = fileUrl || relativePath
  if (!url) {
    throw new HttpError(502, "File service did not return a file URL")
  }

  return {
    fileUrl: url,
    relativePath: relativePath || url,
    originalFileName: data.originalFileName,
    storedFileName: data.storedFileName,
  }
}

export async function uploadBufferToFileService(params: {
  fileServiceBase: string
  buffer: Uint8Array
  originalName: string
  mimeType: string
  folderPath?: string
}): Promise<FileServiceUploadResult> {
  const base = params.fileServiceBase.replace(/\/+$/, "")
  const endpoint = `${base}/upload`
  const fileName =
    (params.originalName || "upload").trim().replace(/[/\\]/g, "_") || "upload"
  const mimeType = (params.mimeType || "application/pdf").trim().toLowerCase()

  return postToFileService(
    endpoint,
    params.buffer,
    fileName,
    mimeType,
    params.folderPath,
  )
}
