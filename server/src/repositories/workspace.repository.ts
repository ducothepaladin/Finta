import type { Types } from "mongoose"

import type { CreateWorkspaceDto } from "../dtos/document/document.dto.js"
import { Workspace, type WorkspaceDocument } from "../models/workspace.model.js"

export type FindDocumentsParams = {
  userId: string
  page: number
  limit: number
  q?: string
}

class WorkspaceRepository {
  findByUserId(userId: string) {
    return Workspace.find({ userId }).sort({ updatedAt: -1 }).exec()
  }

  async findPaginated(params: FindDocumentsParams) {
    const filter: {
      userId: string
      $or?: Array<Record<string, unknown>>
    } = { userId: params.userId }

    if (params.q) {
      const pattern = params.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      filter.$or = [
        { name: { $regex: pattern, $options: "i" } },
        { originalFileName: { $regex: pattern, $options: "i" } },
      ]
    }

    const skip = (params.page - 1) * params.limit

    const [data, total] = await Promise.all([
      Workspace.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(params.limit)
        .exec(),
      Workspace.countDocuments(filter).exec(),
    ])

    return { data, total }
  }

  create(data: CreateWorkspaceDto) {
    return Workspace.create({
      userId: data.userId,
      name: data.name,
      originalFileName: data.originalFileName,
      type: data.type,
      fileUrl: data.fileUrl,
      size: data.size,
    })
  }

  findByIdForUser(id: string, userId: string) {
    return Workspace.findOne({ _id: id, userId }).exec()
  }

  deleteByIdForUser(id: string, userId: string) {
    return Workspace.deleteOne({ _id: id, userId }).exec()
  }
}

export const workspaceRepository = new WorkspaceRepository()

export type WorkspaceEntity = WorkspaceDocument & {
  _id: Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}
