import mongoose from 'mongoose';

const { Schema } = mongoose;

const financialAnalysisSchema = new Schema(
    {
        clientRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: true
        },
        initialInvestment: {
            type: String,
            required: true
        },
        maintenanceCost: {
            type: String,
            required: true
        },
        totalUnitGenerationValueTillDate: {
            type: String,
            required: true
        },
        payBackPeriod: {
            type: String,
            required: true
        },
        IRR: {
            type: String,
            required: true
        },
        NPV: {
            type: String,
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

export const FinancialAnalysis = mongoose.model('FinancialAnalysis', financialAnalysisSchema);
