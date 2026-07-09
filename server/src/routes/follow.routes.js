import { Router } from "express"
import {
    toggleFollow, getFollowers, getFollowing
} from "../controllers/follow.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const followRouter = Router()

followRouter.post("/:userId/toggle",    verifyJWT, toggleFollow)
followRouter.get("/:userId/followers",  getFollowers)
followRouter.get("/:userId/following",  getFollowing)

export default followRouter