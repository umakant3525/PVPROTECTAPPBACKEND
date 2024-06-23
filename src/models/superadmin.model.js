import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const superAdminSchema = new Schema(
    {
        superadminid: {
            type: String,
            default: () => `sa_${new mongoose.Types.ObjectId().toHexString().substring(0, 6)}`
        },
        name: {
            type: String,
            required: true,
            lowercase: true,
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
            trim: true,
            match: [/^\+?[1-9]\d{1,14}$/, 'is invalid']
        },
        avatar: {
            type: String, // AWS URL
            required: true,
            default: "https://www.pngmart.com/files/21/Admin-Profile-PNG-Photo.png"
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

superAdminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

superAdminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

superAdminSchema.methods.generateAccessToken = function () {
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

superAdminSchema.methods.generateRefreshToken = function () {
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

export const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);
