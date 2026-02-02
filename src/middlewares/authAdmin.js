import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export default async function authAdmin(req, res, next) {
  try {
    console.log(`🔐 AuthAdmin middleware - ${req.method} ${req.path}`);
    const header = req.headers.authorization;
    if (!header) {
      console.log("❌ No authorization header");
      return res.status(401).json({ message: "No admin token" });
    }
    const token = header.split(" ")[1];
    console.log("🎫 Token received, verifying...");
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    console.log("✅ Token verified, payload:", payload.id);
    const admin = await Admin.findById(payload.id);
    if (!admin) {
      console.log("❌ Admin not found in database");
      return res.status(401).json({ message: "Admin not found" });
    }
    console.log(`✅ Admin authenticated: ${admin.username}`);
    req.admin = admin;
    next();
  } catch (err) {
    console.log("❌ Auth error:", err.message);
    return res.status(401).json({ message: "Admin unauthorized", error: err.message });
  }
}
