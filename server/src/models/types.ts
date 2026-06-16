import { Schema } from "mongoose"

export type AiTaskType = "translate" | "summarize" | "chat"

export type AiTaskStatus = "pending" | "completed" | "failed"

export interface NormalizedRect {
  x: number
  y: number
  w: number
  h: number
}

export const AI_TASK_TYPES: AiTaskType[] = ["translate", "summarize", "chat"]

export const AI_TASK_STATUSES: AiTaskStatus[] = [
  "pending",
  "completed",
  "failed",
]

export const normalizedRectSchema = new Schema<NormalizedRect>(
  {
    x: { type: Number, required: true, min: 0, max: 1 },
    y: { type: Number, required: true, min: 0, max: 1 },
    w: { type: Number, required: true, min: 0, max: 1 },
    h: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false },
)
