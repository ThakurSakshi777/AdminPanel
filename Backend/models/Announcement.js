import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdByName: {
      type: String,
      required: true
    },
    audience: {
      type: String,
      enum: ['All Employees', 'Development', 'HR', 'Sales', 'Finance', 'Operations', 'Management'],
      default: 'All Employees'
    },
    expiryDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    }
  },
  { timestamps: true }
);

// Index for better query performance
AnnouncementSchema.index({ status: 1, expiryDate: 1 });
AnnouncementSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
