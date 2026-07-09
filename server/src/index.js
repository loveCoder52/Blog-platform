import dotenv from "dotenv"
dotenv.config({ path: ".env" })

// Validate required environment variables
const requiredEnvVars = [
    "MONGODB_URI",
    "DB_NAME",
    "JWT_SECRET",
    "JWT_EXPIRY",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    // "SMTP_USER",
    // "SMTP_PASS"
]

const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:")
    missingVars.forEach(v => console.error(`   - ${v}`))
    process.exit(1)
}

import app from "./app.js";

const port = process.env.PORT || 8000;

app.listen(port, ()=>{
    console.log(`✅ Server running on port ${port}`);
})