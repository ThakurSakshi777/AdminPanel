import mongoose from 'mongoose';

const hrActivitySchema = new mongoose.Schema({
  hrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hrEmail: {
    type: String,
    required: true,
  },
  hrName: {
    type: String,
    required: true,
  },
  activityType: {
    type: String,
    enum: ['login', 'signup', 'logout'],
    required: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  device: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  sessionId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  remarks: {
    type: String,
  },
});

// Create index for faster queries
hrActivitySchema.index({ hrId: 1, timestamp: -1 });
hrActivitySchema.index({ hrEmail: 1 });
hrActivitySchema.index({ activityType: 1 });

export default mongoose.model('HRActivity', hrActivitySchema);
