import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useDeleteDocumentMutation } from "@/queries/document.query"

type DocumentDeleteDialogProps = {
  open: boolean
  documentId: string | null
  documentName: string
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function DocumentDeleteDialog({
  open,
  documentId,
  documentName,
  onOpenChange,
  onDeleted,
}: DocumentDeleteDialogProps) {
  const deleteMutation = useDeleteDocumentMutation()

  const handleDelete = () => {
    if (!documentId) return

    deleteMutation.mutate(documentId, {
      onSuccess: () => {
        onOpenChange(false)
        onDeleted?.()
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="default"
        className="w-[calc(100%-2rem)] max-w-md gap-4"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Delete document?</AlertDialogTitle>
          <AlertDialogDescription className="break-words text-pretty">
            <span className="text-foreground">{documentName}</span> will be removed
            permanently, including notes and AI history for this file.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-end">
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
