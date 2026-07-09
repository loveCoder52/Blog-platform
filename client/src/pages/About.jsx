import RatingSection from "../components/RatingSection.jsx"
export default function About() {
    return (
        <div className="max-w-2xl mx-auto">

            {/* Hero Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center mb-6">

                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                    L {/* ← Apna naam ka pehla letter */}
                </div>

                <h1 className="text-2xl font-bold text-gray-800">
                    Love Sharma {/* ← Apna naam */}
                </h1>
                <p className="text-indigo-600 font-medium text-sm mt-1">
                    Full Stack Developer
                </p>
                <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-md mx-auto">
                    Ek passionate developer jo web technologies se love karta hai.
                    React, Node.js aur MongoDB mera favorite stack hai.
                    {/* ← Apne baare mein likho */}
                </p>

                {/* Social Links */}
                <div className="flex justify-center gap-3 mt-5">
                    <a href="https://github.com/loveCoder52"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-700 transition">
                        GitHub
                    </a>
                    <a href="https://linkedin.com/in/love-sharma-dev"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition">
                        LinkedIn
                    </a>
                    <a href="mailto:love.sharma.engineer@email.com"
                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-600 transition">
                        Email
                    </a>
                </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <h2 className="font-bold text-gray-800 mb-4">🛠️ Tech Stack Used</h2>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { name: "React.js",    role: "Frontend Framework",  color: "bg-blue-50 text-blue-600" },
                        { name: "Node.js",     role: "Backend Runtime",     color: "bg-green-50 text-green-600" },
                        { name: "Express.js",  role: "Web Framework",       color: "bg-gray-50 text-gray-600" },
                        { name: "MongoDB",     role: "Database",            color: "bg-emerald-50 text-emerald-600" },
                        { name: "Cloudinary",  role: "Image Storage",       color: "bg-purple-50 text-purple-600" },
                        { name: "Tailwind CSS", role: "Styling",            color: "bg-cyan-50 text-cyan-600" },
                        { name: "JWT",         role: "Authentication",      color: "bg-yellow-50 text-yellow-600" },
                        { name: "Bcrypt",      role: "Password Hashing",    color: "bg-red-50 text-red-600" },
                    ].map(tech => (
                        <div key={tech.name}
                            className={`${tech.color} rounded-xl px-4 py-3`}>
                            <p className="font-semibold text-sm">{tech.name}</p>
                            <p className="text-xs opacity-70 mt-0.5">{tech.role}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* App Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <h2 className="font-bold text-gray-800 mb-4">📊 App Features</h2>
                <div className="space-y-2">
                    {[
                        "✅ JWT Authentication with Refresh Tokens",
                        "✅ Blog CRUD with Cover Image Upload",
                        "✅ Nested Comments with Replies",
                        "✅ Like / Unlike System",
                        "✅ Search & Tag Filter",
                        "✅ User Profile with Avatar",
                        "✅ Pagination",
                        "✅ Protected Routes",
                    ].map(feature => (
                        <p key={feature} className="text-sm text-gray-600">
                            {feature}
                        </p>
                    ))}
                </div>
            </div>

            {/* Rating Section */}
            <RatingSection />

        </div>
    )
}