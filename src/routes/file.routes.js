import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import authAdmin from "../middlewares/authAdmin.js";
import authStudent from "../middlewares/authStudent.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Middleware to check if user is admin or student (supports both header and query token)
const authUser = async (req, res, next) => {
  try {
    // Try to get token from header or query parameter
    let token = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Try admin token first
    try {
      const adminPayload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
      const admin = await Admin.findById(adminPayload.id);
      if (admin) {
        req.admin = admin;
        return next();
      }
    } catch (adminErr) {
      // Not an admin token, try student token
      try {
        const studentPayload = jwt.verify(token, process.env.JWT_SECRET);
        const student = await User.findById(studentPayload.id);
        if (student) {
          req.student = student;
          return next();
        }
      } catch (studentErr) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
    }
    
    return res.status(401).json({ message: "User not found" });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Serve files with proper authentication and error handling
router.get("/:filename", authUser, (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Validate filename (prevent directory traversal attacks)
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ message: "Invalid filename" });
    }
    
    // Determine the correct uploads path
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
    const uploadsPath = isProduction ? '/tmp/uploads' : path.join(__dirname, "../../uploads");
    const filePath = path.join(uploadsPath, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return res.status(404).json({ 
        message: "File not found",
        filename: filename,
        uploadPath: uploadsPath 
      });
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    const fileExtension = path.extname(filename).toLowerCase();
    
    // Set appropriate content type
    let contentType = 'application/octet-stream';
    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
    }
    
    // Set headers
    res.set({
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    });
    
    // For PDF files, set disposition to inline so they open in browser
    if (fileExtension === '.pdf') {
      res.set('Content-Disposition', `inline; filename="${filename}"`);
    }
    
    // Stream the file
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    
    stream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error serving file" });
      }
    });
    
  } catch (error) {
    console.error('Error in file serving:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Debug route to list available files (admin only)
router.get("/debug/list", authAdmin, (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
    const uploadsPath = isProduction ? '/tmp/uploads' : path.join(__dirname, "../../uploads");
    
    if (!fs.existsSync(uploadsPath)) {
      return res.json({ 
        message: "Uploads directory does not exist",
        path: uploadsPath,
        files: []
      });
    }
    
    const files = fs.readdirSync(uploadsPath).map(filename => {
      const filePath = path.join(uploadsPath, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });
    
    res.json({
      path: uploadsPath,
      totalFiles: files.length,
      files: files
    });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
