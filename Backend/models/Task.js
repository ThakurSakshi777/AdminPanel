import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    taskTitle: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedToName: {
      type: String,
      required: true,
    },
    assignedToEmployeeId: {
      type: String,
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedByName: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'On Hold'],
      default: 'Pending',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    project: {
      type: String,
      trim: true,
      default: '',
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
      },
    ],
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
taskSchema.pre('save', function (next) {
  if (this.status === 'Completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  next();
});

// Index for faster queries
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1, status: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
