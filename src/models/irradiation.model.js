import mongoose from 'mongoose';

const { Schema } = mongoose;

const irradiationSchema = new Schema(
    {
        monthly_irradiation_value: {
            type: Number,
            required: true
        },
        month_year: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        clientrRef: {
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

export const Irradiation = mongoose.model('Irradiation', irradiationSchema);
