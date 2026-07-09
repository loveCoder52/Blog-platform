// mongoose → MongoDB ke saath kaam karne ke liye ODM library
// Schema → database structure define karne ke liye
import mongoose, { Schema } from 'mongoose'

// bcrypt → password hashing ke liye use hota hai
// Plain password ko secure encrypted hash me convert karta hai
import bcrypt from 'bcryptjs'

// crypto → secure random tokens aur hashing ke liye
// Password reset token, email verification token etc. me use hota hai
import crypto from 'crypto'

import jwt from 'jsonwebtoken';


// ─────────────────────────────────────────────────────────────
// USER SCHEMA
// Schema ka matlab:
// Database me user ka data kis format me store hoga
// ─────────────────────────────────────────────────────────────

const userSchema = new Schema({

    // Username field
    username: {
        type: String,
        required: true,
        unique: true,
        // Sare letters lowercase me convert ho jayenge
        // Example: LOVE → love
        lowercase: true,
        // Starting aur ending spaces remove karega
        // Example: "  love  " → "love"
        trim: true,
    },
    // Full name of user
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

        // Database indexing
        // Fast searching ke liye use hota hai
        // Login systems me useful
        index: true,

        // Regex validation
        // Check karega valid email format hai ya nahi
        match: [/^\S+@\S+\.\S+$/, "Valid email do"],
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "Password minimum 8 characters ka hona chahiye"],

        // IMPORTANT SECURITY FEATURE
        // By default database query me password nahi bhejega
        // Example:
        // User.find() → password nahi milega
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

    // User role
    // Authorization / RBAC systems me use hota hai
    role: {
        type: String,

        // Sirf ye 2 values allowed
        enum: ["user", "admin"],

        // Default role
        default: "user"
    },

    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],

    // ─────────────────────────────────────────
    // EMAIL VERIFICATION SYSTEM
    // ─────────────────────────────────────────

    // Check karega user ne email verify ki ya nahi
    isEmailVerified: {
        type: Boolean,
        default: false
    },

    // Email verification token store hoga
    emailVerificationToken: {
        type: String
    },

    // Verification token expiry
    emailVerificationExpiry: {
        type: Date
    },

    // ─────────────────────────────────────────
    // PASSWORD RESET SYSTEM
    // Forgot Password feature me use hota hai
    // ─────────────────────────────────────────

    // Hashed password reset token store hoga
    passwordResetToken: {
        type: String
    },

    // Reset token kab expire hoga
    passwordResetExpiry: {
        type: Date
    },

    // ─────────────────────────────────────────
    // SESSION / TOKEN MANAGEMENT
    // ─────────────────────────────────────────

    refreshToken: {

        type: String,

        // Security reason:
        // By default refresh token response me nahi bhejna
        select: false
    },

    // ─────────────────────────────────────────
    // BRUTE FORCE ATTACK PROTECTION
    // ─────────────────────────────────────────

    // Wrong login attempts count karega
    loginAttempts: {
        type: Number,
        default: 0
    },

    // Account kis time tak locked rahega
    lockUntil: {
        type: Date
    },

    // ─────────────────────────────────────────
    // SOFT DELETE
    // ─────────────────────────────────────────

    // User ko actual DB se delete nahi karte
    // Bas mark kar dete hain
    // Useful for:
    // - recovery
    // - audit logs
    // - restore account
    isDeleted: {
        type: Boolean,
        default: false
    },

}, {

    // Automatically create karega:
    // createdAt
    // updatedAt
    timestamps: true
})

// ─────────────────────────────────────────────────────────────
// MIDDLEWARES
// Middleware → Save/update se pehle ya baad me chalne wala function
// ─────────────────────────────────────────────────────────────

// Password hash karo save hone se pehle
userSchema.pre("save", async function () {

    // Agar password modify nahi hua
    // to dobara hash mat karo
    if (!this.isModified("password")) return;

    // Password hashing
    // bcrypt.hash(password, saltRounds)

    // Salt rounds = 10
    // Jitna bada number utna secure but slow
    this.password = await bcrypt.hash(this.password, 10);
})

