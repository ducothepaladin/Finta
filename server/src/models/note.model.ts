import { Schema, model, type InferSchemaType, type Types } from "mongoose"

const noteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    selectionId: {
      type: Schema.Types.ObjectId,
      ref: "Selection",
      required: true,
    },
    text: { type: String, required: true },
  },
  { timestamps: true, collection: "notes" },
)

noteSchema.index({ userId: 1, workspaceId: 1 })

export type NoteDocument = InferSchemaType<typeof noteSchema> & {
  userId: Types.ObjectId
  workspaceId: Types.ObjectId
  selectionId: Types.ObjectId
}

export const Note = model("Note", noteSchema)
