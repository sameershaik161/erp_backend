import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["academic", "career_opportunity"],
    required: true
  },
  // For career opportunities
  company: String,
  location: String,
  deadline: Date,
  eligibilityCriteria: String,
  applyLink: String,
  package: String,
  
  // For academic
  eventDate: Date,
  venue: String,
  
  // Common fields
  attachments: [String],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isPinned: { 
    type: Boolean, 
    default: false 
  },
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Admin",
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  targetYear: {
    type: Number, // 1, 2, 3, 4 or null for all
    default: null
  }
}, { timestamps: true });

// Index for faster queries
announcementSchema.index({ type: 1, isActive: 1, createdAt: -1 });
announcementSchema.index({ isPinned: -1, createdAt: -1 });

export default mongoose.model("Announcement", announcementSchema);
