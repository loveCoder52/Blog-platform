import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken';

const userSchema = new Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        sparse: true
    },
    
    name: {
        type: String,
        required: true,
        maxLength: [50, "Name 50 se jyada nahi ho sakta"]
    },
    
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        sparse: true,
        match: [/^\S+@\S+\.\S+$/, "Valid email do"],
    },
    
    password: {
        type: String,
        required: true,
        minLength: [8, "Password minimum 8 characters ka hona chahiye"],
        select: false,
    },
    
    avatar: {
        url: { type: String, default: "" },
        public_id: { type: String, default: "" }
    },
    
    bio: {
        type: String,
        maxLength: [200, "Bio 200 se zyada nahi ho sakti"],
        default: ""
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    // ─────────────────────────────────────────
    // EMAIL VERIFICATION SYSTEM
    // ─────────────────────────────────────────
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpiry: {
        type: Date
    },

    // ─────────────────────────────────────────
    // PASSWORD RESET SYSTEM
    // ─────────────────────────────────────────
    passwordResetToken: {
        type: String
    },
    passwordResetExpiry: {
        type: Date
    },

    // ─────────────────────────────────────────
    // SESSION / TOKEN MANAGEMENT
    // ─────────────────────────────────────────
    refreshToken: {
        type: String,
        select: false
    },

    // ─────────────────────────────────────────
    // BRUTE FORCE ATTACK PROTECTION
    // ─────────────────────────────────────────
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },

    // ─────────────────────────────────────────
    // SOFT DELETE
    // ─────────────────────────────────────────
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },

}, {
    timestamps: true
})

// ─────────────────────────────────────────────────────────────
// INDEXES - ADDED FOR PERFORMANCE
// ─────────────────────────────────────────────────────────────
userSchema.index({ username: 1 }, { unique: true, sparse: true })
userSchema.index({ email: 1 }, { unique: true, sparse: true })
userSchema.index({ isDeleted: 1 })

// ─────────────────────────────────────────────────────────────
// MIDDLEWARES
// ─────────────────────────────────────────────────────────────

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
})

// ─────────────────────────────────────────────────────────────
// METHODS
// ─────────────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY || "15m"
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d"
        }
    )
}

export const User = mongoose.model("User", userSchema);
