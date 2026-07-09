import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import api from "../api/axios"
import toast from "react-hot-toast"

export default function ResetPassword() {
    const { token }  = useParams()
    const navigate   = useNavigate()

    const [password, setPassword]     = useState("")
    const [confirm, setConfirm]       = useState("")
    const [loading, setLoading]       = useState(false)
    const [success, setSuccess]       = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!password || !confirm) return toast.error("Dono fields bharo")
        if (password.length < 8)   return toast.error("Password minimum 8 characters ka hona chahiye")
        if (password !== confirm)  return toast.error("Dono passwords match nahi kar rahe")

        try {
            setLoading(true)
            await api.post(`/auth/reset-password/${token}`, { password })
            setSuccess(true)

            // 3 second baad login pe bhejo
            setTimeout(() => navigate("/login"), 3000)

        } catch (err) {
            toast.error(err.response?.data?.message || "Reset nahi hua")
        } finally {
            setLoading(false)
        }
    }

    // Success screen
    if (success) return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white rounded-2xl p-10 shadow-sm text-center max-w-md w-full">
                <p className="text-5xl mb-4">🎉</p>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Password Reset Ho Gaya!
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                    3 second mein login page pe jaoge...
                </p>
                <Link to="/login"
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition">
                    Login karo →
                </Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">

                <p className="text-4xl mb-4">🔑</p>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                    Naya Password Banao
                </h1>
                <p className="text-gray-500 text-sm mb-6">
                    Minimum 8 characters ka strong password rakho
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Naya Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        {/* Password strength */}
                        {password.length > 0 && (
                            <div className="mt-1.5 flex gap-1">
                                {[1,2,3].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                                        password.length >= i * 4
                                            ? i === 1 ? "bg-red-400"
                                            : i === 2 ? "bg-yellow-400"
                                            : "bg-green-400"
                                            : "bg-gray-200"
                                    }`}/>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password Confirm karo
                        </label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        {/* Match indicator */}
                        {confirm.length > 0 && (
                            <p className={`text-xs mt-1 ${
                                password === confirm
                                    ? "text-green-500"
                                    : "text-red-400"
                            }`}>
                                {password === confirm
                                    ? "✅ Passwords match kar rahe hain"
                                    : "❌ Passwords match nahi kar rahe"}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                        {loading ? "Reset ho raha hai..." : "🔑 Password Reset karo"}
                    </button>

                </form>
            </div>
        </div>
    )
}