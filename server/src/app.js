import dotenv from 'dotenv'
dotenv.config({
    path: '.env'
})


// import express from 'express';
// import cors from 'cors';
// import connectDB from './config/db.js';
// import cookieParser from "cookie-parser"
// import authRouter from './routes/auth.routes.js';
// import blogRouter from './routes/blog.routes.js';
// import commentRouter from './routes/comment.routes.js';
// import userRouter from './routes/user.routes.js';



// connectDB();

// const app = express();
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true
// }))
// app.use(express.json());
// app.use(cookieParser())
// app.use("/api/auth", authRouter)
// app.use("/api/blogs", blogRouter)
// app.use("/api/comments", commentRouter)
// app.use("/api/users", userRouter)


// export default app;

import express from 'express';
// import dotenv from 'dotenv'
import cors from 'cors';
import connectDB from './config/db.js';
import cookieParser from "cookie-parser"
import authRouter from './routes/auth.routes.js';
import blogRouter from './routes/blog.routes.js';
import commentRouter from './routes/comment.routes.js';
import userRouter from './routes/user.routes.js';

// dotenv.config({
//     path: '.env'
// })

connectDB();

const app = express();

// ─────────────────────────────────────────
// CORS Configuration - FIXED
// ─────────────────────────────────────────
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400
}

// Additional validation for production
if (process.env.NODE_ENV === "production") {
    const allowedOrigins = (process.env.FRONTEND_URL || "").split(",").map(url => url.trim())
    corsOptions.origin = function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOptions))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))
app.use(cookieParser())

// Routes
app.use("/api/auth", authRouter)
app.use("/api/blogs", blogRouter)
app.use("/api/comments", commentRouter)
app.use("/api/users", userRouter)

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
