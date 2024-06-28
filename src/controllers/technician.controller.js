import { Technician } from "../models/technician.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Helper function to generate tokens
const generateTokens = (technician) => {
    const accessToken = technician.generateAccessToken();
    const refreshToken = technician.generateRefreshToken();
    return { accessToken, refreshToken };
};

// Controller function to register a new technician
const registerTechnician = async (req, res, next) => {
    const { name, email, contact_number, password, superadminRef } = req.body;

    try {
        // Validate input
        if (!name || !email || !contact_number || !password || !superadminRef) {
            throw new ApiError(400, "All fields are required");
        }

        // Check if a technician with the same email or contact number already exists
        const existingTechnician = await Technician.findOne({ $or: [{ email }, { contact_number }] });
        if (existingTechnician) {
            throw new ApiError(409, "Technician with this email or contact number already exists");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the technician
        const technician = await Technician.create({
            name,
            email,
            contact_number,
            password: hashedPassword,
            superadminRef,
            avatar: "https://www.pngmart.com/files/21/Admin-Profile-PNG-Photo.png" // Default avatar URL
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(technician);

        // Respond with success
        const responseData = {
            _id: technician._id,
            name: technician.name,
            email: technician.email,
            contact_number: technician.contact_number,
            avatar: technician.avatar,
            createdAt: technician.createdAt,
            updatedAt: technician.updatedAt
        };

        return res.status(201).json(new ApiResponse(200, responseData, "Technician registered successfully"))
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options);

    } catch (error) {
        next(error);
    }
};

// Controller function to login a technician
const loginTechnician = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }

        // Find the technician by email
        const technician = await Technician.findOne({ email });

        // Check if technician exists
        if (!technician) {
            throw new ApiError(404, "Technician not found");
        }

        // Validate password
        const isPasswordValid = await technician.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid email or password");
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(technician);

        // Respond with success
        const responseData = {
            _id: technician._id,
            name: technician.name,
            email: technician.email,
            contact_number: technician.contact_number,
            avatar: technician.avatar,
            createdAt: technician.createdAt,
            updatedAt: technician.updatedAt
        };

        return res.status(200).json(new ApiResponse(200, responseData, "Technician logged in successfully"))
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options);

    } catch (error) {
        next(error);
    }
};

// Controller function to get current technician details
const getCurrentTechnician = async (req, res, next) => {
    try {
        // Fetch current technician from req.technician (assuming it's set in middleware)
        const technician = req.technician;

        // Respond with success
        const responseData = {
            _id: technician._id,
            name: technician.name,
            email: technician.email,
            contact_number: technician.contact_number,
            avatar: technician.avatar,
            createdAt: technician.createdAt,
            updatedAt: technician.updatedAt
        };

        return res.status(200).json(new ApiResponse(200, responseData, "Technician fetched successfully"));

    } catch (error) {
        next(error);
    }
};

// Controller function to logout a technician
const logoutTechnician = async (req, res, next) => {
    try {
        // Remove refreshToken from the current technician
        await Technician.findByIdAndUpdate(req.technician._id, { $unset: { refreshToken: 1 } });

        // Clear cookies
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "Technician logged out successfully"));

    } catch (error) {
        next(error);
    }
};

// Controller function to delete a technician
const deleteTechnician = async (req, res, next) => {
    const technicianId = req.params.id;

    try {
        // Find technician by ID and delete
        const technician = await Technician.findByIdAndDelete(technicianId);

        // Check if technician exists
        if (!technician) {
            throw new ApiError(404, "Technician not found");
        }

        return res.status(200).json(new ApiResponse(200, {}, "Technician deleted successfully"));

    } catch (error) {
        next(error);
    }
};

export {
    registerTechnician,
    loginTechnician,
    getCurrentTechnician,
    logoutTechnician,
    deleteTechnician
};
