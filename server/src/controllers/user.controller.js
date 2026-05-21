import { User } from "../models/user.model.js"
import { Blog } from "../models/blog.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js"

// ── Get User Profile (public) ─────────────────────────────
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findOne({
        username: req.params.username,
        isDeleted: false
    }).select("-password -refreshToken -emailVerificationToken -passwordResetToken")

    if (!user) throw new ApiError(404, "User nahi mila")

    // Us user ke published blogs bhi bhejo
    const blogs = await Blog.find({
        author: user._id,
        isPublished: true,
        isDeleted: false
    })
    .select("title coverImage tags views likes createdAt")
    .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, { user, blogs }, "Profile fetched")
    )
})

// ── Update Profile ────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, bio } = req.body

    // Kam se kam kuch toh bhejo
    if (!name && !bio && !req.file) {
        throw new ApiError(400, "Kuch toh update karo")
    }

    const user = await User.findById(req.user._id)

    // Avatar upload kiya?
    if (req.file) {
        // Purana avatar delete karo
        if (user.avatar?.public_id) {
            await deleteFromCloudinary(user.avatar.public_id)
        }

        const uploaded = await uploadOnCloudinary(req.file.path)
        if (!uploaded) throw new ApiError(500, "Avatar upload failed")

        user.avatar = {
            url: uploaded.secure_url,
            public_id: uploaded.public_id
        }
    }

    if (name) user.name = name
    if (bio)  user.bio  = bio

    await user.save({ validateBeforeSave: false })

    const updated = await User.findById(user._id)
        .select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, updated, "Profile updated")
    )
})

// ── Change Password ───────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Dono passwords do")
    }

    if (oldPassword === newPassword) {
        throw new ApiError(400, "Naya password alag hona chahiye")
    }

    const user = await User.findById(req.user._id).select("+password")

    const isCorrect = await user.comparePassword(oldPassword)
    if (!isCorrect) throw new ApiError(401, "Purana password galat hai")

    user.password = newPassword   // pre("save") middleware auto hash karega
    await user.save()

    return res.status(200).json(
        new ApiResponse(200, {}, "Password change ho gaya")
    )
})

// ── Delete Account (soft delete) ──────────────────────────
export const deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body

    const user = await User.findById(req.user._id).select("+password")

    const isCorrect = await user.comparePassword(password)
    if (!isCorrect) throw new ApiError(401, "Galat password")

    user.isDeleted = true
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200, {}, "Account delete ho gaya"))
})