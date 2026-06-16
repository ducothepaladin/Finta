import { MessageSquare } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { DocumentAiChatBotDrawer } from "@/components/document/document-ai/document-ai-chat-bot-drawer"
import { DocumentAiTaskHistories } from "@/components/document/document-ai/document-ai-task-histories"
import { DocumentSelectionPopover } from "@/components/document/document-selection-popover"
import { DocumentUploadProgressBar } from "@/components/document/document-upload-progress-bar"
import { PdfPageList } from "@/components/pdf/pdf-page-list"
import { PdfViewer } from "@/components/pdf/pdf-viewer"
import { PdfViewerPagination } from "@/components/pdf/pdf-viewer-pagination"
import { PdfViewerToolbar } from "@/components/pdf/pdf-viewer-toolbar"
import { Button } from "@/components/ui/button"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useFileObjectUrl } from "@/hooks/use-file-object-url"
import {
  mapAiTaskToHistoryItem,
  useDocumentAiHistoryQuery,
  useSummarizeDocumentMutation,
  useTranslateDocumentMutation,
} from "@/queries/ai.query"
import {
  createChatMessageId,
  createHistoryId,
} from "@/lib/document-ai-mock"
import { documentAiService } from "@/services/document-ai.service"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type {
  DocumentChatMessage,
  DocumentDto,
  DocumentHistoryItem,
  DocumentHistoryKind,
  DocumentHistoryTab,
} from "@/types/document"

type DocumentViewerProps = {
  document: DocumentDto
  className?: string
}

const INITIAL_CHAT_MESSAGES: DocumentChatMessage[] = [
  {
    id: "welcome",
    role: "ai",
    text: "Hi! I can answer questions about the content on this page. Try one of the suggestions below.",
  },
]

function isPdfDocument(document: DocumentDto): boolean {
  return document.type.toLowerCase().includes("pdf")
}

