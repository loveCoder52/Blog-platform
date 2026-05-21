import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

export default function Register() {
    const { register } = useAuth()
    const navigate     = useNavigate()

    const [form, setForm]       = useState({
        username: "", name: "", email: "", password: ""
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const validate = () => {
        if (!form.username.trim()) return "Username do"
        if (!form.name.trim())     return "Naam do"
        if (!form.email.trim())    return "Email do"
        if (form.password.length < 8) return "Password 8 characters ka hona chahiye"
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const error = validate()
        if (error) return toast.error(error)

        try {
            setLoading(true)
            await register(form)
            toast.success("Account ban gaya! Ab login karo.")
            navigate("/login")
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">

                {/* Header */}
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                    Account banao 🚀
                </h1>
                <p className="text-gray-500 text-sm mb-6">
                    Free mein join karo aur likhna shuru karo
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Name + Username — side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Naam
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

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
                            placeholder="minimum 8 characters"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />

                        {/* Password strength indicator */}
                        {form.password.length > 0 && (
                            <div className="mt-1.5 flex gap-1">
                                {[1,2,3].map((i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                                        form.password.length >= i * 4
                                            ? i === 1 ? "bg-red-400"
                                            : i === 2 ? "bg-yellow-400"
                                            : "bg-green-400"
                                            : "bg-gray-200"
                                    }`}/>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {loading ? "Account ban raha hai..." : "Register karo"}
                    </button>

                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Pehle se account hai?{" "}
                    <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                        Login karo
                    </Link>
                </p>

            </div>
        </div>
    )
}