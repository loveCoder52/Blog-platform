import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import BlogCard from "../components/BlogCard"
import toast from "react-hot-toast"

export default function Profile() {
    const { username } = useParams()
    const { user, fetchMe, logout } = useAuth()
    const navigate = useNavigate()

    const [profile, setProfile]     = useState(null)
    const [blogs, setBlogs]         = useState([])
    const [loading, setLoading]     = useState(true)
    const [activeTab, setActiveTab] = useState("blogs")

    // Edit mode state
    const [editing, setEditing]     = useState(false)
    const [editForm, setEditForm]   = useState({ name: "", bio: "" })
    const [avatar, setAvatar]       = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [saving, setSaving]       = useState(false)

    // Password change state
    const [pwForm, setPwForm]       = useState({
        oldPassword: "", newPassword: ""
    })
    const [pwLoading, setPwLoading] = useState(false)

    const isOwner = user?.username === username

    // Profile fetch karo
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                const res = await api.get(`/users/${username}`)
                setProfile(res.data.data.user)
                setBlogs(res.data.data.blogs)
                setEditForm({
                    name: res.data.data.user.name,
                    bio:  res.data.data.user.bio || ""
                })
            } catch {
                toast.error("Profile nahi mili")
                navigate("/")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [username])

    // Avatar select
    const handleAvatar = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            return toast.error("Image 5MB se choti honi chahiye")
        }
        setAvatar(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    // Profile save karo
    const handleSave = async () => {
        try {
            setSaving(true)
            const formData = new FormData()
            formData.append("name", editForm.name)
            formData.append("bio",  editForm.bio)
            if (avatar) formData.append("avatar", avatar)

            const res = await api.patch("/users/update/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            setProfile(res.data.data)
            await fetchMe()   // Navbar mein bhi naam update ho
            setEditing(false)
            setAvatar(null)
            setAvatarPreview(null)
            toast.success("Profile update ho gayi!")

        } catch (err) {
            toast.error(err.response?.data?.message || "Update nahi hua")
        } finally {
            setSaving(false)
        }
    }

    // Password change karo
    const handlePasswordChange = async (e) => {
        e.preventDefault()
        if (!pwForm.oldPassword || !pwForm.newPassword) {
            return toast.error("Dono fields bharo")
        }
        try {
            setPwLoading(true)
            await api.patch("/users/update/password", pwForm)
            toast.success("Password change ho gaya!")
            setPwForm({ oldPassword: "", newPassword: "" })
        } catch (err) {
            toast.error(err.response?.data?.message || "Password change nahi hua")
        } finally {
            setPwLoading(false)
        }
    }

    if (loading) return (
        <div className="max-w-2xl mx-auto animate-pulse space-y-4">
            <div className="flex gap-4 items-center mt-4">
                <div className="w-20 h-20 rounded-full bg-gray-200"/>
                <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3"/>
                    <div className="h-3 bg-gray-200 rounded w-1/2"/>
                </div>
            </div>
            <div className="space-y-3 mt-6">
                {[1,2,3].map(i => (
                    <div key={i} className="h-24 bg-gray-200 rounded-2xl"/>
                ))}
            </div>
        </div>
    )

    if (!profile) return null

    return (
        <div className="max-w-2xl mx-auto">

            {/* Profile Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex items-start gap-4">

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        {avatarPreview || profile.avatar?.url ? (
                            <img
                                src={avatarPreview || profile.avatar.url}
                                alt={profile.name}
                                className="w-20 h-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold">
                                {profile.name?.[0]?.toUpperCase()}
                            </div>
                        )}

                        {/* Avatar change — sirf owner */}
                        {isOwner && editing && (
                            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition">
                                <span className="text-xs">✏️</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatar}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        {editing ? (
                            // Edit mode
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Naam"
                                    maxLength={50}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <textarea
                                    value={editForm.bio}
                                    onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                                    placeholder="Apne baare mein kuch likho..."
                                    rows={2}
                                    maxLength={200}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                                <p className="text-right text-xs text-gray-300">
                                    {editForm.bio.length}/200
                                </p>
                            </div>
                        ) : (
                            // View mode
                            <>
                                <h1 className="text-xl font-bold text-gray-800">
                                    {profile.name}
                                </h1>
                                <p className="text-sm text-gray-400">
                                    @{profile.username}
                                </p>
                                {profile.bio && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        {profile.bio}
                                    </p>
                                )}
                            </>
                        )}

                        {/* Stats */}
                        <div className="flex gap-4 mt-3 text-sm text-gray-400">
                            <span>
                                <strong className="text-gray-700">{blogs.length}</strong> blogs
                            </span>
                            <span>
                                <strong className="text-gray-700">
                                    {blogs.reduce((acc, b) => acc + (b.likes?.length || 0), 0)}
                                </strong> likes
                            </span>
                            <span>
                                <strong className="text-gray-700">
                                    {blogs.reduce((acc, b) => acc + (b.views || 0), 0)}
                                </strong> views
                            </span>
                        </div>
                    </div>

                    {/* Owner buttons */}
                    {isOwner && (
                        <div className="flex gap-2 flex-shrink-0">
                            {editing ? (
                                <>
                                    <button
                                        onClick={() => { setEditing(false); setAvatarPreview(null) }}
                                        className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                                    ✏️ Edit Profile
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs — sirf owner ko settings dikhegi */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
                {["blogs", ...(isOwner ? ["settings"] : [])].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition ${
                            activeTab === tab
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        }`}>
                        {tab === "blogs" ? `📝 Blogs (${blogs.length})` : "⚙️ Settings"}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "blogs" && (
                blogs.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="text-sm">Abhi tak koi blog nahi</p>
                        {isOwner && (
                            <Link to="/create"
                                className="mt-3 inline-block text-indigo-600 text-sm hover:underline">
                                Pehla blog likho →
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {blogs.map(blog => (
                            <BlogCard key={blog._id} blog={blog} />
                        ))}
                    </div>
                )
            )}

            {activeTab === "settings" && isOwner && (
                <div className="space-y-4">

                    {/* Change Password */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-4">
                            🔐 Password Change karo
                        </h3>
                        <form onSubmit={handlePasswordChange} className="space-y-3">
                            <input
                                type="password"
                                value={pwForm.oldPassword}
                                onChange={e => setPwForm(p => ({ ...p, oldPassword: e.target.value }))}
                                placeholder="Purana password"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="password"
                                value={pwForm.newPassword}
                                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                                placeholder="Naya password (min 8 chars)"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                disabled={pwLoading}
                                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                                {pwLoading ? "Change ho raha hai..." : "Password Change karo"}
                            </button>
                        </form>
                    </div>

                    {/* Logout */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-1">
                            👋 Logout
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Saare devices se logout ho jaoge
                        </p>
                        <button
                            onClick={async () => {
                                await logout()
                                toast.success("Logout ho gaye!")
                                navigate("/login")
                            }}
                            className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                            Logout
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                        <h3 className="font-semibold text-red-600 mb-1">
                            ⚠️ Danger Zone
                        </h3>
                        <p className="text-sm text-red-400 mb-4">
                            Account delete hone ke baad wapas nahi aayega
                        </p>
                        <button
                            onClick={async () => {
                                const pw = prompt("Confirm karne ke liye password likho:")
                                if (!pw) return
                                try {
                                    await api.delete("/users/delete/account", {
                                        data: { password: pw }
                                    })
                                    await logout()
                                    toast.success("Account delete ho gaya")
                                    navigate("/")
                                } catch (err) {
                                    toast.error(err.response?.data?.message || "Delete nahi hua")
                                }
                            }}
                            className="w-full bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition">
                            Account Delete karo
                        </button>
                    </div>

                </div>
            )}
        </div>
    )
}