import express from "express";
import { adminLogin, listAchievements, verifyAchievement, toggleHighlight, adminDeleteAchievement, manualAdjustPoints, analytics, analyzeCertificate, getDashboardStats, getAllStudents, getStudentById, testEmail, validateCertificate, getAllERPs, getERPById, verifyERP, exportStudentsZIP } from "../controllers/admin.controller.js";
import authAdmin from "../middlewares/authAdmin.js";

const router = express.Router();

console.log("📌 Admin routes loaded");

router.post("/login", adminLogin);

// protected
router.use(authAdmin);
router.get("/achievements", listAchievements);
router.put("/achievements/:id/verify", verifyAchievement);
router.put("/achievements/:id/highlight", toggleHighlight);
router.delete("/achievements/:id", adminDeleteAchievement);
router.put("/users/:studentId/points", manualAdjustPoints);
router.get("/analytics", analytics);
router.get("/dashboard-stats", getDashboardStats);
router.get("/students", getAllStudents);
router.get("/students/:studentId", getStudentById);
router.post("/students/export-zip", exportStudentsZIP);
router.get("/erps", getAllERPs);
router.get("/erps/:erpId", getERPById);
router.put("/erps/:erpId/verify", verifyERP);
router.post("/analyze-certificate", analyzeCertificate);
router.post("/achievements/:id/validate-certificate", validateCertificate);
router.post("/test-email", testEmail);
router.get("/test-ai", (req, res) => {
  res.json({ message: "AI endpoint is working!", timestamp: new Date() });
});

export default router;
