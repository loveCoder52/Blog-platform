import { Link } from "react-router-dom"

export default function BlogCard({ blog }) {
    const { _id, title, coverImage, author, tags, likes, views, createdAt } = blog

    const date = new Date(createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
    })

    return (
        <Link to={`/blog/${_id}`}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex gap-4 p-4 group">

            {/* Cover Image */}
            {coverImage?.url && (
                <img
                    src={coverImage.url}
                    alt={title}
                    className="w-28 h-24 object-cover rounded-xl flex-shrink-0"
                />
            )}

            {/* Content */}
            <div className="flex flex-col justify-between flex-1 min-w-0">

                {/* Title */}
                <h2 className="text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition line-clamp-2">
                    {title}
                </h2>

                {/* Tags */}
                {tags?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-1">
                        {tags.slice(0, 3).map(tag => (
                            <span key={tag}
                                className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer — author, likes, views, date */}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="font-medium text-gray-600">
                        @{author?.username}
                    </span>
                    <span>·</span>
                    <span>❤️ {likes?.length || 0}</span>
                    <span>👁 {views || 0}</span>
                    <span className="ml-auto">{date}</span>
                </div>

            </div>
        </Link>
    )
}