// ─────────────────────────────────────────────────────────────
// METHODS
// Methods → Har user document ke paas available functions
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────
// PASSWORD COMPARISON METHOD
// Login ke time use hota hai
// ─────────────────────────────────────────

userSchema.methods.comparePassword = async function (enteredPassword) {

    // enteredPassword → user ne login me jo password diya
    // this.password → database wala hashed password
    // bcrypt.compare:
    // plain password ko hash se compare karta hai
    return await bcrypt.compare(
        enteredPassword,
        this.password
    )
}

// ─────────────────────────────────────────────
// ACCESS TOKEN GENERATOR
// ─────────────────────────────────────────────

// Access Token:
// Short-lived token hota hai
// User authentication ke liye use hota hai

// Typical expiry:
// 15 min → 1 hour → 1 day

// Har protected API request me bheja jata hai
userSchema.methods.generateAccessToken = function () {
    // jwt.sign() → JWT token create karta hai
    return jwt.sign(
        // ─────────────────────────────
        // PAYLOAD
        // Token ke andar store hone wala data
        // ─────────────────────────────
        {
            // Current user ki ID
            _id: this._id,

            // User email
            email: this.email,

            // Username
            username: this.username
        },
        // ─────────────────────────────
        // SECRET KEY
        // Token ko sign/verify karne ke liye
        // ─────────────────────────────
        // Agar secret same nahi hua
        // token verify nahi hoga
        process.env.JWT_SECRET,
        // ─────────────────────────────
        // OPTIONS
        // ─────────────────────────────
        {
            // Token expiry time
            // Example:
            // 15m
            // 1h
            // 1d
            expiresIn: process.env.JWT_EXPIRY
        }
    )
}

// ─────────────────────────────────────────────
// REFRESH TOKEN GENERATOR
// ─────────────────────────────────────────────

// Refresh Token:
// Long-lived token hota hai

// Use:
// Jab access token expire ho jaye
// tab naya access token generate karne ke liye

// Usually:
// 7d → 30d

// IMPORTANT:
// Refresh token har request me nahi bhejte
// Usually:
// - httpOnly cookies
// - database
// me securely store hota hai

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        // ─────────────────────────────
        // PAYLOAD
        // ─────────────────────────────
        {
            // Sirf minimal data store karo
            // Security best practice
            _id: this._id
        },
        // Same secret key
        process.env.JWT_SECRET,
        // Token expiry
        {
            expiresIn: "30d"
        }
    )
}

// ─────────────────────────────────────────
// PASSWORD RESET TOKEN GENERATOR
// Forgot password system me use hota hai
// ─────────────────────────────────────────
userSchema.methods.generatePasswordResetToken = function () {

    // Secure random token generate karo
    // 32 bytes = 256-bit secure token
    const resetToken = crypto
        .randomBytes(32)
        .toString("hex")

    // SECURITY:
    // Plain token database me store nahi karte

    // Token ko SHA256 se hash karo
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    // Token expiry
    // 15 minutes
    this.passwordResetExpiry =
        Date.now() + 15 * 60 * 1000

    // Plain token return karo
    // Isko email me bhejenge
    return resetToken
}

// ─────────────────────────────────────────
// ACCOUNT LOCK CHECK
// ─────────────────────────────────────────

userSchema.methods.isLocked = function () {

    // Agar:
    // lockUntil exist karta hai
    // AND
    // current time se future me hai

    // to account locked hai

    return this.lockUntil &&
        this.lockUntil > Date.now()
}

// ─────────────────────────────────────────
// LOGIN ATTEMPT INCREMENT
// Brute force protection
// ─────────────────────────────────────────

