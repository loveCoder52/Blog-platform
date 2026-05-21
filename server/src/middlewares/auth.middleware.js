import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// export const verifyJWT = asyncHandler(async (req, res, next) => {
//     const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "")

//     if (!token) throw new ApiError(401, "Unauthorized request")

//     const decoded = jwt.verify(token, process.env.JWT_SECRET)

//     const user = await User.findById(decoded._id).select("-password -refreshToken")

//     if (!user) throw new ApiError(401, "Invalid token")

//     req.user = user
//     next()
// })




export const verifyJWT = asyncHandler(async (req, res, next) => {

    const token =
        req.cookies?.accessToken ||
        req.headers["authorization"]?.replace("Bearer ", "")

    console.log("TOKEN:", token)

    if (!token) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        console.log("DECODED:", decoded)

        const user = await User
            .findById(decoded._id)
            .select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid token")
        }

        req.user = user

        next()

    } catch (error) {

        console.log("JWT ERROR:", error.message)

        throw new ApiError(
            401,
            "Invalid token"
        )
    }
})