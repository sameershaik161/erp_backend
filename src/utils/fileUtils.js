import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the uploads directory path based on environment
 */
export function getUploadsPath() {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
  return isProduction ? '/tmp/uploads' : path.join(__dirname, "../../uploads");
}

/**
 * Check if a file exists in the uploads directory
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if file exists, false otherwise
 */
export function fileExists(filename) {
  if (!filename) return false;
  
  // Extract filename from path if it's a full path
  const baseFilename = path.basename(filename.replace('/uploads/', ''));
  const uploadsPath = getUploadsPath();
  const filePath = path.join(uploadsPath, baseFilename);
  
  return fs.existsSync(filePath);
}

/**
 * Get file information
 * @param {string} filename - The filename to get info for
 * @returns {object|null} - File stats or null if file doesn't exist
 */
export function getFileInfo(filename) {
  if (!fileExists(filename)) return null;
  
  const baseFilename = path.basename(filename.replace('/uploads/', ''));
  const uploadsPath = getUploadsPath();
  const filePath = path.join(uploadsPath, baseFilename);
  
  try {
    const stats = fs.statSync(filePath);
    return {
      filename: baseFilename,
      path: filePath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      exists: true
    };
  } catch (error) {
    return null;
  }
}

/**
 * Validate all proof files for an achievement
 * @param {Array} proofFiles - Array of file paths
 * @returns {object} - Validation results
 */
export function validateProofFiles(proofFiles) {
  if (!Array.isArray(proofFiles)) {
    return { valid: false, missingFiles: [], existingFiles: [] };
  }
  
  const existingFiles = [];
  const missingFiles = [];
  
  proofFiles.forEach(filePath => {
    if (fileExists(filePath)) {
      existingFiles.push(filePath);
    } else {
      missingFiles.push(filePath);
    }
  });
  
  return {
    valid: missingFiles.length === 0,
    existingFiles,
    missingFiles,
    totalFiles: proofFiles.length
  };
}

/**
 * Clean up broken file references in database
 * @param {Array} proofFiles - Array of file paths to clean
 * @returns {Array} - Array of valid file paths
 */
export function cleanupFileReferences(proofFiles) {
  if (!Array.isArray(proofFiles)) return [];
  
  return proofFiles.filter(filePath => fileExists(filePath));
}

/**
 * List all files in uploads directory
 * @returns {Array} - Array of file information
 */
export function listUploadedFiles() {
  const uploadsPath = getUploadsPath();
  
  if (!fs.existsSync(uploadsPath)) {
    return [];
  }
  
  try {
    return fs.readdirSync(uploadsPath).map(filename => {
      const filePath = path.join(uploadsPath, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/${filename}`
      };
    });
  } catch (error) {
    console.error('Error listing uploaded files:', error);
    return [];
  }
}