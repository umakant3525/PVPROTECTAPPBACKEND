import mongoose from 'mongoose';

const { Schema } = mongoose;

const visitFormSchema = new Schema(
    {
        selectedInfo: {
            plantId: {
                type: String,
                required: true
            },
            plantRef: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Plant',
                required: true
            },
            clientId: {
                type: String,
                required: true
            },
            clientRef: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Client',
                required: true
            }
        },
        iAmAgreeWithRules: {
            type: Boolean,
            default: false
        },
        safetyPhoto: {
            type: String,
            required: true
        },
        normalFormData: {
            visitDate: {
                type: Date,
                required: true
            },
            inverterStatus: {
                type: String,
                required: true
            },
            inverterRemarks: {
                type: String,
                required: true
            },
            importReading: {
                type: String,
                required: true
            },
            exportReading: {
                type: String,
                required: true
            },
            netReading: {
                type: String,
                required: true
            },
            generationReading: {
                type: String,
                required: true
            },
            workDoneBy: {
                type: [String], // Array of strings
                required: true
            },
            extraRemarks: {
                type: String,
                required: true
            },
            clientSignaturePhoto: {
                type: String,
                required: true
            },
            extraOtherPhoto: {
                type: String,
                required: true
            },
            technicianRef: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Technician',
                required: true
            }
        },
        isItCleaning: {
            type: Boolean,
            default: false
        },
        withCleaningFormData: {
            cleaningCycleNumber: {
                type: Number,
                required: function() { return this.isItCleaning; } // Required if isItCleaning is true
            },
            beforeCleaningPhoto: {
                type: String,
                required: function() { return this.isItCleaning; }
            },
            afterCleaningPhoto: {
                type: String,
                required: function() { return this.isItCleaning; }
            },
            inverterPhoto: {
                type: String,
                required: function() { return this.isItCleaning; }
            }
        },
        technicianRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Technician',
            required: function() { return this.isItCleaning; }
        }
    },
    {
        timestamps: true
    }
);

export const VisitForm = mongoose.model('VisitForm', visitFormSchema);
