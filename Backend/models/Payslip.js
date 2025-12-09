import mongoose from 'mongoose';

const payslipSchema = new mongoose.Schema(
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
    designation: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    joiningDate: {
      type: Date,
      default: null,
    },
    bankName: {
      type: String,
      default: '',
    },
    bankAccountNumber: {
      type: String,
      default: '',
    },
    panNumber: {
      type: String,
      default: '',
    },
    uan: {
      type: String,
      default: '',
    },
    pfNumber: {
      type: String,
      default: '',
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    salaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salary',
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    allowances: {
      HRA: {
        type: Number,
        default: 0,
      },
      DA: {
        type: Number,
        default: 0,
      },
      TA: {
        type: Number,
        default: 0,
      },
      medical: {
        type: Number,
        default: 0,
      },
      other: {
        type: Number,
        default: 0,
      },
    },
    deductions: {
      PF: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
      insurance: {
        type: Number,
        default: 0,
      },
      other: {
        type: Number,
        default: 0,
      },
    },
    grossSalary: {
      type: Number,
      required: true,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    workingDays: {
      type: Number,
      required: true,
    },
    presentDays: {
      type: Number,
      required: true,
    },
    leaveDays: {
      type: Number,
      default: 0,
    },
    halfDays: {
      type: Number,
      default: 0,
    },
    paidDays: {
      type: Number,
      required: true,
    },
    finalSalary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Generated', 'Paid'],
      default: 'Generated',
    },
    generatedDate: {
      type: Date,
      default: Date.now,
    },
    paidDate: {
      type: Date,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    generatedByName: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: One payslip per employee per month/year
payslipSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
payslipSchema.index({ employeeId: 1 });
payslipSchema.index({ status: 1 });
payslipSchema.index({ month: 1, year: 1 });

const Payslip = mongoose.model('Payslip', payslipSchema);

export default Payslip;
