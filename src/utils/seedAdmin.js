import dotenv from "dotenv";
dotenv.config();
import connectDB from "../../config/db.js";
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    await connectDB();
    const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      console.error("Set ADMIN_USERNAME and ADMIN_PASSWORD in .env");
      process.exit(1);
    }
    const existing = await Admin.findOne({ username: ADMIN_USERNAME });
    if (existing) {
      console.log("Admin exists");
      process.exit(0);
    }
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const admin = await Admin.create({ username: ADMIN_USERNAME, passwordHash: hash });
    console.log("Admin created:", admin.username);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
