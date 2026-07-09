import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import api from "../api/axios"

export default function VerifyEmail() {
    const { token } = useParams()
    const [status, setStatus] = useState("loading")  // loading | success | error

    useEffect(() => {
        const verify = async () => {
            try {
                await api.get(`/auth/verify/${token}`)
                setStatus("success")
            } catch {
                setStatus("error")
            }
        }
        verify()
    }, [token])

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white rounded-2xl p-10 shadow-sm text-center max-w-md w-full">

                {status === "loading" && (
                    <>
                        <p className="text-4xl mb-4">⏳</p>
                        <p className="text-gray-500">Verify ho raha hai...</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <p className="text-5xl mb-4">🎉</p>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Email Verify Ho Gaya!
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Ab tum login kar sakte ho
                        </p>
                        <Link to="/login"
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition">
                            Login karo →
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <p className="text-5xl mb-4">❌</p>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Link Invalid Hai
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Token expire ho gaya ya galat hai
                        </p>
                        <ResendVerification />
                    </>
                )}

            </div>
        </div>
    )
}

// Resend form
function ResendVerification() {
    const [email, setEmail]     = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent]       = useState(false)

    const handleResend = async () => {
        if (!email) return
        try {
            setLoading(true)
            await api.post("/auth/resend-verification", { email })
            setSent(true)
        } catch {
            // error
        } finally {
            setLoading(false)
        }
    }

    if (sent) return (
        <p className="text-green-600 text-sm">
            ✅ Email bhej diya! Inbox check karo.
        </p>
    )

    return (
        <div className="flex gap-2">
            <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Apna email likho"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
                onClick={handleResend}
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 transition">
                {loading ? "..." : "Resend"}
            </button>
        </div>
    )
}