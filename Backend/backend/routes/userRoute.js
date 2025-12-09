import express from "express";
import {
  getAllUsers,
  getUserByToken,
  updateUser,
  deleteUser,
  forgetPassword,
  verifyResetToken,
  updatePassword,
  getPendingEmployees,
  approveEmployee,
  rejectEmployee,
  getApprovedEmployees
} from "../controllers/userController.js";
import { verifyToken } from '../middlewares/authMiddleware.js';
// import { protect } from "../middlewares/userMiddleware.js";

const router = express.Router();

// ⚠️ IMPORTANT: Specific routes MUST come BEFORE generic routes!

// Special routes that don't need :id
router.get("/user", verifyToken, getUserByToken);
router.get("/pending-approvals", verifyToken, getPendingEmployees);
router.get("/approved-employees", verifyToken, getApprovedEmployees);

// Password Reset Routes
router.post("/forget-password", forgetPassword);
router.post("/reset-password", verifyResetToken);
router.post("/update-password", updatePassword);

// Approval Routes
router.post("/approve/:employeeId", verifyToken, approveEmployee);
router.post("/reject/:employeeId", verifyToken, rejectEmployee);

// Generic CRUD routes (MUST be last to avoid shadowing specific routes)
router.get("/", getAllUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;

