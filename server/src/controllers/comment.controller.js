import { Comment } from "../models/comment.model.js"
import { Blog } from "../models/blog.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// ── Add Comment ───────────────────────────────────────────
export const addComment = asyncHandler(async (req, res) => {
    const { content, parentComment } = req.body
    const { blogId } = req.params

    if (!content?.trim()) throw new ApiError(400, "Comment khali nahi ho sakta")

    // Blog exist karta hai?
    const blog = await Blog.findById(blogId)
    if (!blog || blog.isDeleted) throw new ApiError(404, "Blog nahi mila")

    // Agar parentComment hai toh check karo woh exist karta hai
    if (parentComment) {
        const parent = await Comment.findById(parentComment)
        if (!parent) throw new ApiError(404, "Parent comment nahi mila")
    }

    const comment = await Comment.create({
        content,
        author: req.user._id,
        blog: blogId,
        parentComment: parentComment || null
    })

    // Populate karke bhejo — frontend ko author ka naam chahiye hoga
    const populated = await comment.populate("author", "name username")

    return res.status(201).json(
        new ApiResponse(201, populated, "Comment add ho gaya")
    )
})

// ── Get Comments of a Blog ────────────────────────────────
export const getComments = asyncHandler(async (req, res) => {
    const { blogId } = req.params
    const { page = 1, limit = 20 } = req.query

    const skip = (page - 1) * limit

    // Sirf top-level comments (parentComment: null)
    const [comments, total] = await Promise.all([
        Comment.find({ blog: blogId, parentComment: null, isDeleted: false })
            .populate("author", "name username")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Comment.countDocuments({ blog: blogId, parentComment: null, isDeleted: false })
    ])

    // Har comment ke replies bhi laao
    const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
            const replies = await Comment.find({
                parentComment: comment._id,
                isDeleted: false
            }).populate("author", "name username")
              .sort({ createdAt: 1 })

            return { ...comment.toObject(), replies }
        })
    )

    return res.status(200).json(
        new ApiResponse(200, {
            comments: commentsWithReplies,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        }, "Comments fetched")
    )
})

// ── Update Comment ────────────────────────────────────────
export const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const comment = await Comment.findById(req.params.id)

    if (!comment || comment.isDeleted) throw new ApiError(404, "Comment nahi mila")

    // Sirf apna comment update kar sakte ho
    if (comment.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Tumhara comment nahi hai")
    }

    if (!content?.trim()) throw new ApiError(400, "Comment khali nahi ho sakta")

    comment.content = content
    await comment.save()

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated")
    )
})

// ── Delete Comment (soft delete) ──────────────────────────
export const deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id)

    if (!comment || comment.isDeleted) throw new ApiError(404, "Comment nahi mila")

    // Author ya blog owner dono delete kar sakte hain
    const blog = await Blog.findById(comment.blog)
    const isAuthor = comment.author.toString() === req.user._id.toString()
    const isBlogOwner = blog?.author.toString() === req.user._id.toString()

    if (!isAuthor && !isBlogOwner) {
        throw new ApiError(403, "Permission nahi hai")
    }

    comment.isDeleted = true
    await comment.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted")
    )
})