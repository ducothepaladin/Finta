import { Schema, model, type InferSchemaType, type Types } from "mongoose"
import { normalizedRectSchema } from "./types.js"

const selectionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    pageNumber: { type: Number, required: true, min: 1 },
    selectedText: { type: String, required: true },
    rects: { type: [normalizedRectSchema], required: true },
    color: { type: String },
  },
  { timestamps: true, collection: "selections" },
)

selectionSchema.index({ workspaceId: 1, pageNumber: 1 })

export type SelectionDocument = InferSchemaType<typeof selectionSchema> & {
  userId: Types.ObjectId
  workspaceId: Types.ObjectId
}

export const Selection = model("Selection", selectionSchema)
