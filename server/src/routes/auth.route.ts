import { Router } from "express"

import { authController } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

export const authRouter = Router()

authRouter.post("/register", authController.register)
authRouter.post("/login", authController.login)
authRouter.post("/refresh", authController.refresh)
authRouter.post("/logout", authMiddleware, authController.logout)
authRouter.get("/me", authMiddleware, authController.me)
authRouter.get("/profile", authMiddleware, authController.profile)
authRouter.patch("/profile", authMiddleware, authController.updateProfile)
authRouter.post("/change-password", authMiddleware, authController.changePassword)
authRouter.post("/send-otp", authMiddleware, authController.sendOtp)
authRouter.post("/verify-otp", authMiddleware, authController.verifyOtp)
