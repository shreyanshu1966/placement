import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Local File Storage Configuration
 * Saves files to local uploads directory
 */

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const uploadsPath = path.join(__dirname, '..', uploadDir);

// Create subdirectories
const directories = [
  'questions',
  'profiles',
  'reports',
  'resources'
];

directories.forEach(dir => {
  const dirPath = path.join(uploadsPath, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

/**
 * Upload file to local storage
 * @param {Buffer|string} file - File buffer or path
 * @param {string} folder - Folder name (questions, profiles, reports, resources)
 * @param {string} filename - File name
 * @returns {Promise<object>} Upload result
 */
export const uploadToLocal = async (file, folder = 'resources', filename) => {
  try {
    const folderPath = path.join(uploadsPath, folder);
    const timestamp = Date.now();
    const finalFilename = filename || `file_${timestamp}`;
    const filePath = path.join(folderPath, finalFilename);
    
    // If file is a buffer, write it directly
    if (Buffer.isBuffer(file)) {
      fs.writeFileSync(filePath, file);
    } 
    // If file is a path, copy it
    else if (typeof file === 'string' && fs.existsSync(file)) {
      fs.copyFileSync(file, filePath);
    }
    
    // Return relative URL
    const url = `/uploads/${folder}/${finalFilename}`;
    
    return {
      url: url,
      path: filePath,
      filename: finalFilename,
      folder: folder
    };
  } catch (error) {
    console.error('Local storage upload error:', error);
    throw new Error('File upload failed');
  }
};

/**
 * Delete file from local storage
 * @param {string} filePath - Relative or absolute file path
 * @returns {Promise<boolean>} Deletion result
 */
export const deleteFromLocal = async (filePath) => {
  try {
    let absolutePath = filePath;
    
    // If relative path (starts with /uploads), convert to absolute
    if (filePath.startsWith('/uploads')) {
      absolutePath = path.join(__dirname, '..', filePath);
    }
    
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Local storage deletion error:', error);
    throw new Error('File deletion failed');
  }
};

/**
 * Get file URL
 * @param {string} folder - Folder name
 * @param {string} filename - File name
 * @returns {string} File URL
 */
export const getFileUrl = (folder, filename) => {
  return `/uploads/${folder}/${filename}`;
};

console.log('✅ Local file storage configured');
console.log(`📁 Upload directory: ${uploadsPath}`);

export default {
  uploadToLocal,
  deleteFromLocal,
  getFileUrl,
  uploadsPath
};
