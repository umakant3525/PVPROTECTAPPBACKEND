import mongoose from 'mongoose';

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    contractValue : {
        type: Number,
        required: true
    }, 
    paymentSlot: {
      type: String,
      required: true
    },
    paymentAmount: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      required: true
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

export const Payment = mongoose.model('Payment', paymentSchema);
