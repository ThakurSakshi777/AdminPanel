import express from "express";
import {
  registerHR,
  loginHR,
  getPendingHRRegistrations,
  approveHRRegistration,
  rejectHRRegistration,
  getApprovedHRs,
} from "../controllers/hrAuthController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/signup", registerHR);
router.post("/login", loginHR);

// Protected Routes (Admin only - to be added later)
router.get("/pending", verifyToken, getPendingHRRegistrations);
router.get("/approved", verifyToken, getApprovedHRs);
router.post("/approve/:hrId", verifyToken, approveHRRegistration);
router.post("/reject/:hrId", verifyToken, rejectHRRegistration);

export default router;
