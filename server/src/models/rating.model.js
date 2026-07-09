import mongoose, { Schema } from "mongoose"

const ratingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        maxLength: 300,
        trim: true,
        default: ""
    }
}, { timestamps: true })

// Prevent duplicate ratings from same user
ratingSchema.index({ user: 1 }, { unique: true, sparse: true })

export const Rating = mongoose.model("Rating", ratingSchema)