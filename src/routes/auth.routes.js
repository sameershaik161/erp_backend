import express from "express";
import upload from "../middlewares/multerS3Upload.js";
import { register, login, me, uploadProfilePic, uploadBanner, uploadResume, getLeaderboard, getMyRank, updateProfile } from "../controllers/auth.controller.js";
import authStudent from "../middlewares/authStudent.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authStudent, me);
router.get("/leaderboard", authStudent, getLeaderboard);
router.get("/my-rank", authStudent, getMyRank);
router.put("/update-profile", authStudent, updateProfile);
router.post("/upload-profile", authStudent, upload.single("profilePic"), uploadProfilePic);
router.post("/upload-banner", authStudent, upload.single("banner"), uploadBanner);
router.post("/upload-resume", authStudent, upload.single("resume"), uploadResume);

export default router;
