import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the schema
const billAnalysisSchema = new Schema({
  readingDate: {
    type: Date,
    required: true,
  },
  importReading: {
    type: Number,
    required: true,
  },
  exportReading: {
    type: Number,
    required: true,
  },
  netReading: {
    type: Number,
    required: true,
  },
  generationReading: {
    type: Number,
    required: true,
  },
  expectedBill: {
    type: Number,
    required: true,
  },
});

// Create a model based on the schema
const BillAnalysis = mongoose.model('BillAnalysis', billAnalysisSchema);

module.exports = BillAnalysis;
