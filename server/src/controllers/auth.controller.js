import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import cookieParser from 'cookie-parser';
import crypto from "crypto"
import jwt from "jsonwebtoken"
// import { sendVerificationEmail } from "../config/email.js"
// import { sendPasswordResetEmail } from "../config/email.js"


const accessTokenCookieOptions = {
   httpOnly: true,
   secure: process.env.NODE_ENV === "production",
   sameSite: "strict",
   maxAge: 15 * 60 * 1000  // 15 minutes
}

const refreshTokenCookieOptions = {
   httpOnly: true,
   secure: process.env.NODE_ENV === "production",
   sameSite: "strict",
   maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
}


// ── Register — update karo ────────────────────────────────
export const register = asyncHandler(async (req, res) => {
    const { username, name, email, password } = req.body

    if ([username, name, email, password].some(f => !f?.trim())) {
        throw new ApiError(400, "All fields are required.")
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] })
    if (existing) throw new ApiError(409, "Email or username already exists")

    // Verification token generate karo
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")

    const user = await User.create({
        username,
        name,
        email,
        password,
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: Date.now() + 24 * 60 * 60 * 1000  // 24 hours
    })

    // Verification email bhejo
    await sendVerificationEmail(email, name, verificationToken)

    return res.status(201).json(
        new ApiResponse(201, {}, "Register successful!")
    )
})

// ── Verify Email — naya function add karo ─────────────────
export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params

    // Token hash karo — DB mein hashed store hai
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() }  // Expire nahi hua?
    })

    if (!user) throw new ApiError(400, "Token invalid or expired")

    // Verify karo
    user.isEmailVerified       = true
    user.emailVerificationToken  = undefined
    user.emailVerificationExpiry = undefined
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, {}, "Email verify successfully, now Login.")
    )
})

// ── Resend Verification Email ─────────────────────────────
export const resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) throw new ApiError(404, "User nahi mila")

    if (user.isEmailVerified) {
        throw new ApiError(400, "Email pehle se verified hai")
    }

    const verificationToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")

    user.emailVerificationToken  = hashedToken
    user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000
    await user.save({ validateBeforeSave: false })

    await sendVerificationEmail(email, user.name, verificationToken)

    return res.status(200).json(
        new ApiResponse(200, {}, "Verification email bhej diya!")
    )
})

// ── Login — verified check add karo ──────────────────────
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) throw new ApiError(400, "Email aur password do")

    const user = await User.findOne({ email }).select("+password")
    if (!user) throw new ApiError(404, "User nahi mila")

    // // ← Yeh check add karo
    // if (!user.isEmailVerified) {
    //     throw new ApiError(403, "Pehle email verify karo. Inbox check karo.")
    // }

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) throw new ApiError(401, "Galat password")

    const accessToken  = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenCookieOptions)
        .json(new ApiResponse(200, { user: loggedInUser }, "Login successful"))
})

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token required")
    }

    try {
        const decoded = jwt.verify(
            incomingRefreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        )

        const user = await User.findById(decoded._id).select("+refreshToken")

        if (!user || user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid or expired refresh token")
        }

        const newAccessToken = user.generateAccessToken()
        const newRefreshToken = user.generateRefreshToken()

        user.refreshToken = newRefreshToken
        await user.save({ validateBeforeSave: false })

        return res
            .status(200)
            .cookie("accessToken", newAccessToken, accessTokenCookieOptions)
            .cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions)
            .json(
                new ApiResponse(200, {}, "Token refreshed successfully")
            )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }
})

export const logout = asyncHandler(async (req, res) => {

    // ─────────────────────────────────────────
    // Database se refresh token remove karo
    // ─────────────────────────────────────────

    await User.findByIdAndUpdate(
        // Current logged-in user ki ID
        req.user._id,
        {
            // MongoDB operator
            // Field ko completely remove kar deta hai
            $unset: {
                // refreshToken field remove karo
                refreshToken: 1
            }
        }
    )

    // ─────────────────────────────────────────
    // Cookies clear karo
    // Browser se tokens remove ho jayenge
    // ─────────────────────────────────────────

    return res
        // Success response
        .status(200)
        // Access token cookie delete karo
        .clearCookie(
            "accessToken",
            // cookieOptions
        )
        // Refresh token cookie delete karo
        .clearCookie(
            "refreshToken",
            // cookieOptions
        )
        // Final response
        .json(
            new ApiResponse(
                200,
                {},
                "Logout successful"
            )
        )
})

export const getMe = asyncHandler(async (req, res) => {

    // ─────────────────────────────────────────
    // Current logged-in user ka data return karo
    // ─────────────────────────────────────────

    return res.status(200).json(
        new ApiResponse(
            // HTTP success status
            200,
            // req.user:
            // Auth middleware ne attach kiya tha
            req.user,
            // Success message
            "Current user fetched"
        )
    )
})

// ── Forgot Password ───────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    if (!email) throw new ApiError(400, "Email do")

    const user = await User.findOne({ email })

    // Security — user mile ya na mile, same response do
    // (warna attacker ko pata chalega konsa email registered hai)
    if (!user) {
        return res.status(200).json(
            new ApiResponse(200, {}, "Agar email registered hai toh reset link bhej diya!")
        )
    }

    // Token generate karo
    const resetToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    user.passwordResetToken  = hashedToken
    user.passwordResetExpiry = Date.now() + 15 * 60 * 1000  // 15 minutes
    await user.save({ validateBeforeSave: false })

    // Email bhejo
    await sendPasswordResetEmail(email, user.name, resetToken)

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset link email pe bhej diya!")
    )
})

// ── Reset Password ────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    if (!password) throw new ApiError(400, "Naya password do")
    if (password.length < 8) {
        throw new ApiError(400, "Password minimum 8 characters ka hona chahiye")
    }

    // Token hash karo — DB mein hashed store hai
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

    const user = await User.findOne({
        passwordResetToken:  hashedToken,
        passwordResetExpiry: { $gt: Date.now() }  // Expire nahi hua?
    })

    if (!user) throw new ApiError(400, "Token invalid ya expire ho gaya")

    // Password update karo — pre save middleware hash karega
    user.password            = password
    user.passwordResetToken  = undefined
    user.passwordResetExpiry = undefined
    await user.save()

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset ho gaya! Ab login karo.")
    )
})