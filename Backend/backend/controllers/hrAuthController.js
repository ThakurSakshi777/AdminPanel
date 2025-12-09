import HR from "../models/hrSchema.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Session from "../models/sessionSchema.js";

dotenv.config();

// ==========================
// HR Signup/Registration
// ==========================
export const registerHR = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      alternatePhone,
      password,
      designation,
      department,
      hrLevel,
      officeLocation,
      address,
      reportingTo,
    } = req.body;

    // Validation
    if (!fullName || !email || !phone || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All required fields must be provided" });
    }

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Check if email already exists in HR collection
    const existingHR = await HR.findOne({ email });
    if (existingHR) {
      return res
        .status(400)
        .json({ success: false, message: "HR email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User record first
    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: "hr",
      isApproved: true, // ✅ Auto-approve HR accounts
      approvedAt: new Date(), // ✅ Set approval time immediately
    });
    await newUser.save();

    // Generate Employee ID for HR - Count ALL HRs (not just approved ones)
    const count = await HR.countDocuments(); // Count ALL HRs, not just approved
    const employeeId = `HR${String(count + 1).padStart(4, "0")}`;

    // Create HR record - Auto-approve since HR is admin in this project
    const newHR = new HR({
      userId: newUser._id,
      fullName,
      email,
      phone,
      alternatePhone: alternatePhone || "",
      designation: designation || "HR Manager",
      department: department || "Human Resources",
      hrLevel: hrLevel || "manager",
      officeLocation: officeLocation || "",
      address: address || {},
      reportingTo: reportingTo || "",
      employeeId,
      isApproved: true, // ✅ Auto-approve
      approvedAt: new Date(), // ✅ Set approval time
    });
    await newHR.save();

    res.status(201).json({
      success: true,
      message:
        "HR registration successful! You can now login with your credentials.",
      hr: {
        id: newHR._id,
        fullName: newHR.fullName,
        email: newHR.email,
        phone: newHR.phone,
        designation: newHR.designation,
      },
    });
  } catch (error) {
    console.error("HR Signup Error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        message: `${field} already exists. Please use a different ${field}.`,
        error: error.message 
      });
    }
    
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// HR Login
// ==========================
export const loginHR = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user with role 'hr'
    const user = await User.findOne({ email, role: "hr" });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Check if HR is approved
    const hrDetails = await HR.findOne({ userId: user._id });
    if (!hrDetails) {
      return res
        .status(401)
        .json({ success: false, message: "HR record not found" });
    }

    if (!hrDetails.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your HR account is pending approval. Please contact admin.",
        reason: hrDetails.rejectionReason || "Awaiting admin approval",
      });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: "hr" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Create session record
    const session = new Session({
      userId: user._id,
      userRole: "hr",
      device: req.headers["user-agent"],
      ip: req.ip || req.connection.remoteAddress,
      token: token,
      loginTime: new Date(),
    });
    await session.save();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    hrDetails.lastLogin = new Date();
    await hrDetails.save();

    res.status(200).json({
      success: true,
      message: "HR login successful",
      token,
      sessionId: session._id,
      hr: {
        id: user._id,
        fullName: hrDetails.fullName,
        email: hrDetails.email,
        phone: hrDetails.phone,
        designation: hrDetails.designation,
        department: hrDetails.department,
        hrLevel: hrDetails.hrLevel,
        employeeId: hrDetails.employeeId,
        officeLocation: hrDetails.officeLocation,
      },
    });
  } catch (error) {
    console.error("HR Login Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Get Pending HR Registrations (for Admin)
// ==========================
export const getPendingHRRegistrations = async (req, res) => {
  try {
    const pendingHRs = await HR.find({ isApproved: false })
      .select("-password")
      .populate("userId", "email phone");

    res.status(200).json({
      success: true,
      count: pendingHRs.length,
      pendingHRs,
    });
  } catch (error) {
    console.error("Get Pending HRs Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Approve HR Registration (Admin Only)
// ==========================
export const approveHRRegistration = async (req, res) => {
  try {
    const { hrId } = req.params;
    const adminId = req.user?.id; // From auth middleware

    // Find HR record
    const hr = await HR.findById(hrId);
    if (!hr) {
      return res
        .status(404)
        .json({ success: false, message: "HR record not found" });
    }

    // Update HR approval status
    hr.isApproved = true;
    hr.approvedBy = adminId;
    hr.approvedAt = new Date();
    await hr.save();

    // Update User approval status
    const user = await User.findById(hr.userId);
    user.isApproved = true;
    user.approvedBy = adminId;
    user.approvedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: `HR ${hr.fullName} approved successfully`,
      hr: {
        id: hr._id,
        fullName: hr.fullName,
        email: hr.email,
        designation: hr.designation,
        approvedAt: hr.approvedAt,
      },
    });
  } catch (error) {
    console.error("Approve HR Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Reject HR Registration (Admin Only)
// ==========================
export const rejectHRRegistration = async (req, res) => {
  try {
    const { hrId } = req.params;
    const { reason } = req.body;

    // Find HR record
    const hr = await HR.findById(hrId);
    if (!hr) {
      return res
        .status(404)
        .json({ success: false, message: "HR record not found" });
    }

    // Mark as rejected
    hr.isApproved = false;
    hr.rejectionReason = reason || "Rejected by admin";
    await hr.save();

    // Delete the corresponding User record
    await User.findByIdAndDelete(hr.userId);

    res.status(200).json({
      success: true,
      message: `HR ${hr.fullName} registration rejected`,
      hr: {
        id: hr._id,
        fullName: hr.fullName,
        email: hr.email,
        rejectionReason: hr.rejectionReason,
      },
    });
  } catch (error) {
    console.error("Reject HR Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Get All Approved HRs
// ==========================
export const getApprovedHRs = async (req, res) => {
  try {
    const approvedHRs = await HR.find({ isApproved: true })
      .select("-password")
      .populate("userId", "email phone lastLogin");

    res.status(200).json({
      success: true,
      count: approvedHRs.length,
      hrs: approvedHRs,
    });
  } catch (error) {
    console.error("Get Approved HRs Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
