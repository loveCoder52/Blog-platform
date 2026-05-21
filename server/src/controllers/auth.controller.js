import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import cookieParser from 'cookie-parser';

const cookieOptions = {
   httpOnly: true, // XSS (Cross Site Scripting) attacks se protection.
   secure: process.env.NODE_ENV === "production", //Network sniffing se protection.
   sameSite: "strict", // CSRF attacks prevent karta hai.
   maxAge: 7 * 24 * 60 * 60 * 1000
}
export const register = asyncHandler(async (req, res) => {

    const { username, name, email, password } = req.body;

    // ─────────────────────────────────────────
    // Validation
    // Check karo koi field empty to nahi
    // ─────────────────────────────────────────

    // some() check karta hai:
    // Kya array me koi ek element bhi condition satisfy karta hai?

    // f => !f?.trim()

    // Meaning:
    // Agar field undefined/null/empty/"   "
    // hai to TRUE return karega

    if ([username, name, email, password]
        .some(f => !f?.trim())) {

        throw new ApiError(
            400,
            "All fields are required"
        )
    }

    // ─────────────────────────────────────────
    // Check user already exists ya nahi
    // ─────────────────────────────────────────

    const existing = await User.findOne({

        // $or:
        // email ya username dono me se
        // koi bhi match hua to user mil jayega

        $or: [
            { email },
            { username }
        ]
    })

    // Agar user already exist karta hai
    if (existing) {

        throw new ApiError(
            409,
            "User already exists"
        )
    }

    // ─────────────────────────────────────────
    // New user create karo
    // ─────────────────────────────────────────
    // IMPORTANT:
    // Ye step tumhare code me missing tha

    const user = await User.create({
        username,
        name,
        email,
        password
        // Password automatically hash hoga
        // because pre("save") middleware use kiya hai
    })

    // ─────────────────────────────────────────
    // Created user ko dobara fetch karo
    // Sensitive fields remove karke
    // ─────────────────────────────────────────
    const createdUser = await User
        .findById(user._id)
        .select("-password -refreshToken")

    // Safety check
    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering user"
        )
    }

    // ─────────────────────────────────────────
    // Final response bhejo
    // ─────────────────────────────────────────
    return res.status(201).json(
        new ApiResponse(
            201,
            // User data
            createdUser,
            // Message
            "Registration successful"
        )
    )

})

export const login = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(
            400,
            "Email aur password do"
        )
    }

    // ─────────────────────────────────────────
    // User find karo email se
    // ─────────────────────────────────────────

    // IMPORTANT:
    // password field schema me:
    // select: false
    // tha

    // Isliye manually include karna padega

    // +password means:
    // password field bhi fetch karo

    const user = await User
        .findOne({ email })
        .select("+password")

    // Agar user nahi mila
    if (!user) {
        throw new ApiError(
            404,
            "User nahi mila"
        )
    }

    // ─────────────────────────────────────────
    // Password compare karo
    // ─────────────────────────────────────────

    // comparePassword method:
    // bcrypt.compare use karta hai

    const isPasswordCorrect =
        await user.comparePassword(password)

    // Agar password wrong hai
    if (!isPasswordCorrect) {
        throw new ApiError(
            401,
            "Galat password"
        )
    }

    // ─────────────────────────────────────────
    // JWT Tokens Generate Karo
    // ─────────────────────────────────────────

    // Access Token:
    // Short-lived
    // Har protected request me use hota hai

    const accessToken =
        user.generateAccessToken()

    // Refresh Token:
    // Long-lived
    // New access token generate karne ke liye

    const refreshToken =
        user.generateRefreshToken()

    // ─────────────────────────────────────────
    // Refresh Token DB me save karo
    // ─────────────────────────────────────────

    // Security reason:
    // Token rotation / logout / revoke
    // systems me useful

    user.refreshToken = refreshToken

    // validateBeforeSave: false
    // Means:
    // Save karte time schema validations mat chalao

    // Kyuki hum sirf refreshToken update kar rahe hain

    await user.save({
        validateBeforeSave: false
    })

    // ─────────────────────────────────────────
    // Safe user object fetch karo
    // Sensitive data remove karke
    // ─────────────────────────────────────────

    const loggedInUser = await User
        .findById(user._id)
        .select("-password -refreshToken")

    // ─────────────────────────────────────────
    // Response bhejo
    // ─────────────────────────────────────────
    return res
        // HTTP success status
        .status(200)
        // Access token cookie set karo
        .cookie(
            "accessToken",
            accessToken,
            cookieOptions
        )
        // Refresh token cookie set karo
        // .cookie(
        //     "refreshToken",
        //     refreshToken,
        //     cookieOptions
        // )
        // Final JSON response
        .json(
            new ApiResponse(
                200,
                {
                    // Logged-in user data
                    user: loggedInUser,
                    // Access token frontend ko bhi bhej rahe
                    refreshToken
                },
                "Login successful"
            )
        )
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
            cookieOptions
        )
        // Refresh token cookie delete karo
        .clearCookie(
            "refreshToken",
            cookieOptions
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