import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({ email: "", password: "" })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!form.email || !form.password) {
            return toast.error("Dono fields bharo")
        }

        try {
            setLoading(true)
            await login(form.email, form.password)
            toast.success("Login successful!")
            navigate("/")
        } catch (err) {
            const msg = err.response?.data?.message || "Login failed"

            // Email verify nahi hui — special message
            if (err.response?.status === 403) {
                toast.error("Email verify karo — inbox check karo! 📧", {
                    duration: 5000
                })
            } else {
                toast.error(msg)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">

                {/* Header */}
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                    Welcome back 👋
                </h1>
                <p className="text-gray-500 text-sm mb-6">
                    Apne account mein login karo
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                        <Link to="/forgot-password"
                            className="text-xs text-indigo-600 hover:underline">
                            Password bhool gaye?
                        </Link>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {loading ? "Login ho raha hai..." : "Login"}
                    </button>

                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Account nahi hai?{" "}
                    <Link to="/register" className="text-indigo-600 font-medium hover:underline">
                        Register karo
                    </Link>
                </p>

            </div>
        </div>
    )
}
