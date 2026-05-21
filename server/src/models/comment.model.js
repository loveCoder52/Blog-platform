import mongoose, { Schema } from "mongoose"

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
        maxLength: [500, "Comment 500 chars se zyada nahi"]
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    blog: {
        type: Schema.Types.ObjectId,
        ref: "Blog",
        required: true
    },
    parentComment: {          // Nested comments ke liye
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

export const Comment = mongoose.model("Comment", commentSchema);