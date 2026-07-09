import { useState, useEffect, useCallback } from "react"
import api from "../api/axios"
import BlogCard from "../components/BlogCard"
import toast from "react-hot-toast"

export default function Home() {
    const [blogs, setBlogs]         = useState([])
    const [loading, setLoading]     = useState(true)
    const [search, setSearch]       = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [tag, setTag]             = useState("")
    const [page, setPage]           = useState(1)
    const [pagination, setPagination] = useState(null)

    const fetchBlogs = useCallback(async () => {
        try {
            setLoading(true)

            const params = { page, limit: 10 }
            if (search) params.search = search
            if (tag)    params.tag    = tag

            const res = await api.get("/blogs", { params })
            setBlogs(res.data.data.blogs)
            setPagination(res.data.data.pagination)

        } catch {
            toast.error("Blogs load nahi hue")
        } finally {
            setLoading(false)
        }
    }, [page, search, tag])

    useEffect(() => {
        fetchBlogs()
    }, [fetchBlogs])

    // Search submit — Enter ya button press
    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        setSearch(searchInput)
        setTag("")
    }

    // Tag click karne par filter
    const handleTagClick = (t) => {
        setTag(t)
        setSearch("")
        setSearchInput("")
        setPage(1)
    }

    // Filter clear karo
    const clearFilters = () => {
        setSearch("")
        setSearchInput("")
        setTag("")
        setPage(1)
    }

    return (
        <div className="max-w-2xl mx-auto">

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Blogs search karo..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition">
                    Search
                </button>
            </form>

            {/* Active filter badge */}
            {(search || tag) && (
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-500">Filter:</span>
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium">
                        {search ? `"${search}"` : `#${tag}`}
                    </span>
                    <button
                        onClick={clearFilters}
                        className="text-xs text-gray-400 hover:text-red-500 transition">
                        ✕ Clear
                    </button>
                </div>
            )}

            {/* Blog List */}
            {loading ? (
                // Skeleton loader
                <div className="space-y-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-4 flex gap-4 animate-pulse">
                            <div className="w-28 h-24 bg-gray-200 rounded-xl shrink-0"/> // flex-shrink-0
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"/>
                                <div className="h-3 bg-gray-200 rounded w-1/2"/>
                                <div className="h-3 bg-gray-200 rounded w-1/4"/>
                            </div>
                        </div>
                    ))}
                </div>

            ) : blogs.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-sm">Koi blog nahi mila</p>
                    {(search || tag) && (
                        <button onClick={clearFilters}
                            className="mt-3 text-indigo-600 text-sm hover:underline">
                            Filters hataao
                        </button>
                    )}
                </div>

            ) : (
                <div className="space-y-4">
                    {blogs.map(blog => (
                        <BlogCard key={blog._id} blog={blog} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">

                    <button
                        onClick={() => setPage(p => p - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                        ← Pehle
                    </button>

                    <span className="text-sm text-gray-500">
                        {page} / {pagination.pages}
                    </span>

                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page === pagination.pages}
                        className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                        Aage →
                    </button>

                </div>
            )}

        </div>
    )
}