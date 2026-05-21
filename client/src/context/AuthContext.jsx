import { createContext, useContext, useState, useEffect } from "react"
import api from "../api/axios"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null)
    const [loading, setLoading] = useState(true)

    // App open hote hi check karo — kya user logged in hai?
    useEffect(() => {
        const token = localStorage.getItem("accessToken")
        if (token) fetchMe()
        else setLoading(false)
    }, [])

    const fetchMe = async () => {
        try {
            const res = await api.get("/auth/me")
            setUser(res.data.data)
        } catch {
            localStorage.removeItem("accessToken")
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password })
        const { user, accessToken } = res.data.data
        localStorage.setItem("accessToken", accessToken)
        setUser(user)
        return user
    }

    const register = async (data) => {
        const res = await api.post("/auth/register", data)
        return res.data
    }

    const logout = async () => {
        await api.post("/auth/logout")
        localStorage.removeItem("accessToken")
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, fetchMe }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)