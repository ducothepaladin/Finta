import { createCanvas, type Canvas } from "canvas"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs"

const THUMBNAIL_WIDTH = 320

const pdfjsDistRoot = dirname(
  fileURLToPath(import.meta.resolve("pdfjs-dist/package.json")),
)

function toFactoryUrl(...parts: string[]): string {
  const href = pathToFileURL(join(pdfjsDistRoot, ...parts)).href
  return href.endsWith("/") ? href : `${href}/`
}

GlobalWorkerOptions.workerSrc = pathToFileURL(
  join(pdfjsDistRoot, "build/pdf.worker.min.mjs"),
).toString()

const pdfDocumentInitOptions = {
  standardFontDataUrl: toFactoryUrl("standard_fonts"),
  cMapUrl: toFactoryUrl("cmaps"),
  cMapPacked: true,
  wasmUrl: toFactoryUrl("wasm"),
  iccUrl: toFactoryUrl("iccs"),
  isEvalSupported: false,
}

type CanvasAndContext = {
  canvas: Canvas | null
  context: ReturnType<Canvas["getContext"]> | null
}

class NodeCanvasPackageFactory {
  create(width: number, height: number): CanvasAndContext {
    const canvas = createCanvas(Math.ceil(width), Math.ceil(height))
    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("Could not create 2d canvas context")
    }
    return { canvas, context }
  }

  reset(canvasAndContext: CanvasAndContext, width: number, height: number) {
    if (!canvasAndContext.canvas) {
      throw new Error("Canvas is not specified")
    }
    canvasAndContext.canvas.width = Math.ceil(width)
    canvasAndContext.canvas.height = Math.ceil(height)
  }

  destroy(canvasAndContext: CanvasAndContext) {
    if (!canvasAndContext.canvas) {
      throw new Error("Canvas is not specified")
    }
    canvasAndContext.canvas.width = 0
    canvasAndContext.canvas.height = 0
    canvasAndContext.canvas = null
    canvasAndContext.context = null
  }
}

export async function renderPdfFirstPageThumbnail(
  pdfBuffer: Uint8Array,
): Promise<Uint8Array | null> {
  let pdfDocument: Awaited<ReturnType<typeof getDocument>["promise"]> | null =
    null

  try {
    const loadingTask = getDocument({
      data: pdfBuffer,
      ...pdfDocumentInitOptions,
      CanvasFactory: NodeCanvasPackageFactory,
    })

    pdfDocument = await loadingTask.promise
    const page = await pdfDocument.getPage(1)
    const baseViewport = page.getViewport({ scale: 1 })
    const scale = THUMBNAIL_WIDTH / baseViewport.width
    const viewport = page.getViewport({ scale })

    const canvasFactory = new NodeCanvasPackageFactory()
    const { canvas } = canvasFactory.create(viewport.width, viewport.height)

    await page.render({
      canvas: canvas as never,
      viewport,
    }).promise

    return new Uint8Array(
      (canvas as Canvas).toBuffer("image/jpeg", { quality: 0.85 }),
    )
  } catch (error) {
    console.error("Failed to render PDF thumbnail:", error)
    return null
  } finally {
    await pdfDocument?.destroy().catch(() => undefined)
  }
}
