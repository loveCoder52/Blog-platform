import { Router } from "express";
import {
    register, login, logout, getMe,
    verifyEmail, resendVerification,
    forgotPassword, resetPassword,
    refreshAccessToken
} from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const authRouter = Router()

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.post("/logout", verifyJWT, logout)
authRouter.get("/me", verifyJWT, getMe)
authRouter.post("/refresh", refreshAccessToken)
authRouter.get("/verify/:token", verifyEmail)
authRouter.post("/resend-verification", resendVerification)
authRouter.post("/forgot-password", forgotPassword)
authRouter.post("/reset-password/:token", resetPassword)

export default authRouter;
