import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"
import toast from "react-hot-toast"

export default function ForgotPassword() {
    const [email, setEmail]     = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent]       = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) return toast.error("Email do")

        try {
            setLoading(true)
            await api.post("/auth/forgot-password", { email })
            setSent(true)
        } catch (err) {
            toast.error(err.response?.data?.message || "Kuch error aaya")
        } finally {
            setLoading(false)
        }
    }

    // Email sent — success screen
    if (sent) return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white rounded-2xl p-10 shadow-sm text-center max-w-md w-full">
                <p className="text-5xl mb-4">📧</p>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Email Bhej Diya!
                </h2>
                <p className="text-gray-500 text-sm mb-2">
                    <strong>{email}</strong> pe reset link bheja hai.
                </p>
                <p className="text-gray-400 text-xs mb-6">
                    Link 15 minute mein expire ho jaayega. Spam folder bhi check karo.
                </p>
                <Link to="/login"
                    className="text-indigo-600 text-sm hover:underline">
                    ← Login pe wapas jao
                </Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">

                {/* Header */}
                <p className="text-4xl mb-4">🔐</p>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                    Password Bhool Gaye?
                </h1>
                <p className="text-gray-500 text-sm mb-6">
                    Email daalo — reset link bhej denge
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="tumhara@email.com"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                        {loading ? "Bhej raha hai..." : "Reset Link Bhejo"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Password yaad aa gaya?{" "}
                    <Link to="/login"
                        className="text-indigo-600 hover:underline font-medium">
                        Login karo
                    </Link>
                </p>

            </div>
        </div>
    )
}