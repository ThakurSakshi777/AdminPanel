import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema(
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
    basicSalary: {
      type: Number,
      required: [true, 'Basic salary is required'],
      min: 0,
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
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    effectiveFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByName: {
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

// Calculate gross and net salary before saving
salarySchema.pre('save', function (next) {
  // Calculate total allowances
  const totalAllowances =
    (this.allowances.HRA || 0) +
    (this.allowances.DA || 0) +
    (this.allowances.TA || 0) +
    (this.allowances.medical || 0) +
    (this.allowances.other || 0);

  // Calculate gross salary
  this.grossSalary = this.basicSalary + totalAllowances;

  // Calculate total deductions
  const totalDeductions =
    (this.deductions.PF || 0) +
    (this.deductions.tax || 0) +
    (this.deductions.insurance || 0) +
    (this.deductions.other || 0);

  // Calculate net salary
  this.netSalary = this.grossSalary - totalDeductions;

  next();
});

// Index for faster queries
salarySchema.index({ userId: 1, isActive: 1 });
salarySchema.index({ employeeId: 1 });
salarySchema.index({ effectiveFrom: -1 });

const Salary = mongoose.model('Salary', salarySchema);

export default Salary;