export function DocumentViewer({ document, className }: DocumentViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [historyTab, setHistoryTab] = useState<DocumentHistoryTab>("all")
  const [historyItems, setHistoryItems] = useState<DocumentHistoryItem[]>([])
  const [chatMessages, setChatMessages] =
    useState<DocumentChatMessage[]>(INITIAL_CHAT_MESSAGES)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [selectionPopover, setSelectionPopover] = useState<{
    open: boolean
    position: { top: number; left: number } | null
    text: string
  }>({ open: false, position: null, text: "" })
  const [zoom, setZoom] = useState(1.5)
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearchQuery = useDebouncedValue(searchInput, 300)
  const [searchMatchCount, setSearchMatchCount] = useState(0)
  const [activeMatchIndex, setActiveMatchIndex] = useState(0)
  const [searchScrollRequest, setSearchScrollRequest] = useState(0)
  const [historyOpen, setHistoryOpen] = useState(true)

  const fileMedia = useFileObjectUrl(document.fileUrl)
  const { data: aiHistory = [] } = useDocumentAiHistoryQuery(document.id)
  const translateMutation = useTranslateDocumentMutation(document.id)
  const summarizeMutation = useSummarizeDocumentMutation(document.id)
  const chatAbortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setHistoryItems(aiHistory.map(mapAiTaskToHistoryItem))
  }, [aiHistory])

  useEffect(() => {
    setActiveMatchIndex(0)
  }, [currentPage])

  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setSearchMatchCount(0)
    }
  }, [debouncedSearchQuery])

  useEffect(() => {
    setActiveMatchIndex(0)
  }, [debouncedSearchQuery])

  useEffect(() => {
    if (searchMatchCount === 0) {
      setActiveMatchIndex(0)
      return
    }
    setActiveMatchIndex((index) => Math.min(index, searchMatchCount - 1))
  }, [searchMatchCount])

  const goToNextMatch = useCallback(() => {
    if (searchMatchCount === 0) return
    setActiveMatchIndex((index) => (index + 1) % searchMatchCount)
    setSearchScrollRequest((request) => request + 1)
  }, [searchMatchCount])

  const goToPreviousMatch = useCallback(() => {
    if (searchMatchCount === 0) return
    setActiveMatchIndex(
      (index) => (index - 1 + searchMatchCount) % searchMatchCount,
    )
    setSearchScrollRequest((request) => request + 1)
  }, [searchMatchCount])

  const markedPages = useMemo(
    () => [...new Set(historyItems.map((item) => item.pageNumber))],
    [historyItems],
  )

  const handleDocumentLoad = useCallback(({ numPages: total }: { numPages: number }) => {
    setNumPages(total)
    setCurrentPage((page) => Math.min(page, total || 1))
  }, [])

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    const text = selection?.toString().trim() ?? ""
    if (!text || !scrollRef.current) {
      setSelectionPopover({ open: false, position: null, text: "" })
      return
    }

    const range = selection?.rangeCount ? selection.getRangeAt(0) : null
    if (!range || !scrollRef.current.contains(range.commonAncestorContainer)) {
      setSelectionPopover({ open: false, position: null, text: "" })
      return
    }

    const rect = range.getBoundingClientRect()
    const containerRect = scrollRef.current.getBoundingClientRect()

    setSelectionPopover({
      open: true,
      text,
      position: {
        top: rect.top - containerRect.top + scrollRef.current.scrollTop,
        left: rect.left - containerRect.left + rect.width / 2,
      },
    })
  }, [])

  const dismissSelectionPopover = useCallback(() => {
    setSelectionPopover({ open: false, position: null, text: "" })
    window.getSelection()?.removeAllRanges()
  }, [])

  const handleCopySelection = useCallback(async () => {
    const text = selectionPopover.text
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Could not copy text")
    }

    dismissSelectionPopover()
  }, [dismissSelectionPopover, selectionPopover.text])

  const addHistoryItem = useCallback(
    (kind: DocumentHistoryKind, text: string) => {
      setHistoryItems((prev) => [
        {
          id: createHistoryId(),
          kind,
          text,
          pageNumber: currentPage,
        },
        ...prev,
      ])
      setSelectionPopover({ open: false, position: null, text: "" })
      window.getSelection()?.removeAllRanges()
    },
    [currentPage],
  )

  const handleTranslateSelection = useCallback(async () => {
    const selectedText = selectionPopover.text.trim()
    if (!selectedText) return

    dismissSelectionPopover()

    try {
      const task = await translateMutation.mutateAsync({
        selectedText,
        pageNumber: currentPage,
      })
      setHistoryItems((prev) => [mapAiTaskToHistoryItem(task), ...prev])
      toast.success("Translation completed")
    } catch {
      // Error toast handled by mutation.
    }
  }, [
    currentPage,
    dismissSelectionPopover,
    selectionPopover.text,
    translateMutation,
  ])

  const handleSummarizeSelection = useCallback(async () => {
    const selectedText = selectionPopover.text.trim()
    if (!selectedText) return

    dismissSelectionPopover()

    try {
      const task = await summarizeMutation.mutateAsync({
        selectedText,
        pageNumber: currentPage,
      })
      setHistoryItems((prev) => [mapAiTaskToHistoryItem(task), ...prev])
      toast.success("Summary completed")
    } catch {
      // Error toast handled by mutation.
    }
  }, [
    currentPage,
    dismissSelectionPopover,
    selectionPopover.text,
    summarizeMutation,
  ])

  const sendChatMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isSending) return

      setShowSuggestions(false)
      setIsSending(true)

      const userMessage: DocumentChatMessage = {
        id: createChatMessageId(),
        role: "user",
        text: trimmed,
      }
      const aiMessageId = createChatMessageId()
      const typingMessage: DocumentChatMessage = {
        id: aiMessageId,
        role: "ai",
        text: "",
        isTyping: true,
      }

      setChatMessages((prev) => [...prev, userMessage, typingMessage])

      const history = chatMessages
        .filter((message) => !message.isTyping && message.id !== "welcome")
        .map((message) => ({
          role: message.role === "user" ? ("user" as const) : ("assistant" as const),
          content: message.text,
        }))

      chatAbortRef.current?.abort()
      const controller = new AbortController()
      chatAbortRef.current = controller

      try {
        let streamedText = ""

        for await (const chunk of documentAiService.streamChat(
          {
            documentId: document.id,
            message: trimmed,
            pageNumber: currentPage,
            history,
          },
          controller.signal,
        )) {
          if (chunk.error) {
            throw new Error(chunk.error)
          }

          if (chunk.delta) {
            streamedText += chunk.delta
          }

          setChatMessages((prev) =>
            prev.map((message) =>
              message.id === aiMessageId
                ? {
                    ...message,
                    text: streamedText,
                    isTyping: !chunk.done,
                  }
                : message,
            ),
          )
        }
      } catch (error) {
        if (controller.signal.aborted) return

        setChatMessages((prev) =>
          prev.filter((message) => message.id !== aiMessageId),
        )
        toast.error(
          error instanceof Error ? error.message : "Could not send message",
        )
      } finally {
        setChatMessages((prev) =>
          prev.map((message) =>
            message.id === aiMessageId
              ? { ...message, isTyping: false }
              : message,
          ),
        )
        setIsSending(false)
      }
    },
    [chatMessages, currentPage, document.id, isSending],
  )

  useEffect(() => {
    return () => {
      chatAbortRef.current?.abort()
    }
  }, [])

  return (
    <div className={cn("flex h-full bg-background/95 min-h-0 overflow-hidden", className)}>
      <PdfPageList
        numPages={numPages}
        currentPage={currentPage}
        markedPages={markedPages}
        onPageSelect={setCurrentPage}
      />

      <div className="flex min-w-0 flex-1  flex-col overflow-hidden">
        <PdfViewerToolbar
          currentPage={currentPage}
          numPages={numPages}
          zoom={zoom}
          onZoomChange={setZoom}
          searchQuery={searchInput}
          onSearchQueryChange={setSearchInput}
          appliedSearchQuery={debouncedSearchQuery}
          matchCount={searchMatchCount}
          activeMatchIndex={activeMatchIndex}
          onNextMatch={goToNextMatch}
          onPreviousMatch={goToPreviousMatch}
        />

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            className="relative bg-background/95 min-w-0 flex-1 overflow-y-auto"
          >
            {isPdfDocument(document) ? (
              <>
                {(fileMedia.status === "idle" ||
                  fileMedia.status === "loading") && (
                  <div className="flex min-h-full flex-col items-center justify-center gap-3 p-8">
                    <p className="text-sm text-muted-foreground">
                      Loading PDF…
                    </p>
                    {fileMedia.progress != null && (
                      <div className="w-full max-w-xs">
                        <DocumentUploadProgressBar
                          percent={fileMedia.progress ?? 0}
                          phase="uploading"
                          message="Loading PDF..."
                          loadedBytes={0}
                          totalBytes={0}
                          active={fileMedia.status === "loading"}
                          complete={(fileMedia.progress ?? 0) >= 100}
                        />
                      </div>
                    )}
                  </div>
                )}
                {fileMedia.status === "error" && (
                  <div className="flex min-h-full items-center justify-center p-8">
                    <p className="text-sm text-destructive">
                      Failed to load PDF file.
                    </p>
                  </div>
                )}
                {fileMedia.status === "ready" && fileMedia.src && (
                  <PdfViewer
                    file={fileMedia.src}
                    pageNumber={currentPage}
                    numPages={numPages}
                    zoom={zoom}
                    searchQuery={debouncedSearchQuery}
                    activeMatchIndex={activeMatchIndex}
                    searchScrollRequest={searchScrollRequest}
                    onDocumentLoad={handleDocumentLoad}
                    onPageChange={setCurrentPage}
                    onSearchMatchCountChange={setSearchMatchCount}
                    onTextLayerMouseUp={handleTextSelection}
                    scrollContainerRef={scrollRef}
                    className=" bg-background/95"
                  />
                )}
              </>
            ) : (
              <div className="flex min-h-full items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">
                  Preview is not available for {document.type} files yet.
                </p>
              </div>
            )}

            <DocumentSelectionPopover
              open={selectionPopover.open}
              position={selectionPopover.position}
              onCopy={handleCopySelection}
              onNote={() =>
                addHistoryItem(
                  "note",
                  selectionPopover.text.slice(0, 120) || "New note",
                )
              }
              onTranslate={handleTranslateSelection}
              onSummarize={handleSummarizeSelection}
            />
          </div>

          {fileMedia.status === "ready" &&
            fileMedia.src &&
            isPdfDocument(document) &&
            numPages > 0 && (
              <PdfViewerPagination
                currentPage={currentPage}
                numPages={numPages}
                onPageChange={setCurrentPage}
              />
            )}

          <Button
            type="button"
            size="icon"
            className={cn(
              "absolute right-4 bottom-4 z-20 size-10 rounded-full shadow-sm transition-opacity",
              chatOpen && "pointer-events-none opacity-0",
            )}
            onClick={() => setChatOpen(true)}
            aria-label="Open chat bot"
          >
            <MessageSquare className="size-[18px]" />
          </Button>

          <DocumentAiChatBotDrawer
            open={chatOpen}
            currentPage={currentPage}
            messages={chatMessages}
            showSuggestions={showSuggestions}
            isSending={isSending}
            onClose={() => setChatOpen(false)}
            onSend={sendChatMessage}
            onSuggestionSelect={sendChatMessage}
          />
        </div>
      </div>

      <DocumentAiTaskHistories
        items={historyItems}
        activeTab={historyTab}
        onTabChange={setHistoryTab}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
    </div>
  )
}
