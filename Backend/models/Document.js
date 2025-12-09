import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
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
    documentType: {
      type: String,
      enum: [
        'Aadhar Card',
        'PAN Card',
        'Passport',
        'Driving License',
        'Certificate',
        'Resume',
        '10th Marksheet',
        '12th Marksheet',
        'Graduation Marksheet',
        'Post Graduation Marksheet',
        'Photo',
        'Other'
      ],
      required: true,
    },
    documentName: {
      type: String,
      required: true,
      trim: true,
    },
    documentUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedByName: {
      type: String,
    },
    approvedDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    rejectedDate: {
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

// Index for faster queries
documentSchema.index({ userId: 1, uploadDate: -1 });
documentSchema.index({ status: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ employeeId: 1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;
