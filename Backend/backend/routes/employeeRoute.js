import express from "express";
import { getApprovedEmployees } from "../controllers/userController.js";
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all approved employees (same as /api/users/approved-employees)
router.get("/", verifyToken, getApprovedEmployees);

export default router;
