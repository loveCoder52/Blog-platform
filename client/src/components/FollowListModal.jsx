import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"

export default function FollowListModal({ userId, type, onClose }) {
    const [list, setList]       = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(`/follow/${userId}/${type}`)
                setList(res.data.data[type])
            } catch {
                // error
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [userId, type])

    return (
        // Backdrop
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
            onClick={onClose}>

            {/* Modal */}
            <div className="bg-white rounded-2xl w-full max-w-sm max-h-[70vh] overflow-hidden shadow-xl"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 capitalize">
                        {type === "followers" ? "👥 Followers" : "➡️ Following"}
                    </h3>
                    <button onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl">
                        ✕
                    </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
                    {loading ? (
                        <div className="space-y-3 p-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-gray-200"/>
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-3 bg-gray-200 rounded w-1/3"/>
                                        <div className="h-2 bg-gray-200 rounded w-1/4"/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : list.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-3xl mb-2">👻</p>
                            <p className="text-sm">Abhi koi nahi</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {list.map(u => (
                                <Link
                                    key={u._id}
                                    to={`/u/${u.username}`}
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">

                                    {/* Avatar */}
                                    {u.avatar?.url ? (
                                        <img src={u.avatar.url}
                                            alt={u.name}
                                            className="w-10 h-10 rounded-full object-cover"/>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                            {u.name?.[0]?.toUpperCase()}
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {u.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            @{u.username}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}