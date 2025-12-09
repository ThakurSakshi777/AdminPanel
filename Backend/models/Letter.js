import mongoose from 'mongoose';

const letterSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeEmail: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    employeePosition: {
      type: String,
      default: '',
    },
    letterType: {
      type: String,
      enum: [
        'offer',
        'joining',
        'confirmation',
        'promotion',
        'increment',
        'pip',
        'warning',
        'experience',
        'internship',
      ],
      required: true,
    },
    letterData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'downloaded'],
      default: 'draft',
    },
    sentAt: {
      type: Date,
      default: null,
    },
    downloadedAt: {
      type: Date,
      default: null,
    },
    pdfPath: {
      type: String,
      default: null,
    },
    pdfBuffer: {
      type: Buffer,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    viewedByEmployee: {
      type: Boolean,
      default: false,
    },
    viewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
letterSchema.index({ employeeId: 1, letterType: 1 });
letterSchema.index({ userId: 1 });
letterSchema.index({ status: 1 });

const Letter = mongoose.models.Letter || mongoose.model('Letter', letterSchema);

export default Letter;
