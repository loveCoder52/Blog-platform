import { Router } from "express"
import {
    addComment, getComments,
    updateComment, deleteComment
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const commentRouter = Router()

// Public — comments padhna
commentRouter.get("/:blogId", getComments)

// Protected — login zaroori
commentRouter.post("/:blogId",   verifyJWT, addComment)
commentRouter.patch("/:id",      verifyJWT, updateComment)
commentRouter.delete("/:id",     verifyJWT, deleteComment)

export default commentRouter