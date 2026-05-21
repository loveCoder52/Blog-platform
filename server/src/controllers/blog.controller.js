// import { Blog } from "../models/blog.model.js"
// import { ApiError } from "../utils/ApiError.js"
// import { ApiResponse } from "../utils/ApiResponse.js"
// import { asyncHandler } from "../utils/asyncHandler.js"
// import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js"

// // ── Create Blog ───────────────────────────────────────────
// export const createBlog = asyncHandler(async (req, res) => {
//     const { title, content, tags, isPublished } = req.body

//     if (!title?.trim() || !content?.trim()) {
//         throw new ApiError(400, "Title aur content required hai")
//     }

//     // Cover image upload
//     let coverImage = null
//     if (req.file) {
//         const uploaded = await uploadOnCloudinary(req.file.path)
//         if (!uploaded) throw new ApiError(500, "Image upload failed")
//         coverImage = {
//             url: uploaded.secure_url,
//             public_id: uploaded.public_id
//         }
//     }

//     const blog = await Blog.create({
//         title,
//         content,
//         coverImage,
//         author: req.user._id,
//         tags: tags ? tags.split(",").map(t => t.trim()) : [],
//         isPublished: isPublished || false
//     })

//     return res.status(201).json(
//         new ApiResponse(201, blog, "Blog created successfully")
//     )
// })

// // ── Get All Blogs (with pagination + search) ──────────────
// export const getAllBlogs = asyncHandler(async (req, res) => {
//     const { page = 1, limit = 10, search, tag } = req.query

//     const query = { isPublished: true, isDeleted: false }

//     // Search filter
//     if (search) {
//         query.$text = { $search: search }
//     }

//     // Tag filter
//     if (tag) {
//         query.tags = tag
//     }

//     const skip = (page - 1) * limit

//     const [blogs, total] = await Promise.all([
//         Blog.find(query)
//             .populate("author", "name username")   // Sirf naam aur username chahiye
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(Number(limit)),
//         Blog.countDocuments(query)
//     ])

//     return res.status(200).json(
//         new ApiResponse(200, {
//             blogs,
//             pagination: {
//                 total,
//                 page: Number(page),
//                 pages: Math.ceil(total / limit)
//             }
//         }, "Blogs fetched")
//     )
// })

// // ── Get Single Blog ───────────────────────────────────────
// export const getBlogById = asyncHandler(async (req, res) => {
//     const blog = await Blog.findById(req.params.id)
//         .populate("author", "name username")

//     if (!blog || blog.isDeleted) throw new ApiError(404, "Blog nahi mila")

//     // View count badhao
//     blog.views += 1
//     await blog.save({ validateBeforeSave: false })

//     return res.status(200).json(
//         new ApiResponse(200, blog, "Blog fetched")
//     )
// })

// // ── Update Blog ───────────────────────────────────────────
// export const updateBlog = asyncHandler(async (req, res) => {
//     const blog = await Blog.findById(req.params.id)

//     if (!blog || blog.isDeleted) throw new ApiError(404, "Blog nahi mila")

//     // Sirf author update kar sakta hai
//     if (blog.author.toString() !== req.user._id.toString()) {
//         throw new ApiError(403, "Tumhara blog nahi hai")
//     }

//     const { title, content, tags, isPublished } = req.body

//     // Naya image upload kiya?
//     if (req.file) {
//         // Purana image Cloudinary se delete karo
//         if (blog.coverImage?.public_id) {
//             await deleteFromCloudinary(blog.coverImage.public_id)
//         }

//         const uploaded = await uploadOnCloudinary(req.file.path)
//         if (!uploaded) throw new ApiError(500, "Image upload failed")

//         blog.coverImage = {
//             url: uploaded.secure_url,
//             public_id: uploaded.public_id
//         }
//     }

//     if (title)       blog.title       = title
//     if (content)     blog.content     = content
//     if (tags)        blog.tags        = tags.split(",").map(t => t.trim())
//     if (isPublished !== undefined) blog.isPublished = isPublished

//     await blog.save()

//     return res.status(200).json(
//         new ApiResponse(200, blog, "Blog updated")
//     )
// })

// // ── Delete Blog (soft delete) ─────────────────────────────
// export const deleteBlog = asyncHandler(async (req, res) => {
//     const blog = await Blog.findById(req.params.id)

//     if (!blog || blog.isDeleted) throw new ApiError(404, "Blog nahi mila")

//     if (blog.author.toString() !== req.user._id.toString()) {
//         throw new ApiError(403, "Tumhara blog nahi hai")
//     }

//     blog.isDeleted = true
//     await blog.save({ validateBeforeSave: false })

//     return res.status(200).json(
//         new ApiResponse(200, {}, "Blog deleted")
//     )
// })

// // ── Like / Unlike ─────────────────────────────────────────
// export const toggleLike = asyncHandler(async (req, res) => {
//     const blog = await Blog.findById(req.params.id)

//     if (!blog || blog.isDeleted) throw new ApiError(404, "Blog nahi mila")

//     const userId = req.user._id
//     const alreadyLiked = blog.likes.includes(userId)

//     if (alreadyLiked) {
//         blog.likes = blog.likes.filter(id => id.toString() !== userId.toString())
//     } else {
//         blog.likes.push(userId)
//     }

//     await blog.save({ validateBeforeSave: false })

