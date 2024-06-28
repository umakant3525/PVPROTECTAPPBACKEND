import mongoose from 'mongoose';

const { Schema } = mongoose;

const plantInformationSchema = new Schema(
  {
    plantid: {
      type: String,
      default: () => `plant_${new mongoose.Types.ObjectId()}`,
      unique: true, // Assuming plantid should be unique
    },
    plantname: {
      type: String,
      required: true,
    },
    plantowner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    plantAddress: {
      type: String,
      required: true,
    },
    adminRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    commissioningDate: {
      type: Date,
      default: Date.now,
    },
    operationYear: {
      type: String,
      enum: ['2023-2024', '2024-2025', '2025-2026'], // Example enum for operation year
    },
    postCommissioningAudit: {
      type: String,
      default: 'Ruturaj Deshmukh',
    },
    msedclConsumerNumber: {
      type: String,
      required: true,
    },
    billingUnitNo: {
      type: String,
      required: true,
    },
    billingCycleDate: {
      type: Date,
      required: true,
    },
    msedclRegisteredMobileNumber: {
      type: String,
      required: true,
    },
    documentsReceived: {
      type: Number,
      default: 0,
    },
    numberOfModules: {
      type: Number,
      required: true,
    },
    moduleMake: {
      type: String,
      required: true,
    },
    wattPeak: {
      type: Number,
      required: true,
    },
    moduleType: {
      type: String,
      required: true,
    },
    numberOfStrings: {
      type: Number,
      required: true,
    },
    inverterMake: {
      type: String,
      required: true,
    },
    inverterModelNumber: {
      type: String,
      required: true,
    },
    numberOfInverters: {
      type: Number,
      required: true,
    },
    inverterSerialNumber: {
      type: String,
      required: true,
    },
    inverterCapacity: {
      type: Number,
      required: true,
    },
    modeOfInternetConnection: {
      type: String,
      enum: ['LAN', 'WiFi', 'Ethernet'],
      required: true,
    },
    // Add more fields as per your specific requirements
  },
  {
    timestamps: true,
  }
);

export const PlantInformation = mongoose.model('PlantInformation', plantInformationSchema);
