import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['Sick Leave', 'Casual Leave', 'Paid Leave', 'Unpaid Leave', 'Emergency Leave', 'Other'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedByName: {
      type: String,
    },
    approvedDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    rejectedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total days before saving
leaveSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date
    this.totalDays = diffDays;
  }
  next();
});

// Index for faster queries
leaveSchema.index({ userId: 1, appliedDate: -1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
