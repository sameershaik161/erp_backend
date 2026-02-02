import express from "express";
import authStudent from "../middlewares/authStudent.js";
import authAdmin from "../middlewares/authAdmin.js";
import upload from "../middlewares/multerS3Upload.js";
import { 
  addAchievement, 
  myAchievements, 
  getAchievement, 
  deleteAchievement,
  getAllAchievements,
  approveAchievement,
  rejectAchievement,
  cleanupBrokenFiles
} from "../controllers/achievement.controller.js";

const router = express.Router();

// Student routes
router.post("/add", authStudent, upload.array("proofFiles", 5), addAchievement);
router.get("/me", authStudent, myAchievements);
router.get("/:id", authStudent, getAchievement);
router.delete("/:id", authStudent, deleteAchievement);

// Admin routes
router.get("/admin/all", authAdmin, getAllAchievements);
router.put("/admin/:id/approve", authAdmin, approveAchievement);
router.put("/admin/:id/reject", authAdmin, rejectAchievement);
router.post("/admin/cleanup-files", authAdmin, cleanupBrokenFiles);

export default router;
