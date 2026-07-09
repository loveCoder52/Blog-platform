import { Router } from "express"
import { getRatings, submitRating } from "../controllers/rating.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const ratingRouter = Router()

ratingRouter.get("/",  getRatings)
ratingRouter.post("/", verifyJWT, submitRating)

export default ratingRouter