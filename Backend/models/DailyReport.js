import mongoose from 'mongoose';

const dailyReportSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    hoursWorked: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Approved', 'Rejected'],
      default: 'Submitted',
    },
    reviewedBy: {
      type: String,
      ref: 'User',
    },
    reviewDate: {
      type: Date,
    },
    feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
dailyReportSchema.index({ employeeId: 1, date: -1 });

const DailyReport = mongoose.model('DailyReport', dailyReportSchema);

export default DailyReport;