userSchema.methods.incrementLoginAttempts = async function () {

    // Failed attempts increase karo
    this.loginAttempts += 1

    // Agar attempts 5 ya usse jyada ho gaye
    if (this.loginAttempts >= 5) {

        // Account 30 min ke liye lock
        this.lockUntil =
            Date.now() + 30 * 60 * 1000
    }

    // Changes database me save karo
    await this.save()
}

// ─────────────────────────────────────────────────────────────
// MODEL CREATION
// "User" model create kar rahe hain
// Ye users collection ko represent karega
// ─────────────────────────────────────────────────────────────

export const User = mongoose.model("User", userSchema);










// import mongoose, { Schema } from 'mongoose'
// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'
// import crypto from 'crypto'


// const userSchema = new Schema({
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true,
//         trim: true,
//     },
//     name: {
//         type: String,
//         required: true,
//         maxLength: [50, "Name 50 se jyada nahi ho sakta"]
//     },
//     email: {
//         type: String,
//         required: [true, "Email is required"],
//         unique: true,
//         lowercase: true,
//         trim: true,
//         index: true,
//         match: [/^\S+@\S+\.\S+$/, "Valid email do"],
//     },
//     password: {
//         type: String,
//         required: true,
//         minLength: [8, "Password minimum 8 characters ka hona chahiye"],
//         select: false,
//     },
//     avatar: {
//         url: { type: String, default: "" },
//         public_id: { type: String, default: "" }
//     },
//     bio: {
//         type: String,
//         maxLength: [200, "Bio 200 se zyada nahi ho sakti"],
//         default: ""
//     },
//     role: {
//         type: String,
//         enum: ["user", "admin"],
//         default: "user"
//     },
//     followers: [{
//         type: Schema.Types.ObjectId,
//         ref: "User",
//         default: []
//     }],
//     following: [{
//         type: Schema.Types.ObjectId,
//         ref: "User",
//         default: []
//     }],
//     isEmailVerified: {
//         type: Boolean,
//         default: false
//     },
//     emailVerificationToken: {
//         type: String
//     },
//     emailVerificationExpiry: {
//         type: Date
//     },
//     passwordResetToken: {
//         type: String
//     },
//     passwordResetExpiry: {
//         type: Date
//     },
//     refreshToken: {
//         type: String,
//         select: false
//     },
//     loginAttempts: {
//         type: Number,
//         default: 0
//     },
//     lockUntil: {
//         type: Date
//     },
//     isDeleted: {
//         type: Boolean,
//         default: false
//     },
// }, {
//     timestamps: true
// })

// userSchema.pre("save", async function () {
//     if (!this.isModified("password")) return;
//     this.password = await bcrypt.hash(this.password, 10);
// })

// userSchema.methods.comparePassword = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password)
// }

// userSchema.methods.generateAccessToken = function () {
//     return jwt.sign(
//         {
//             _id: this._id,
//             email: this.email,
//             username: this.username
//         },
//         process.env.JWT_SECRET,
//         {
//             expiresIn: process.env.JWT_EXPIRY
//         }
//     )
// }

// userSchema.methods.generateRefreshToken = function () {
//     return jwt.sign(
//         {
//             _id: this._id
//         },
//         process.env.JWT_SECRET,
//         {
//             expiresIn: "30d"
//         }
//     )
// }

// userSchema.methods.generatePasswordResetToken = function () {
//     const resetToken = crypto.randomBytes(32).toString("hex")

//     this.passwordResetToken = crypto
//         .createHash("sha256")
//         .update(resetToken)
//         .digest("hex")

//     this.passwordResetExpiry = Date.now() + 15 * 60 * 1000

//     return resetToken
// }

// userSchema.methods.isLocked = function () {
//     return this.lockUntil && this.lockUntil > Date.now()
// }

// userSchema.methods.incrementLoginAttempts = async function () {
//     this.loginAttempts += 1

//     if (this.loginAttempts >= 5) {
//         this.lockUntil = Date.now() + 30 * 60 * 1000
//     }

//     await this.save()
// }

// export const User = mongoose.model("User", userSchema);





























