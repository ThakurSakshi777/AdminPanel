import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'leave_request',      // New leave request
        'leave_approved',     // Leave approved
        'leave_rejected',     // Leave rejected
        'new_employee',       // New employee joined
        'announcement',       // New announcement
        'project_update',     // Project milestone
        'attendance_marked',  // Attendance marked
        'performance_review', // Performance review
        'task_assigned',      // Task assigned
        'task_completed'      // Task completed
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    data: {
      // Store additional context data
      employeeName: String,
      employeeId: mongoose.Schema.Types.ObjectId,
      leaveType: String,
      leaveDays: Number,
      projectName: String,
      projectId: mongoose.Schema.Types.ObjectId,
      taskName: String,
      taskId: mongoose.Schema.Types.ObjectId,
      relatedId: mongoose.Schema.Types.ObjectId  // Links to leave/project/task/employee
    },
    icon: {
      type: String,
      enum: ['employee', 'leave', 'announcement', 'attendance', 'project', 'task', 'review'],
      default: 'employee'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    link: {
      type: String  // Navigation link for the notification
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });

export default mongoose.model('Notification', notificationSchema);
