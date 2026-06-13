import { Schema, model, type InferSchemaType } from "mongoose"

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    isOtpVerified: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, collection: "users" },
)

export type UserDocument = InferSchemaType<typeof userSchema>

export const User = model("User", userSchema)
