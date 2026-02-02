import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import achievementRoutes from "./routes/achievement.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import erpRoutes from "./routes/erp.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import fileRoutes from "./routes/file.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// parse JSON bodies
app.use(express.json({ limit: '50mb' }));
// allow form-data (multer handles files)
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration for AWS deployment
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL,
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check against whitelist
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.amazonaws.com')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({ 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Allow content from any source for development
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Serve uploaded files statically with fallback
// In production (Vercel), serve from /tmp/uploads
// In development, serve from local uploads directory
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const uploadsPath = isProduction ? '/tmp/uploads' : path.join(__dirname, "../uploads");

// Create uploads directory if it doesn't exist
import fs from "fs";
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Serve static files with error handling
app.use("/uploads", express.static(uploadsPath, {
  // Add error handling for missing files
  fallthrough: true,
  // Set cache headers
  maxAge: '1d'
}));

app.use("/api/auth", authRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/erp", erpRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/activities", activityRoutes);
app.use("/uploads", fileRoutes);

// Health check endpoint for AWS
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get("/", (req, res) => res.json({ 
  ok: true, 
  message: "Student ERP Portal API",
  version: "1.0.0"
}));

// error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

export default app;
