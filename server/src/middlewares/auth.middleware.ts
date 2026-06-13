import type { RequestHandler } from "express"

import { HttpError } from "../lib/http-error.js"
import { extractAccessToken } from "../lib/auth-token.js"
import { userRepository } from "../repositories/user.repository.js"
import { verifyAccessToken } from "../services/auth.service.js"

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    const accessToken = extractAccessToken(req)
    if (!accessToken) {
      throw new HttpError(401, "Missing access token")
    }

    const payload = verifyAccessToken(accessToken)
    const user = await userRepository.findById(payload.sub)
    if (!user) {
      throw new HttpError(401, "Invalid access token")
    }

    if (!user.isActive) {
      throw new HttpError(401, "Account is deactivated")
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      username: user.username,
    }

    next()
  } catch (error) {
    next(error)
  }
}
