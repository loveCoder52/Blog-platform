import { Rating } from "../models/rating.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Get all ratings
export const getRatings = asyncHandler(async (req, res) => {
    const ratings = await Rating.find()
        .populate("user", "name username")
        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, { ratings }, "Ratings fetched")
    )
})

// Submit / Update rating
export const submitRating = asyncHandler(async (req, res) => {
    const { rating, review } = req.body

    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError(400, "1 se 5 ke beech rating do")
    }

    // Pehle se diya hua rating update karo — warna naya banao
    const existing = await Rating.findOne({ user: req.user._id })

    if (existing) {
        existing.rating = rating
        existing.review = review || ""
        await existing.save()
    } else {
        await Rating.create({
            user: req.user._id,
            rating,
            review: review || ""
        })
    }

    const ratings = await Rating.find()
        .populate("user", "name username")
        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, { ratings }, "Rating submit ho gaya")
    )
})