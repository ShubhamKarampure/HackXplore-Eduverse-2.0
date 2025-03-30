import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Use CLOUDINARY_URL from environment variables instead of individual keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file to Cloudinary
 * @param {string} localFilePath - Path of the file to upload
 * @returns {object} { url, public_id } on success, or null on failure
 */
export const uploadOnCloud = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // Remove temp file only after successful upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return { url: response.secure_url, public_id: response.public_id };
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);

        // Clean up local file on error
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null; // Return null to indicate failure
    }
};

/**
 * Deletes a file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @returns {object} Success or error message
 */
export const deleteFromCloud = async (publicId) => {
    try {
        if (!publicId) return { success: false, message: "Missing public ID" };

        const response = await cloudinary.uploader.destroy(publicId);

        if (response.result === "ok") {
            return { success: true, message: "File deleted successfully" };
        } else {
            return { success: false, message: `Failed to delete file: ${response.result}` };
        }
    } catch (error) {
        console.error("Cloudinary Deletion Error:", error);
        return { success: false, message: "Internal server error" };
    }
};