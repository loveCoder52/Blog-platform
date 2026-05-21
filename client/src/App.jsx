import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext.jsx"
import Navbar from "./components/Navbar.jsx"
import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import BlogDetail from "./pages/BlogDetail.jsx"
import CreateBlog from "./pages/CreateBlog.jsx"
import Profile from "./pages/Profile.jsx"

// Protected route — login nahi hai toh login pe bhejo
const Protected = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return <div className="text-center mt-20">Loading...</div>
    return user ? children : <Navigate to="/login" />
}

export default function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-8">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/blog/:id" element={<BlogDetail />} />
                    <Route path="/u/:username" element={<Profile />} />
                    <Route path="/create"     element={
                        <Protected><CreateBlog /></Protected>
                    }/>
                    <Route path="/blog/:id/edit" element={
                        <Protected><CreateBlog /></Protected>
                    } />
                </Routes>
            </main>
        </div>
    )
}