//     return res.status(200).json(
//         new ApiResponse(200, {
//             liked: !alreadyLiked,
//             totalLikes: blog.likes.length
//         }, alreadyLiked ? "Like removed" : "Blog liked")
//     )
// })


import { Blog } from "../models/blog.model.js"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js"

// ─────────────────────────────────────────
// VALIDATION HELPER
// ─────────────────────────────────────────
const validatePagination = (page, limit) => {
    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10))
    
    return {
        page: pageNum,
        limit: limitNum,
        skip: (pageNum - 1) * limitNum
    }
}

// ── Create Blog ───────────────────────────────────────────
export const createBlog = asyncHandler(async (req, res) => {
    const { title, content, tags, isPublished } = req.body

    if (!title?.trim() || !content?.trim()) {
        throw new ApiError(400, "Title aur content required hai")
    }

    // Input validation
    if (title.length > 100) throw new ApiError(400, "Title 100 characters se kam hona chahiye")
    if (content.length > 50000) throw new ApiError(400, "Content 50000 characters se kam hona chahiye")

    let coverImage = null
    if (req.file) {
        const uploaded = await uploadOnCloudinary(req.file.path)
        if (!uploaded) throw new ApiError(500, "Image upload failed")
        coverImage = {
            url: uploaded.secure_url,
            public_id: uploaded.public_id
        }
    }

    const blog = await Blog.create({
        title,
        content,
        coverImage,
        author: req.user._id,
        tags: tags ? tags.split(",").map(t => t.trim()).filter(t => t) : [],
        isPublished: isPublished === "true" || isPublished === true
    })

    // ─────────────────────────────────────────
    // FIXED: Populate author before responding
    // ─────────────────────────────────────────
    const populatedBlog = await Blog.findById(blog._id)
        .populate("author", "name username avatar")

    return res.status(201).json(
        new ApiResponse(201, populatedBlog, "Blog created successfully")
    )
})

// ── Get All Blogs (with pagination + search) ──────────────
export const getAllBlogs = asyncHandler(async (req, res) => {
    const { page, limit, search, tag } = req.query
    
    // ─────────────────────────────────────────
    // FIXED: Validate pagination
    // ─────────────────────────────────────────
    const { skip, limit: validLimit, page: validPage } = validatePagination(page, limit)

    const query = { isPublished: true, isDeleted: false }

    // ─────────────────────────────────────────
    // FIXED: Sanitize search input
    // ─────────────────────────────────────────
    if (search && typeof search === 'string') {
        const sanitizedSearch = search.trim().substring(0, 100)
        if (sanitizedSearch) {
            query.$text = { $search: sanitizedSearch }
        }
    }

    if (tag && typeof tag === 'string') {
        const sanitizedTag = tag.trim().substring(0, 50)
        if (sanitizedTag) {
            query.tags = sanitizedTag
        }
    }

    const [blogs, total] = await Promise.all([
        Blog.find(query)
            .populate("author", "name username")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(validLimit)
            .lean(),
        Blog.countDocuments(query)
    ])

    return res.status(200).json(
        new ApiResponse(200, {
            blogs,
            pagination: {
                total,
                page: validPage,
                pages: Math.ceil(total / validLimit)
            }
        }, "Blogs fetched")
    )
})

// ── Get Single Blog ───────────────────────────────────────
export const getBlogById = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id)
        .populate("author", "name username avatar")

    if (!blog || blog.isDeleted) throw new ApiError(404, "Blog nahi mila")

    blog.views += 1
    await blog.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, blog, "Blog fetched")
    )
})

// ── Update Blog ───────────────────────────────────────────
export const updateBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id)

    if (!blog || blog.isDeleted) throw new ApiError(404, "Blog nahi mila")

    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Tumhara blog nahi hai")
    }

    const { title, content, tags, isPublished } = req.body

    if (req.file) {
        if (blog.coverImage?.public_id) {
            await deleteFromCloudinary(blog.coverImage.public_id)
        }

        const uploaded = await uploadOnCloudinary(req.file.path)
        if (!uploaded) throw new ApiError(500, "Image upload failed")

        blog.coverImage = {
            url: uploaded.secure_url,
            public_id: uploaded.public_id
        }
    }

    if (title && title.length <= 100) blog.title = title.trim()
    if (content && content.length <= 50000) blog.content = content.trim()
    if (tags) blog.tags = tags.split(",").map(t => t.trim()).filter(t => t)
    if (isPublished !== undefined) blog.isPublished = isPublished === "true" || isPublished === true

    await blog.save()

    return res.status(200).json(
        new ApiResponse(200, blog, "Blog updated")
    )
})

// ── Delete Blog (soft delete) ─────────────────────────────
export const deleteBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id)

    if (!blog || blog.isDeleted) throw new ApiError(404, "Blog nahi mila")

    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Tumhara blog nahi hai")
    }

    blog.isDeleted = true
    await blog.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, {}, "Blog deleted")
    )
})

// ── Like / Unlike ─────────────────────────────────────────
export const toggleLike = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id)

    if (!blog || blog.isDeleted) throw new ApiError(404, "Blog nahi mila")

    const userId = req.user._id
    const alreadyLiked = blog.likes.includes(userId)

    if (alreadyLiked) {
        blog.likes = blog.likes.filter(id => id.toString() !== userId.toString())
    } else {
        blog.likes.push(userId)
    }

    await blog.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, {
            liked: !alreadyLiked,
            totalLikes: blog.likes.length
        }, alreadyLiked ? "Like removed" : "Blog liked")
    )
})
