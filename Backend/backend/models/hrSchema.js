import mongoose from "mongoose";

const hrSchema = new mongoose.Schema(
  {
    // Reference to the main User model
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // HR Personal Information
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String, default: "" },
    
    // HR Department Info
    department: { type: String, default: "Human Resources" },
    designation: { type: String, default: "HR Manager" },
    employeeId: { type: String, unique: true, sparse: true },
    joinDate: { type: Date, default: new Date() },
    
    // HR Specific Fields
    reportingTo: { type: String, default: "" }, // Name of their manager
    hrLevel: {
      type: String,
      enum: ["junior", "senior", "manager", "director"],
      default: "manager",
    },
    
    // Responsibilities
    responsibilities: [String],
    
    // Approval Status
    isApproved: { type: Boolean, default: false },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },

    // Contact & Office Info
    officeLocation: { type: String, default: "" },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pinCode: { type: String, default: "" },
    },

    // Activity Tracking
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    lastLogout: { type: Date, default: null },

    // Bank Details (optional)
    bankAccountNumber: { type: String, default: "" },
    bankIfscCode: { type: String, default: "" },
    panNumber: { type: String, default: "" },

    // Documents
    documents: [
      {
        type: String,
        name: String,
        url: String,
        uploadedAt: { type: Date, default: new Date() },
      },
    ],

    // Additional Notes
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("HR", hrSchema);
