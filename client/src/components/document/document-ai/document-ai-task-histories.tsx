import { Bookmark, ChevronLeft, PanelRightClose } from "lucide-react"
import { Drawer as DrawerPrimitive } from "vaul"

import { DocumentAiNoteCard } from "@/components/document/document-ai/document-ai-note-card"
import { DocumentAiSummaryCard } from "@/components/document/document-ai/document-ai-summary-card"
import { DocumentAiTranslateCard } from "@/components/document/document-ai/document-ai-translate-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DocumentHistoryItem, DocumentHistoryTab } from "@/types/document"

const TABS: { id: DocumentHistoryTab; label: string }[] = [
  { id: "all", label: "Notes" },
  { id: "translate", label: "Translate" },
  { id: "summary", label: "Summary" },
]

type DocumentAiTaskHistoriesProps = {
  items: DocumentHistoryItem[]
  activeTab: DocumentHistoryTab
  onTabChange: (tab: DocumentHistoryTab) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

function HistoryItemCard({ item }: { item: DocumentHistoryItem }) {
  if (item.kind === "translate") {
    return <DocumentAiTranslateCard item={item} />
  }
  if (item.kind === "summary") {
    return <DocumentAiSummaryCard item={item} />
  }
  return <DocumentAiNoteCard item={item} />
}

function matchesTab(item: DocumentHistoryItem, tab: DocumentHistoryTab): boolean {
  if (tab === "all") return item.kind === "note"
  if (tab === "translate") return item.kind === "translate"
  return item.kind === "summary"
}

function HistoryPanelContent({
  items,
  activeTab,
  onTabChange,
}: {
  items: DocumentHistoryItem[]
  activeTab: DocumentHistoryTab
  onTabChange: (tab: DocumentHistoryTab) => void
}) {
  const filteredItems = items.filter((item) => matchesTab(item, activeTab))

  return (
    <>
      <div className="flex shrink-0 items-center border-b border-border">
        <div className="flex min-w-0 flex-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 border-b-2 px-1 py-2 text-[10px] font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <DrawerPrimitive.Close asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mr-1 shrink-0"
            aria-label="Collapse history panel"
          >
            <PanelRightClose className="size-4" />
          </Button>
        </DrawerPrimitive.Close>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-2">
        {filteredItems.map((item) => (
          <HistoryItemCard key={item.id} item={item} />
        ))}
        {filteredItems.length === 0 && (
          <p className="py-6 text-center text-[11px] text-muted-foreground">
            No items yet
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-center gap-1 border-t border-border px-2 py-2 text-[10px] text-muted-foreground">
        <Bookmark className="size-3" />
        {items.length} saved item{items.length === 1 ? "" : "s"}
      </div>
    </>
  )
}

export function DocumentAiTaskHistories({
  items,
  activeTab,
  onTabChange,
  open,
  onOpenChange,
  className,
}: DocumentAiTaskHistoriesProps) {
  return (
    <DrawerPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
      modal={false}
    >
      <div
        className={cn(
          "flex shrink-0 overflow-hidden transition-[width] duration-300 ease-out",
          open ? "w-[300px]" : "w-9",
          className,
        )}
        aria-label="Task history"
      >
        {open ? (
          <aside className="flex h-full w-[300px] flex-col border-l border-border bg-card">
            <HistoryPanelContent
              items={items}
              activeTab={activeTab}
              onTabChange={onTabChange}
            />
          </aside>
        ) : (
          <DrawerPrimitive.Trigger asChild>
            <button
              type="button"
              className="flex h-full w-9 flex-col items-center justify-center gap-2 border-l border-border bg-card text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
              aria-label="Expand history panel"
            >
              <ChevronLeft className="size-4" />
              <span className="text-[10px] font-medium [writing-mode:vertical-rl] rotate-180">
                History
              </span>
            </button>
          </DrawerPrimitive.Trigger>
        )}
      </div>
    </DrawerPrimitive.Root>
  )
}
