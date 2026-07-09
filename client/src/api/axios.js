import axios from "axios"

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const api = axios.create({
    baseURL: `${baseURL}/api`,
    withCredentials: true,   // Cookies automatically bhejega
})

// Har request mein token auto attach
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 401 aaye toh logout kar do
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("accessToken")
            window.location.href = "/login"
        }
        return Promise.reject(error)
    }
)

export default api