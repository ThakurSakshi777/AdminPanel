import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
      default: 'Planning',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    budget: {
      type: Number,
      default: 0,
    },
    teamMembers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        employeeId: String,
        name: String,
        role: String, // Developer, Designer, Tester, etc.
      },
    ],
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    projectManagerName: {
      type: String,
    },
    projectManagerEmployeeId: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
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
    completedDate: {
      type: Date,
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

// Auto-set completed date when status is Completed
projectSchema.pre('save', function (next) {
  if (this.status === 'Completed' && !this.completedDate) {
    this.completedDate = new Date();
    this.progress = 100;
  }
  next();
});

// Index for faster queries
projectSchema.index({ status: 1, priority: 1 });
projectSchema.index({ projectManager: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });
projectSchema.index({ 'teamMembers.userId': 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
