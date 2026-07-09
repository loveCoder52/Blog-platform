import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import cookieParser from "cookie-parser"
import authRouter from './routes/auth.routes.js';
import blogRouter from './routes/blog.routes.js';
import commentRouter from './routes/comment.routes.js';
import userRouter from './routes/user.routes.js';
import ratingRouter from './routes/rating.routes.js';
import followRouter from './routes/follow.routes.js';


connectDB();

const app = express();

// ─────────────────────────────────────────
// CORS Configuration - FIXED
// ─────────────────────────────────────────
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, //Allows cookies and authentication headers to be sent. Without credentials: true, the browser will refuse to send cookies across origins.
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400 //This tells browsers how long (in seconds) they can cache the preflight (OPTIONS) response.
}

// Additional validation for production
if (process.env.NODE_ENV === "production") {
    const allowedOrigins = (process.env.FRONTEND_URL || "").split(",").map(url => url.trim())
    corsOptions.origin = function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOptions))
app.use(express.json({ limit: "10mb" })) // This middleware parses JSON data sent in the request body.
app.use(express.urlencoded({ limit: "10mb", extended: true })) // This middleware parses data submitted using the application/x-www-form-urlencoded format, which is commonly used by HTML forms.
app.use(cookieParser())

// Routes
app.use("/api/auth", authRouter)
app.use("/api/blogs", blogRouter)
app.use("/api/comments", commentRouter)
app.use("/api/users", userRouter)
app.use("/api/ratings", ratingRouter)
app.use("/api/follow", followRouter)

// Global Error Handler (placeholder for errorHandler middleware)
app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.statusCode || 500).json({
        statusCode: err.statusCode || 500,
        message: err.message || "Internal Server Error",
        data: null
    })
})

export default app;




// When your frontend and backend are on different domains (for example, a React app on one domain and an API on another), sameSite: "none" together with secure: true is often required for the browser to include the cookie on cross-site requests. If everything is served from the same site, "lax" or "strict" may provide stronger protection against cross-site request forgery (CSRF).