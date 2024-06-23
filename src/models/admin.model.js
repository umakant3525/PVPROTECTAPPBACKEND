import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const adminSchema = new Schema(
    {
        adminid: {
            type: String,
            default: () => `admin_${new mongoose.Types.ObjectId()}`
        },
        name: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, 'is invalid']
        },
        contact_number: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^\+?[1-9]\d{1,14}$/, 'is invalid']
        },
        avatar: {
            type: String, // AWS URL
            required: true,
            default: "https://www.pngmart.com/files/21/Admin-Profile-PNG-Photo.png"
        },
        superadminRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SuperAdmin',
            required: true // Add this line if the reference is mandatory
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
);

adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

adminSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const Admin = mongoose.model("Admin", adminSchema);
