import { create } from "zustand"

import type { DocumentViewMode } from "@/types/document"

type DocumentState = {
  viewMode: DocumentViewMode
  setViewMode: (mode: DocumentViewMode) => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  viewMode: "grid",
  setViewMode: (mode) => set({ viewMode: mode }),
}))
