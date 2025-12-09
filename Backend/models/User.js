import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [4, 'Password must be at least 4 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['hr', 'employee', 'tl'],
      default: 'employee',
      required: true,
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but unique if exists
    },
    department: {
      type: String,
      default: '',
    },
    position: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate employee ID automatically with proper uniqueness
userSchema.pre('save', async function (next) {
  if (!this.employeeId && this.isNew) {
    try {
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isUnique && attempts < maxAttempts) {
        // Get the highest existing employeeId number
        const lastUser = await mongoose.models.User.findOne({}, { employeeId: 1 })
          .sort({ employeeId: -1 })
          .limit(1);
        
        let nextNumber = 1;
        if (lastUser && lastUser.employeeId) {
          // Extract number from employeeId (e.g., "EMP0000008" -> 8)
          const lastNumber = parseInt(lastUser.employeeId.replace('EMP', ''));
          nextNumber = lastNumber + 1;
        }
        
        const newEmployeeId = `EMP${String(nextNumber).padStart(7, '0')}`;
        
        // Check if this ID already exists
        const existingUser = await mongoose.models.User.findOne({ employeeId: newEmployeeId });
        
        if (!existingUser) {
          this.employeeId = newEmployeeId;
          isUnique = true;
        }
        
        attempts++;
      }
      
      if (!isUnique) {
        throw new Error('Failed to generate unique employee ID after multiple attempts');
      }
    } catch (error) {
      console.error('❌ Error generating employee ID:', error.message);
      return next(error);
    }
  }
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
