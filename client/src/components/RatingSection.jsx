import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import toast from "react-hot-toast"

export default function RatingSection() {
    const { user } = useAuth()

    const [ratings, setRatings]     = useState([])
    const [myRating, setMyRating]   = useState(0)
    const [hovered, setHovered]     = useState(0)
    const [review, setReview]       = useState("")
    const [loading, setLoading]     = useState(false)
    const [fetching, setFetching]   = useState(true)

    // Ratings fetch karo
    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get("/ratings")
                setRatings(res.data.data.ratings)

                // Kya maine already rate kiya?
                if (user) {
                    const mine = res.data.data.ratings.find(
                        r => r.user._id === user._id
                    )
                    if (mine) {
                        setMyRating(mine.rating)
                        setReview(mine.review || "")
                    }
                }
            } catch {
                // Rating feature optional hai
            } finally {
                setFetching(false)
            }
        }
        load()
    }, [user])

    const submitRating = async () => {
        if (!user)     return toast.error("Rate karne ke liye login karo")
        if (!myRating) return toast.error("Stars select karo")

        try {
            setLoading(true)
            const res = await api.post("/ratings", {
                rating: myRating,
                review: review.trim()
            })
            setRatings(res.data.data.ratings)
            toast.success("Rating de di! Shukriya 🙏")
        } catch {
            toast.error("Rating nahi ho paya")
        } finally {
            setLoading(false)
        }
    }

    // Average calculate karo
    const average = ratings.length
        ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
        : "0.0"

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-1">⭐ App ko Rate karo</h2>
            <p className="text-sm text-gray-400 mb-5">
                Tumhara feedback bahut important hai!
            </p>

            {/* Average Rating */}
            <div className="flex items-center gap-4 bg-indigo-50 rounded-xl p-4 mb-6">
                <div className="text-center">
                    <p className="text-4xl font-bold text-indigo-600">{average}</p>
                    <p className="text-xs text-gray-400 mt-1">Average</p>
                </div>
                <div>
                    {/* Star display */}
                    <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(star => (
                            <span key={star}
                                className={`text-2xl ${
                                    star <= Math.round(average)
                                        ? "text-yellow-400"
                                        : "text-gray-200"
                                }`}>
                                ★
                            </span>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        {ratings.length} ratings
                    </p>
                </div>
            </div>

            {/* Star Selector */}
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                    Apni rating do:
                </p>
                <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                        <button
                            key={star}
                            onClick={() => setMyRating(star)}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            className="text-3xl transition-transform hover:scale-110">
                            <span className={
                                star <= (hovered || myRating)
                                    ? "text-yellow-400"
                                    : "text-gray-200"
                            }>
                                ★
                            </span>
                        </button>
                    ))}
                </div>

                {/* Star label */}
                {(hovered || myRating) > 0 && (
                    <p className="text-xs text-indigo-600 mt-1 font-medium">
                        {["", "Bahut Bura 😞", "Thik Hai 😐", "Acha Hai 🙂", "Bahut Acha 😊", "Zabardast! 🤩"][hovered || myRating]}
                    </p>
                )}
            </div>

            {/* Review Input */}
            <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder="Kuch likho app ke baare mein... (optional)"
                rows={3}
                maxLength={300}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
            />
            <p className="text-right text-xs text-gray-300 -mt-2 mb-3">
                {review.length}/300
            </p>

            <button
                onClick={submitRating}
                disabled={loading || !myRating}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                {loading ? "Submit ho raha hai..." : "⭐ Rating Submit karo"}
            </button>

            {/* Reviews List */}
            {ratings.filter(r => r.review).length > 0 && (
                <div className="mt-6 space-y-3">
                    <p className="text-sm font-medium text-gray-700">
                        💬 User Reviews
                    </p>
                    {ratings.filter(r => r.review).map(r => (
                        <div key={r._id}
                            className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                    {r.user?.name}
                                </span>
                                <span className="text-yellow-400 text-sm">
                                    {"★".repeat(r.rating)}
                                    {"☆".repeat(5 - r.rating)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">{r.review}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}