import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      enum: ['Attendance', 'Performance', 'Leave', 'Employee', 'Project', 'Payroll'],
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateFrom: {
      type: Date,
      required: true,
    },
    dateTo: {
      type: Date,
      required: true,
    },
    department: {
      type: String,
      enum: ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'],
    },
    employeeId: {
      type: String,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    summary: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
