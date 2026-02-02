import express from "express";
import { getRecentActivities } from "../controllers/activity.controller.js";
import authStudent from "../middlewares/authStudent.js";

const router = express.Router();

router.get("/recent", authStudent, getRecentActivities);

export default router;
