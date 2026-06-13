import { ArrowLeft, FileText } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function DocumentPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit px-0" asChild>
          <Link to="/documents">
            <ArrowLeft data-icon="inline-start" />
            Back to documents
          </Link>
        </Button>

        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-medium text-foreground">
            Document workspace
          </h1>
          <p className="text-sm leading-[1.7] text-muted-foreground">
            Reading workspace for document {id ?? "unknown"}.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader className="flex-row items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-[15px] font-medium">
              PDF reader coming soon
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Document id: {id ?? "unknown"}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
