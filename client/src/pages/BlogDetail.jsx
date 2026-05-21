import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import CommentSection from "../components/CommentSection"
import toast from "react-hot-toast"

export default function BlogDetail() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate  = useNavigate()

    const [blog, setBlog]       = useState(null)
    const [loading, setLoading] = useState(true)
    const [liked, setLiked]     = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [deleting, setDeleting]   = useState(false)

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/blogs/${id}`)
                const data = res.data.data
                setBlog(data)
                setLikeCount(data.likes?.length || 0)

                // Kya maine already like kiya hai?
                if (user) {
                    setLiked(data.likes?.includes(user._id))
                }
            } catch {
                toast.error("Blog nahi mila")
                navigate("/")
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [id])

    const handleLike = async () => {
        if (!user) return toast.error("Like karne ke liye login karo")
        try {
            const res = await api.post(`/blogs/${id}/like`)
            setLiked(res.data.data.liked)
            setLikeCount(res.data.data.totalLikes)
        } catch {
            toast.error("Like nahi ho paya")
        }
    }

    const handleDelete = async () => {
        if (!confirm("Blog delete karna chahte ho?")) return
        try {
            setDeleting(true)
            await api.delete(`/blogs/${id}`)
            toast.success("Blog delete ho gaya")
            navigate("/")
        } catch {
            toast.error("Delete nahi hua")
        } finally {
            setDeleting(false)
        }
    }

    if (loading) return (
        <div className="max-w-2xl mx-auto animate-pulse space-y-4 mt-6">
            <div className="h-64 bg-gray-200 rounded-2xl"/>
            <div className="h-6 bg-gray-200 rounded w-3/4"/>
            <div className="h-4 bg-gray-200 rounded w-1/2"/>
            <div className="space-y-2 mt-6">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-3 bg-gray-200 rounded"/>
                ))}
            </div>
        </div>
    )

    if (!blog) return null

    const isOwner = user?._id === blog.author?._id
    const date = new Date(blog.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric"
    })

    return (
        <div className="max-w-2xl mx-auto">

            {/* Cover Image */}
            {blog.coverImage?.url && (
                <img
                    src={blog.coverImage.url}
                    alt={blog.title}
                    className="w-full h-64 object-cover rounded-2xl mb-6"
                />
            )}

            {/* Tags */}
            {blog.tags?.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                    {blog.tags.map(tag => (
                        <span key={tag}
                            className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {blog.title}
            </h1>

            {/* Author + meta */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <Link to={`/u/${blog.author?.username}`}
                    className="flex items-center gap-2 hover:opacity-80 transition">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {blog.author?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-800">
                            {blog.author?.name}
                        </p>
                        <p className="text-xs text-gray-400">{date}</p>
                    </div>
                </Link>

                {/* Stats */}
                <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>👁 {blog.views}</span>

                    {/* Like Button */}
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1 transition ${
                            liked ? "text-red-500" : "hover:text-red-400"
                        }`}>
                        {liked ? "❤️" : "🤍"} {likeCount}
                    </button>

                    {/* Owner controls */}
                    {isOwner && (
                        <div className="flex gap-2 ml-2">
                            <Link to={`/blog/${id}/edit`}
                                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
                                ✏️ Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                                {deleting ? "..." : "🗑 Delete"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Blog Content */}
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {blog.content}
            </div>

            {/* Divider */}
            <hr className="my-10 border-gray-100"/>

            {/* Comments */}
            <CommentSection blogId={id} />

        </div>
    )
}