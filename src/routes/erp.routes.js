import express from "express";
import authStudent from "../middlewares/authStudent.js";
import authAdmin from "../middlewares/authAdmin.js";
import upload from "../middlewares/multerS3Upload.js";
import { 
  getMyERP, 
  updateERP, 
  updatePersonalInfo,
  submitERP,
  getAllERPs,
  getStudentERP,
  verifyERP,
  updateERPPoints
} from "../controllers/erp.controller.js";

const router = express.Router();

// Student routes
router.get("/my-erp", authStudent, getMyERP);
router.put("/my-erp", authStudent, updateERP);
router.put("/personal-info", authStudent, upload.fields([
  { name: 'scholarshipProof', maxCount: 1 },
  { name: 'tenthProof', maxCount: 1 },
  { name: 'intermediateProof', maxCount: 1 }
]), updatePersonalInfo);
router.post("/my-erp/submit", authStudent, submitERP);

// Admin routes
router.get("/admin/all", authAdmin, getAllERPs);
router.get("/admin/student/:studentId", authAdmin, getStudentERP);
router.put("/admin/:id/verify", authAdmin, verifyERP);
router.put("/admin/:id/points", authAdmin, updateERPPoints);

export default router;
