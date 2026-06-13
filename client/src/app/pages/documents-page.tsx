import { FileText, Upload } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const placeholderDocuments = [
  {
    id: "1",
    name: "Research paper draft",
    originalFileName: "research-paper-draft.pdf",
    size: "2.4 MB",
  },
  {
    id: "2",
    name: "Product requirements",
    originalFileName: "product-requirements.pdf",
    size: "860 KB",
  },
  {
    id: "3",
    name: "Meeting notes",
    originalFileName: "meeting-notes.pdf",
    size: "1.1 MB",
  },
]

export function DocumentsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-medium text-foreground">Documents</h1>
          <p className="text-sm leading-[1.7] text-muted-foreground">
            Your uploaded PDFs and reading workspaces.
          </p>
        </div>
        <Button type="button">
          <Upload data-icon="inline-start" />
          Upload
        </Button>
      </header>

      <section className="flex flex-col gap-3">
        {placeholderDocuments.map((document) => (
          <Link key={document.id} to={`/document/${document.id}`}>
            <Card className="transition-colors hover:border-border-emphasis">
              <CardHeader className="flex-row items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-[15px] font-medium">
                    {document.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {document.originalFileName} · {document.size}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  )
}
