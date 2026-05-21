import { Router } from "express"
import {
    getUserProfile, updateProfile,
    changePassword, deleteAccount
} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const userRouter = Router()

// Public
userRouter.get("/:username", getUserProfile)

// Protected
userRouter.patch(
    "/update/profile",
    verifyJWT,
    upload.single("avatar"),
    updateProfile
)
userRouter.patch("/update/password", verifyJWT, changePassword)
userRouter.delete("/delete/account", verifyJWT, deleteAccount)

export default userRouter