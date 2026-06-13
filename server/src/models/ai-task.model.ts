import { Schema, model, type InferSchemaType, type Types } from "mongoose"
import { AI_TASK_STATUSES, AI_TASK_TYPES } from "./types.js"

const aiTaskSchema = new Schema(
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
    type: { type: String, required: true, enum: AI_TASK_TYPES },
    config: { type: Schema.Types.Mixed },
    input: { type: String },
    output: { type: String },
    inputToken: { type: Number },
    outputToken: { type: Number },
    model: { type: String },
    status: {
      type: String,
      required: true,
      enum: AI_TASK_STATUSES,
      default: "pending",
    },
    duration: { type: Number },
  },
  { timestamps: true, collection: "ai_tasks" },
)

aiTaskSchema.index({ userId: 1, status: 1, createdAt: -1 })

export type AiTaskDocument = InferSchemaType<typeof aiTaskSchema> & {
  userId: Types.ObjectId
  workspaceId: Types.ObjectId
  selectionId: Types.ObjectId
}

export const AiTask = model("AiTask", aiTaskSchema)
