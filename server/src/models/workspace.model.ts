import { Schema, model, type InferSchemaType, type Types } from "mongoose"

const workspaceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    originalFileName: { type: String, required: true },
    type: { type: String, required: true },
    fileUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    size: { type: Number },
  },
  { timestamps: true, collection: "workspaces" },
)

workspaceSchema.index({ userId: 1, name: 1 })

export type WorkspaceDocument = InferSchemaType<typeof workspaceSchema> & {
  userId: Types.ObjectId
}

export const Workspace = model("Workspace", workspaceSchema)
