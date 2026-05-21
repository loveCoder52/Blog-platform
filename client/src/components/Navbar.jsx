import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        toast.success("Logout ho gaye!")
        navigate("/login")
    }

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-indigo-600">
                    BlogApp
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link to="/create"
                                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700">
                                + New Blog
                            </Link>
                            <Link to={`/u/${user.username}`}
                                className="text-gray-700 hover:text-indigo-600 text-sm font-medium">
                                {user.name}
                            </Link>
                            <button onClick={handleLogout}
                                className="text-sm text-gray-500 hover:text-red-500">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login"
                                className="text-sm text-gray-600 hover:text-indigo-600">
                                Login
                            </Link>
                            <Link to="/register"
                                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}