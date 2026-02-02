import mongoose from "mongoose";

const socialSchema = new mongoose.Schema({
  leetcode: String,
  linkedin: String,
  codechef: String,
  github: String,
  portfolio: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address']
  },
  passwordHash: { type: String, required: true },
  department: { 
    type: String, 
    enum: ["CSE", "ECE", "Civil", "EEE", "Mechanical", "IT", "Chemical", "Biotech"],
    required: true 
  },
  section: {
    type: String,
    enum: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S"],
    required: true
  },
  year: { type: String, enum: ["I","II","III","IV"], required: true },
  
  // Academic Year Information
  admissionYear: { type: Number, required: true }, // e.g., 2023
  graduationYear: { type: Number, required: true }, // e.g., 2027
  academicBatch: { type: String, required: true }, // e.g., "2023-2027"
  
  profilePicUrl: { type: String, default: "" },
  bannerUrl: { type: String, default: "" },
  resumeUrl: { type: String, default: "" },
  socialLinks: socialSchema,
  totalPoints: { type: Number, default: 0 },
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Achievement" }],
}, { timestamps: true });

export default mongoose.model("User", userSchema);
