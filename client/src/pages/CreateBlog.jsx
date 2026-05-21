import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios.js"
import toast from "react-hot-toast"

export default function CreateBlog() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        title: "",
        content: "",
        tags: "",
        isPublished: true
    })
    const [image, setImage]         = useState(null)
    const [preview, setPreview]     = useState(null)
    const [loading, setLoading]     = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    // Image select hone par preview dikhao
    const handleImage = (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Size check — 5MB
        if (file.size > 5 * 1024 * 1024) {
            return toast.error("Image 5MB se choti honi chahiye")
        }

        setImage(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!form.title.trim())   return toast.error("Title do")
        if (!form.content.trim()) return toast.error("Content do")

        try {
            setLoading(true)

            // FormData — kyunki image bhi bhej rahe hain
            const formData = new FormData()
            formData.append("title",       form.title)
            formData.append("content",     form.content)
            formData.append("tags",        form.tags)
            formData.append("isPublished", form.isPublished)
            if (image) formData.append("coverImage", image)

            // const res = await api.post("/blogs", formData, {
            //     headers: { "Content-Type": "multipart/form-data" }
            // })
            
            const res = await api.post("/blogs", formData)

            toast.success("Blog publish ho gaya! 🎉")
            navigate(`/blog/${res.data.data._id}`)

        } catch (err) {
            toast.error(err.response?.data?.message || "Blog create nahi hua")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    ✍️ Naya Blog Likho
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    Apne thoughts duniya ke saath share karo
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Cover Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Image
                    </label>

                    {/* Preview */}
                    {preview ? (
                        <div className="relative">
                            <img
                                src={preview}
                                alt="preview"
                                className="w-full h-48 object-cover rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={() => { setImage(null); setPreview(null) }}
                                className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/70 transition">
                                ✕ Remove
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
                            <span className="text-3xl mb-2">🖼️</span>
                            <span className="text-sm text-gray-400">
                                Click karke image choose karo
                            </span>
                            <span className="text-xs text-gray-300 mt-1">
                                PNG, JPG, WEBP — max 5MB
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImage}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Aapke blog ka title..."
                        maxLength={100}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {/* Character count */}
                    <p className="text-right text-xs text-gray-300 mt-1">
                        {form.title.length}/100
                    </p>
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content *
                    </label>
                    <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        placeholder="Apni kahani likho..."
                        rows={12}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <p className="text-right text-xs text-gray-300 mt-1">
                        {form.content.length} characters
                    </p>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                        <span className="text-gray-400 font-normal ml-1">
                            (comma se alag karo)
                        </span>
                    </label>
                    <input
                        type="text"
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        placeholder="javascript, nodejs, react"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    {/* Tag preview */}
                    {form.tags && (
                        <div className="flex gap-2 flex-wrap mt-2">
                            {form.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                                <span key={tag}
                                    className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Publish toggle */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div>
                        <p className="text-sm font-medium text-gray-700">
                            Abhi Publish karo?
                        </p>
                        <p className="text-xs text-gray-400">
                            Off karo toh draft mein save hoga
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="isPublished"
                            checked={form.isPublished}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-400 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"/>
                    </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                        {loading
                            ? "Publish ho raha hai..."
                            : form.isPublished ? "🚀 Publish karo" : "💾 Draft Save karo"
                        }
                    </button>
                </div>

            </form>
        </div>
    )
}