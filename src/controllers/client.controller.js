import { Client } from "../models/client.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Helper function to generate tokens
const generateTokens = (client) => {
    const accessToken = client.generateAccessToken();
    const refreshToken = client.generateRefreshToken();
    return { accessToken, refreshToken };
};

// Controller function to register a new client
const registerClient = async (req, res, next) => {
    const { name, email, contact_number, password, technicianRef } = req.body;

    try {
        // Validate input
        if (!name || !email || !contact_number || !password || !technicianRef) {
            throw new ApiError(400, "All fields are required");
        }

        // Check if a client with the same email or contact number already exists
        const existingClient = await Client.findOne({ $or: [{ email }, { contact_number }] });
        if (existingClient) {
            throw new ApiError(409, "Client with this email or contact number already exists");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the client
        const client = await Client.create({
            name,
            email,
            contact_number,
            password: hashedPassword,
            technicianRef,
            avatar: "https://www.pngmart.com/files/21/Admin-Profile-PNG-Photo.png" // Default avatar URL
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(client);

        // Respond with success
        const responseData = {
            _id: client._id,
            name: client.name,
            email: client.email,
            contact_number: client.contact_number,
            avatar: client.avatar,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt
        };

        return res.status(201).json(new ApiResponse(200, responseData, "Client registered successfully"))
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)

    } catch (error) {
        next(error);
    }
};

// Controller function to login a client
const loginClient = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }

        // Find the client by email
        const client = await Client.findOne({ email });

        // Check if client exists
        if (!client) {
            throw new ApiError(404, "Client not found");
        }

        // Validate password
        const isPasswordValid = await client.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid email or password");
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(client);

        // Respond with success
        const responseData = {
            _id: client._id,
            name: client.name,
            email: client.email,
            contact_number: client.contact_number,
            avatar: client.avatar,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt
        };

        return res.status(200).json(new ApiResponse(200, responseData, "Client logged in successfully"))
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)

    } catch (error) {
        next(error);
    }
};

// Controller function to get current client details
const getCurrentClient = async (req, res, next) => {
    try {
        // Fetch current client from req.client (assuming it's set in middleware)
        const client = req.client;

        // Respond with success
        const responseData = {
            _id: client._id,
            name: client.name,
            email: client.email,
            contact_number: client.contact_number,
            avatar: client.avatar,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt
        };

        return res.status(200).json(new ApiResponse(200, responseData, "Client fetched successfully"));

    } catch (error) {
        next(error);
    }
};

// Controller function to logout a client
const logoutClient = async (req, res, next) => {
    try {
        // Remove refreshToken from the current client
        await Client.findByIdAndUpdate(req.client._id, { $unset: { refreshToken: 1 } });

        // Clear cookies
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "Client logged out successfully"));

    } catch (error) {
        next(error);
    }
};

// Controller function to delete a client
const deleteClient = async (req, res, next) => {
    const clientId = req.params.id;

    try {
        // Find client by ID and delete
        const client = await Client.findByIdAndDelete(clientId);

        // Check if client exists
        if (!client) {
            throw new ApiError(404, "Client not found");
        }

        return res.status(200).json(new ApiResponse(200, {}, "Client deleted successfully"));

    } catch (error) {
        next(error);
    }
};

export {
    registerClient,
    loginClient,
    getCurrentClient,
    logoutClient,
    deleteClient
};
