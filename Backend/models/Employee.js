import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['hr', 'employee', 'tl'],
      default: 'employee',
    },
    position: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    team: {
      type: String,
      default: '',
    },
    teamLeader: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    salary: {
      type: Number,
      default: 0,
    },
    joinDate: {
      type: Date,
      default: Date.now,
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
    // Personal Information Section
    fatherMotherName: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', ''],
      default: '',
    },
    currentAddress: {
      type: String,
      default: '',
    },
    permanentAddress: {
      type: String,
      default: '',
    },
    // Job-Related Information Section
    workLocation: {
      type: String,
      default: '',
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Intern', 'Contractual', 'Part-Time', ''],
      default: 'Full-time',
    },
    // Salary & Bank Information Section
    ifscCode: {
      type: String,
      default: '',
    },
    paymentMode: {
      type: String,
      enum: ['Bank Transfer', 'Cheque', 'Cash', ''],
      default: 'Bank Transfer',
    },
    basicSalary: {
      type: Number,
      default: 0,
    },
    ctc: {
      type: Number,
      default: 0,
    },
    // Government/Compliance IDs Section
    aadharNumber: {
      type: String,
      default: '',
    },
    esicNumber: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    documents: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        type: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
        fileName: String,
        filePath: String,
        fileSize: Number,
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-generate employeeId if not provided
employeeSchema.pre('save', async function (next) {
  if (!this.employeeId && this.isNew) {
    try {
      // Find the highest number in existing employeeIds
      const highestEmployee = await mongoose.model('Employee').findOne(
        { employeeId: /^EMP\d{7}$/ },
        { employeeId: 1 }
      ).sort({ employeeId: -1 });

      let nextNumber = 1;
      if (highestEmployee && highestEmployee.employeeId) {
        const lastNumber = parseInt(highestEmployee.employeeId.slice(3), 10);
        nextNumber = lastNumber + 1;
      }

      this.employeeId = `EMP${String(nextNumber).padStart(7, '0')}`;
    } catch (error) {
      console.error('Error generating employeeId:', error);
      next(error);
    }
  }
  next();
});

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

export default Employee;
