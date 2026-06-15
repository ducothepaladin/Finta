import { pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString()

const pdfjsAssetBase = `https://unpkg.com/pdfjs-dist@${pdfjs.version}`

export const pdfDocumentOptions = {
  cMapUrl: `${pdfjsAssetBase}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `${pdfjsAssetBase}/standard_fonts/`,
  wasmUrl: `${pdfjsAssetBase}/wasm/`,
  iccUrl: `${pdfjsAssetBase}/iccs/`,
}

export { Document, Page, pdfjs } from "react-pdf"
