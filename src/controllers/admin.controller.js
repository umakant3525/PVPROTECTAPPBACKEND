import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Controller function to register a new admin
const createAdmin = asyncHandler(async (req, res) => {
    const { name, email, contact_number, password } = req.body;

    // Validate input
    if (!name || !email || !contact_number || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if an admin with the same email or contact number already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { contact_number }] });
    if (existingAdmin) {
        throw new ApiError(409, "Admin with this email or contact number already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin
    const admin = await Admin.create({
        name,
        email,
        contact_number,
        password: hashedPassword,
        avatar: "https://www.pngmart.com/files/21/Admin-Profile-PNG-Photo.png", // Default avatar URL
        superadminRef: req.user.superadminRef // Assuming req.user has superadminRef
    });

    // Send response
    const responseData = {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        contact_number: admin.contact_number,
        avatar: admin.avatar,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
    };

    return res.status(201).json(new ApiResponse(200, responseData, "Admin registered successfully"));
});

// Controller function to login an admin
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // Find the admin by email
    const admin = await Admin.findOne({ email });

    // Check if admin exists
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Generate tokens
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    // Remove sensitive data
    const responseData = {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        contact_number: admin.contact_number,
        avatar: admin.avatar,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
    };

    // Set cookie options
    const options = {
        httpOnly: true,
        secure: true, // Make sure to use HTTPS in production
    };

    // Set cookies and send response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, responseData, "Admin logged in successfully"));
});

// Controller function to get current admin details
const getCurrentAdmin = asyncHandler(async (req, res) => {
    // Fetch current admin from req.admin (assuming it's set in middleware)
    const admin = req.admin;

    // Remove sensitive data
    const responseData = {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        contact_number: admin.contact_number,
        avatar: admin.avatar,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
    };

    return res.status(200).json(new ApiResponse(200, responseData, "Admin fetched successfully"));
});

// Controller function to get all admins
const getAllAdmins = asyncHandler(async (req, res) => {
    // Fetch all admins
    const admins = await Admin.find();

    // Remove sensitive data
    const responseData = admins.map(admin => ({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        contact_number: admin.contact_number,
        avatar: admin.avatar,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
    }));

    return res.status(200).json(new ApiResponse(200, responseData, "All admins fetched successfully"));
});

// Controller function to logout an admin
const logoutAdmin = asyncHandler(async (req, res) => {
    // Remove refreshToken from the current admin
    await Admin.findByIdAndUpdate(req.admin._id, { $unset: { refreshToken: 1 } });

    // Clear cookies
    const options = {
        httpOnly: true,
        secure: true, // Make sure to use HTTPS in production
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

// Controller function to delete an admin
const deleteAdmin = asyncHandler(async (req, res) => {
    const adminId = req.params.id;

    // Find admin by ID and delete
    const admin = await Admin.findByIdAndDelete(adminId);

    // Check if admin exists
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Admin deleted successfully"));
});

export {
    createAdmin,
    loginAdmin,
    getCurrentAdmin,
    getAllAdmins,
    logoutAdmin,
    deleteAdmin
};
