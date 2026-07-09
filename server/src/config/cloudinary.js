import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const deleteLocalFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            console.log(`✅ Deleted temp file: ${filePath}`)
        }
    } catch (error) {
        console.error(`❌ Failed to delete temp file ${filePath}:`, error.message)
    }
}

export const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null

    try {
        if (!fs.existsSync(localFilePath)) {
            throw new Error("Local file not found")
        }

        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "blog-platform",
            timeout: 30000  // 30 second timeout
        })

        deleteLocalFile(localFilePath)
        return result

    } catch (error) {
        console.error("Cloudinary upload error:", error.message)
        deleteLocalFile(localFilePath)
        return null
    }
}

export const deleteFromCloudinary = async (public_id) => {
    if (!public_id) return null
    
    try {
        const result = await cloudinary.uploader.destroy(public_id, {
            timeout: 30000
        })
        return result
    } catch (error) {
        console.error("Cloudinary delete error:", error.message)
        return null
    }
}
