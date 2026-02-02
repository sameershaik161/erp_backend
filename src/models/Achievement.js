import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  achievementType: { type: String, required: true, enum: ["Certification", "Competition"] },
  description: { type: String },
  category: { type: String, required: true, enum: ["Technical", "Non-technical"] },
  subCategory: { type: String }, // For non-technical: Co-curricular, Extra-curricular
  dateOfIssue: { type: Date, required: true },
  organizedInstitute: { type: String, required: true },
  level: { type: String, required: true, enum: ["Department", "College", "District", "State", "National", "International"] },
  award: { type: String, enum: ["1", "2", "3", "runner", "participation"] }, // Only required for competitions
  proofFiles: [{ type: String }], // S3 urls
  links: { leetcode: String, linkedin: String, codechef: String },
  // Additional verification information
  verificationInfo: {
    certificateUrl: String,
    issuerWebsite: String,
    certificateNumber: String,
    issuerContact: String,
    verificationCode: String,
    courseDuration: String,
    completionDate: Date
  },
  status: { type: String, enum: ["pending","approved","rejected"], default: "pending" },
  points: { type: Number, default: 0 },
  highlighted: { type: Boolean, default: false },
  adminNote: String,
  // Certificate Validation Fields
  validationResult: {
    isValid: Boolean,
    trustScore: Number,
    aiAnalysis: Object,
    verificationChecks: Object,
    recommendations: [String],
    flags: [String],
    timestamp: Date
  },
  lastValidated: Date,
  // Suspicious Activity Detection
  suspiciousActivity: {
    riskScore: Number,
    isSuspicious: Boolean,
    requiresReview: Boolean,
    suspiciousPatterns: [Object],
    warningFlags: [String],
    recommendations: [String],
    analysisDate: Date
  },
  // Legacy fields for backward compatibility
  date: { type: Date }, // Keep for existing data
}, { timestamps: true });

export default mongoose.model("Achievement", achievementSchema);
