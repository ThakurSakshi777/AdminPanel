import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      ref: 'Employee',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Performance', 'Skill Development', 'Project', 'Leadership', 'Personal Growth', 'Other'],
      default: 'Performance',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
      default: 'In Progress',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    completedDate: {
      type: Date,
    },
    // Milestones
    milestones: [{
      title: String,
      description: String,
      targetDate: Date,
      completed: {
        type: Boolean,
        default: false,
      },
      completedDate: Date,
    }],
    // Tracking
    notes: [{
      date: {
        type: Date,
        default: Date.now,
      },
      note: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    // Assignment
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastReviewDate: {
      type: Date,
    },
    // Performance Impact
    performanceImpact: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    skillsToImprove: [String],
    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update status based on progress
goalSchema.pre('save', function (next) {
  if (this.isModified('progress')) {
    if (this.progress === 0) {
      this.status = 'Not Started';
    } else if (this.progress > 0 && this.progress < 100) {
      if (this.status === 'Not Started' || this.status === 'Completed') {
        this.status = 'In Progress';
      }
    } else if (this.progress === 100) {
      this.status = 'Completed';
      if (!this.completedDate) {
        this.completedDate = new Date();
      }
    }
  }

  // Check if overdue
  if (this.targetDate && new Date() > this.targetDate && this.status !== 'Completed') {
    // Can add logic for overdue goals
  }

  next();
});

// Indexes
goalSchema.index({ employeeId: 1, isActive: 1 });
goalSchema.index({ userId: 1 });
goalSchema.index({ status: 1 });
goalSchema.index({ targetDate: 1 });

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
