import express from "express";
import authStudent from "../middlewares/authStudent.js";
import authAdmin from "../middlewares/authAdmin.js";
import {
  createAnnouncement,
  getAllAnnouncementsAdmin,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
  incrementViewCount,
  getAnnouncementStats
} from "../controllers/announcement.controller.js";

const router = express.Router();

// Student routes
router.get("/active", authStudent, getActiveAnnouncements);
router.post("/:id/view", authStudent, incrementViewCount);

// Admin routes
router.post("/", authAdmin, createAnnouncement);
router.get("/admin/all", authAdmin, getAllAnnouncementsAdmin);
router.get("/admin/stats", authAdmin, getAnnouncementStats);
router.put("/:id", authAdmin, updateAnnouncement);
router.delete("/:id", authAdmin, deleteAnnouncement);

export default router;
