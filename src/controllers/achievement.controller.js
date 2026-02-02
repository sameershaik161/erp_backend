import Achievement from "../models/Achievement.js";
import User from "../models/User.js";
import { calculateAchievementPoints, addPoints } from "../services/points.service.js";
import { suspiciousActivityDetector } from "../services/suspiciousActivityDetection.js";
import { validateProofFiles, cleanupFileReferences } from "../utils/fileUtils.js";

export async function addAchievement(req, res) {
  try {
    console.log("Received body:", req.body);
    const { title, achievementType, description, category, subCategory, dateOfIssue, organizedInstitute, level, award } = req.body;
    
    // Validate required fields
    if (!title || !achievementType || !category || !dateOfIssue || !organizedInstitute || !level) {
      console.log("Missing fields check:", { title, achievementType, category, dateOfIssue, organizedInstitute, level });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate that non-technical category has a sub-category
    if (category === "Non-technical" && !subCategory) {
      return res.status(400).json({ message: "Sub-category is required for non-technical achievements" });
    }

    // Validate that competition type has an award
    if (achievementType === "Competition" && !award) {
      return res.status(400).json({ message: "Award is required for competition achievements" });
    }

    // Map files to local paths instead of S3 URLs
    const proofFiles = (req.files || []).map(f => `/uploads/${f.filename}`);
    const links = { leetcode: req.body.leetcode || "", linkedin: req.body.linkedin || "", codechef: req.body.codechef || "" };

    const achievementData = {
      student: req.user._id,
      title,
      achievementType,
      description,
      category,
      dateOfIssue,
      organizedInstitute,
      level,
      proofFiles,
      links
    };

    // Add subCategory only if it's a non-technical achievement
    if (category === "Non-technical") {
      achievementData.subCategory = subCategory;
    }

    // Add award only if it's a competition
    if (achievementType === "Competition") {
      achievementData.award = award;
    }

    // Note: Points are not awarded here, only when admin approves the achievement
    const ach = await Achievement.create(achievementData);

    // Run suspicious activity detection
    console.log('🕵️ Running suspicious activity detection...');
    const suspiciousAnalysis = await suspiciousActivityDetector.analyzeSubmissionPattern(
      req.user._id,
      achievementData
    );
    
    // Store suspicious activity results
    if (suspiciousAnalysis.isSuspicious || suspiciousAnalysis.requiresReview) {
      ach.suspiciousActivity = suspiciousAnalysis;
      await ach.save();
      console.log('⚠️ Suspicious activity detected for achievement:', ach._id, {
        riskScore: suspiciousAnalysis.riskScore,
        patterns: suspiciousAnalysis.suspiciousPatterns.map(p => p.type)
      });
    }

    await User.findByIdAndUpdate(req.user._id, { $push: { achievements: ach._id } });
    
    const response = { 
      message: "Achievement submitted successfully for review", 
      achievement: ach 
    };
    
    // Include warning if suspicious
    if (suspiciousAnalysis.isSuspicious) {
      response.warning = "Submission flagged for additional review due to suspicious patterns";
    }
    
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function myAchievements(req, res) {
  try {
    const items = await Achievement.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getAchievement(req, res) {
  try {
    const a = await Achievement.findById(req.params.id).populate("student", "name rollNumber section");
    if (!a) return res.status(404).json({ message: "Not found" });
    res.json(a);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteAchievement(req, res) {
  try {
    const ach = await Achievement.findById(req.params.id);
    if (!ach) return res.status(404).json({ message: "Not found" });
    if (!ach.student.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });
    await Achievement.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user._id, { $pull: { achievements: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Admin functions
export async function getAllAchievements(req, res) {
  try {
    const { status, student } = req.query;
    const query = {};
    if (status) query.status = status;
    if (student) query.student = student;
    
    const achievements = await Achievement.find(query)
      .populate("student", "name rollNumber email section year")
      .sort({ createdAt: -1 });
    
    // Add file validation status to each achievement
    const achievementsWithFileStatus = achievements.map(achievement => {
      const achievementObj = achievement.toObject();
      const fileValidation = validateProofFiles(achievementObj.proofFiles);
      achievementObj.fileValidation = fileValidation;
      return achievementObj;
    });
      
    res.json(achievementsWithFileStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function approveAchievement(req, res) {
  try {
    const { id } = req.params;
    const { adminNote, customPoints } = req.body;
    
    const achievement = await Achievement.findById(id);
    if (!achievement) return res.status(404).json({ message: "Achievement not found" });
    
    // Calculate points based on achievement type, level, and award
    let calculatedPoints;
    if (customPoints !== undefined && customPoints !== null) {
      // Admin can override with custom points
      calculatedPoints = Number(customPoints);
    } else {
      // Auto-calculate based on type, level, and award
      calculatedPoints = calculateAchievementPoints(
        achievement.achievementType,
        achievement.level,
        achievement.award
      );
    }
    
    achievement.status = "approved";
    achievement.points = calculatedPoints;
    if (adminNote) achievement.adminNote = adminNote;
    
    await achievement.save();
    
    // Add points to user using the points service
    if (calculatedPoints > 0) {
      await addPoints(achievement.student.toString(), calculatedPoints);
    }
    
    res.json({ 
      message: "Achievement approved and points awarded", 
      achievement,
      pointsAwarded: calculatedPoints
    });
  } catch (err) {
    console.error("Error approving achievement:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function rejectAchievement(req, res) {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    
    const achievement = await Achievement.findById(id);
    if (!achievement) return res.status(404).json({ message: "Achievement not found" });
    
    achievement.status = "rejected";
    if (adminNote) achievement.adminNote = adminNote;
    
    await achievement.save();
    res.json({ message: "Achievement rejected", achievement });
  } catch (err) {
    console.error("Error rejecting achievement:", err);
    res.status(500).json({ message: err.message });
  }
}

// Utility function to fix broken file references (Admin only)
export async function cleanupBrokenFiles(req, res) {
  try {
    const achievements = await Achievement.find({});
    let cleanedCount = 0;
    
    for (const achievement of achievements) {
      const originalCount = achievement.proofFiles.length;
      const cleanedFiles = cleanupFileReferences(achievement.proofFiles);
      
      if (cleanedFiles.length !== originalCount) {
        achievement.proofFiles = cleanedFiles;
        await achievement.save();
        cleanedCount++;
      }
    }
    
    res.json({
      message: `Cleaned up broken file references in ${cleanedCount} achievements`,
      totalAchievements: achievements.length,
      cleanedAchievements: cleanedCount
    });
  } catch (err) {
    console.error("Error cleaning up broken files:", err);
    res.status(500).json({ message: err.message });
  }
}
