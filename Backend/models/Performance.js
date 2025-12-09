import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema(
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
    // Performance Metrics
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    // Task Performance
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    tasksAssigned: {
      type: Number,
      default: 0,
    },
    taskCompletionRate: {
      type: Number,
      default: 0,
    },
    // Attendance Performance
    attendanceRate: {
      type: String,
      default: '0%',
    },
    totalWorkingDays: {
      type: Number,
      default: 0,
    },
    presentDays: {
      type: Number,
      default: 0,
    },
    // Project Metrics
    activeProjects: {
      type: Number,
      default: 0,
    },
    completedProjects: {
      type: Number,
      default: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    // Achievements & Skills
    achievements: [{
      title: String,
      description: String,
      date: Date,
    }],
    skills: [{
      name: String,
      proficiency: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate',
      },
    }],
    // Performance Trend
    trend: {
      type: String,
      default: '0%',
    },
    previousScore: {
      type: Number,
      default: 0,
    },
    // Feedback & Comments
    feedback: {
      type: String,
      default: '',
    },
    strengths: [String],
    areasForImprovement: [String],
    // Review Information
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewDate: {
      type: Date,
    },
    nextReviewDate: {
      type: Date,
    },
    // Period
    reviewPeriod: {
      month: Number,
      year: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate overall score based on metrics
performanceSchema.pre('save', function (next) {
  if (this.isModified('tasksCompleted') || this.isModified('tasksAssigned')) {
    this.taskCompletionRate = this.tasksAssigned > 0 
      ? Math.round((this.tasksCompleted / this.tasksAssigned) * 100) 
      : 0;
  }

  // Calculate trend
  if (this.isModified('overallScore') && this.previousScore > 0) {
    const change = this.overallScore - this.previousScore;
    const percentChange = Math.round((change / this.previousScore) * 100);
    this.trend = percentChange > 0 ? `+${percentChange}%` : `${percentChange}%`;
  }

  next();
});

// Index for faster queries
performanceSchema.index({ employeeId: 1, 'reviewPeriod.year': -1, 'reviewPeriod.month': -1 });
performanceSchema.index({ userId: 1 });
performanceSchema.index({ overallScore: -1 });

const Performance = mongoose.model('Performance', performanceSchema);

export default Performance;
