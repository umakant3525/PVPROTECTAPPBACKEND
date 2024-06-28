import mongoose from "mongoose";

const { Schema } = mongoose;

const generationSchema = new Schema(
    {
        id: {
            type: String,
            default: () => `gen_${new mongoose.Types.ObjectId()}`,
            unique: true
        },
        date: {
            type: Date,
            required: true
        },
        power_generation_value: {
            type: Number,
            required: true
        },
        time: {
            type: Date,
            required: true
        },
        expected_generation: {
            type: Number,
            required: true
        },
        adminRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        },
        clientRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: true
        },
        technicianRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Technician',
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Generation = mongoose.model("Generation", generationSchema);
