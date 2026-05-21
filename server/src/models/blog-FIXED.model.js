import mongoose, { Schema } from "mongoose"

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: [100, "Title 100 se zyada nahi"],
        index: true
    },
    content: {
        type: String,
        required: true,
    },
    coverImage: {
        url: String,
        public_id: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    tags: [String],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    isPublished: {
        type: Boolean,
        default: false,
        index: true
    },
    views: {
        type: Number,
        default: 0
    },
    // ─────────────────────────────────────────
    // CRITICAL FIX: Added missing isDeleted field
    // ─────────────────────────────────────────
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    }
}, { timestamps: true })

// Indexes for performance
blogSchema.index({ title: "text", content: "text" })
blogSchema.index({ author: 1, isPublished: 1, isDeleted: 1 })
blogSchema.index({ createdAt: -1 })
blogSchema.index({ tags: 1 })

export const Blog = mongoose.model("Blog", blogSchema);
