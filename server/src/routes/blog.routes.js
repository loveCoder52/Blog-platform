import { Router } from "express"
import {
    createBlog, getAllBlogs, getBlogById,
    updateBlog, deleteBlog, toggleLike
} from "../controllers/blog.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const blogRouter = Router()

// Public routes
blogRouter.get("/",    getAllBlogs)
blogRouter.get("/:id", getBlogById)

// Protected routes
blogRouter.post("/",       verifyJWT, upload.single("coverImage"), createBlog)
blogRouter.patch("/:id",   verifyJWT, upload.single("coverImage"), updateBlog)
blogRouter.delete("/:id",  verifyJWT, deleteBlog)
blogRouter.post("/:id/like", verifyJWT, toggleLike)

export default blogRouter