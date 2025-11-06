import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cloudinary Configuration for File Storage
 * Used for storing question media, reports, and assets
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Path to file to upload
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<object>} Upload result
 */
export const uploadToCloudinary = async (filePath, folder = 'ai-assessment') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('File upload failed');
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @returns {Promise<object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error('File deletion failed');
  }
};

export default cloudinary;
