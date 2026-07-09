import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import toast from "react-hot-toast"

export default function FollowButton({ targetUserId, initialFollowing, onUpdate }) {
    const { user } = useAuth()
    const navigate  = useNavigate()

    const [following, setFollowing] = useState(initialFollowing)
    const [loading, setLoading]     = useState(false)
    const [hovered, setHovered]     = useState(false)

    const handleFollow = async () => {
        if (!user) {
            toast.error("Follow karne ke liye login karo")
            return navigate("/login")
        }

        try {
            setLoading(true)
            const res = await api.post(`/follow/${targetUserId}/toggle`)
            setFollowing(res.data.data.following)

            // Parent ko update karo — count refresh ke liye
            if (onUpdate) onUpdate(res.data.data)

            toast.success(res.data.data.following
                ? "Follow kar liya! 🎉"
                : "Unfollow ho gaya"
            )
        } catch {
            toast.error("Kuch error aaya")
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 ${
                following
                    ? hovered
                        ? "bg-red-50 text-red-500 border border-red-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}>
            {loading ? "..." : following
                ? hovered ? "Unfollow" : "Following ✓"
                : "Follow"
            }
        </button>
    )
}