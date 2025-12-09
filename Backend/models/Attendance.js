import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'On Leave', 'Half Day', 'Late'],
      default: 'Absent',
    },
    workingHours: {
      type: Number,
      default: 0, // in hours
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
attendanceSchema.index({ userId: 1, date: 1 });
attendanceSchema.index({ date: 1 });

// Method to calculate working hours
attendanceSchema.methods.calculateWorkingHours = function () {
  if (this.checkInTime && this.checkOutTime) {
    const diff = this.checkOutTime - this.checkInTime;
    this.workingHours = (diff / (1000 * 60 * 60)).toFixed(2); // Convert to hours
    return this.workingHours;
  }
  return 0;
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
