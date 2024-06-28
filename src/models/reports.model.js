import mongoose from 'mongoose';

const { Schema } = mongoose;

const reportsSchema = new Schema(
  {
    reportName: {
      type: String,
      required: true
    },
    reportDocument: {
      type: String,
      required: true
    },
    reportDescription: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    clientRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    adminRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Reports = mongoose.model('Report', reportsSchema);
