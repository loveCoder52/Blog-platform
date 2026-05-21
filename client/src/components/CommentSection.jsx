import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import toast from "react-hot-toast"

// Single comment — replies ke saath
function CommentItem({ comment, blogId, onDelete }) {
    const { user } = useAuth()
    const [showReply, setShowReply] = useState(false)
    const [replyText, setReplyText] = useState("")
    const [replies, setReplies]     = useState(comment.replies || [])
    const [loading, setLoading]     = useState(false)

    const date = new Date(comment.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short"
    })

    const submitReply = async () => {
        if (!replyText.trim()) return toast.error("Reply khali nahi ho sakti")
        try {
            setLoading(true)
            const res = await api.post(`/comments/${blogId}`, {
                content: replyText,
                parentComment: comment._id
            })
            setReplies(prev => [...prev, res.data.data])
            setReplyText("")
            setShowReply(false)
            toast.success("Reply add ho gayi!")
        } catch {
            toast.error("Reply nahi ho paya")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-1">
            {/* Main Comment */}
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {comment.author?.name?.[0]?.toUpperCase()}
                </div>

                <div className="flex-1">
                    {/* Author + date */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">
                            {comment.author?.name}
                        </span>
                        <span className="text-xs text-gray-400">{date}</span>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-gray-600 mt-0.5">
                        {comment.content}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 mt-1">
                        {user && (
                            <button
                                onClick={() => setShowReply(!showReply)}
                                className="text-xs text-gray-400 hover:text-indigo-600 transition">
                                💬 Reply
                            </button>
                        )}
                        {/* Apna comment delete kar sakte ho */}
                        {user?._id === comment.author?._id && (
                            <button
                                onClick={() => onDelete(comment._id)}
                                className="text-xs text-gray-400 hover:text-red-500 transition">
                                🗑 Delete
                            </button>
                        )}
                    </div>

                    {/* Reply Input */}
                    {showReply && (
                        <div className="flex gap-2 mt-2">
                            <input
                                type="text"
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Reply likho..."
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            <button
                                onClick={submitReply}
                                disabled={loading}
                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-indigo-700 disabled:opacity-50 transition">
                                {loading ? "..." : "Send"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Replies — indented */}
            {replies.length > 0 && (
                <div className="ml-11 border-l-2 border-gray-100 pl-4 space-y-3 mt-1">
                    {replies.map(reply => (
                        <div key={reply._id} className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {reply.author?.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-800">
                                        {reply.author?.name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(reply.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "short"
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    {reply.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Main Comment Section
export default function CommentSection({ blogId }) {
    const { user } = useAuth()
    const [comments, setComments]   = useState([])
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading]     = useState(false)
    const [fetching, setFetching]   = useState(true)

    // Comments fetch karo
    useState(() => {
        const load = async () => {
            try {
                const res = await api.get(`/comments/${blogId}`)
                setComments(res.data.data.comments)
            } catch {
                toast.error("Comments load nahi hue")
            } finally {
                setFetching(false)
            }
        }
        load()
    }, [blogId])

    const submitComment = async () => {
        if (!newComment.trim()) return toast.error("Comment khali nahi ho sakta")
        try {
            setLoading(true)
            const res = await api.post(`/comments/${blogId}`, {
                content: newComment
            })
            setComments(prev => [{ ...res.data.data, replies: [] }, ...prev])
            setNewComment("")
            toast.success("Comment add ho gaya!")
        } catch {
            toast.error("Comment nahi ho paya")
        } finally {
            setLoading(false)
        }
    }

    const deleteComment = async (commentId) => {
        try {
            await api.delete(`/comments/${commentId}`)
            setComments(prev => prev.filter(c => c._id !== commentId))
            toast.success("Comment delete ho gaya")
        } catch {
            toast.error("Delete nahi hua")
        }
    }

    return (
        <div className="mt-10">
            <h3 className="text-lg font-bold text-gray-800 mb-5">
                💬 Comments ({comments.length})
            </h3>

            {/* Comment Input */}
            {user ? (
                <div className="flex gap-3 mb-8">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && submitComment()}
                            placeholder="Apna comment likho..."
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={submitComment}
                            disabled={loading}
                            className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 transition">
                            {loading ? "..." : "Post"}
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-gray-400 mb-6 bg-gray-50 px-4 py-3 rounded-xl">
                    Comment karne ke liye{" "}
                    <a href="/login" className="text-indigo-600 hover:underline font-medium">
                        login karo
                    </a>
                </p>
            )}

            {/* Comments List */}
            {fetching ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"/>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-1/4"/>
                                <div className="h-3 bg-gray-200 rounded w-3/4"/>
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">
                    Abhi tak koi comment nahi — pehle tum karo! 👇
                </p>
            ) : (
                <div className="space-y-6">
                    {comments.map(comment => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            blogId={blogId}
                            onDelete={deleteComment}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}