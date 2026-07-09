import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// ── Follow / Unfollow Toggle ──────────────────────────────
export const toggleFollow = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const myId = req.user._id

    // Khud ko follow nahi kar sakte
    if (userId === myId.toString()) {
        throw new ApiError(400, "Khud ko follow nahi kar sakte")
    }

    const targetUser = await User.findById(userId)
    if (!targetUser || targetUser.isDeleted) {
        throw new ApiError(404, "User nahi mila")
    }

    const me = await User.findById(myId)

    const alreadyFollowing = me.following.includes(userId)

    if (alreadyFollowing) {
        // Unfollow
        await User.findByIdAndUpdate(myId, {
            $pull: { following: userId }
        })
        await User.findByIdAndUpdate(userId, {
            $pull: { followers: myId }
        })
    } else {
        // Follow
        await User.findByIdAndUpdate(myId, {
            $addToSet: { following: userId }
        })
        await User.findByIdAndUpdate(userId, {
            $addToSet: { followers: myId }
        })
    }

    // Updated counts bhejo
    const updated = await User.findById(userId)

    return res.status(200).json(
        new ApiResponse(200, {
            following: !alreadyFollowing,
            followersCount: updated.followers.length,
            followingCount: updated.following.length
        }, alreadyFollowing ? "Unfollow ho gaya" : "Follow ho gaya")
    )
})

// ── Followers list ────────────────────────────────────────
export const getFollowers = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { page = 1, limit = 20 } = req.query

    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20))
    const skip = (pageNum - 1) * limitNum

    const user = await User.findById(userId)
        .select("followers")

    if (!user) throw new ApiError(404, "User nahi mila")

    const totalFollowers = user.followers.length
    const paginatedFollowers = user.followers.slice(skip, skip + limitNum)

    const populatedFollowers = await User.find(
        { _id: { $in: paginatedFollowers } },
        "name username avatar"
    ).lean()

    return res.status(200).json(
        new ApiResponse(200, {
            followers: populatedFollowers,
            pagination: {
                total: totalFollowers,
                page: pageNum,
                pages: Math.ceil(totalFollowers / limitNum)
            }
        }, "Followers fetched")
    )
})

// ── Following list ────────────────────────────────────────
export const getFollowing = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { page = 1, limit = 20 } = req.query

    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20))
    const skip = (pageNum - 1) * limitNum

    const user = await User.findById(userId)
        .select("following")

    if (!user) throw new ApiError(404, "User nahi mila")

    const totalFollowing = user.following.length
    const paginatedFollowing = user.following.slice(skip, skip + limitNum)

    const populatedFollowing = await User.find(
        { _id: { $in: paginatedFollowing } },
        "name username avatar"
    ).lean()

    return res.status(200).json(
        new ApiResponse(200, {
            following: populatedFollowing,
            pagination: {
                total: totalFollowing,
                page: pageNum,
                pages: Math.ceil(totalFollowing / limitNum)
            }
        }, "Following fetched")
    )
})