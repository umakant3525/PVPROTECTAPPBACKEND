import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// Controller function to register a new admin
const registerAdmin = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, mobilenumber, address } = req.body;

    // Check if any required fields are missing
    if (!fullName || !email || !username || !password || !mobilenumber || !address) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if an admin with the same email already exists
    const existedAdmin = await Admin.findOne({ email });
    if (existedAdmin) {
        throw new ApiError(409, "Admin with this email already exists");
    }

    // Upload avatar to AWS assuming req.files contains avatar data
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    const avatar = await uploadOnAWS(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file upload failed");
    }

    // Create the admin
    const admin = await Admin.create({
        fullName,
        avatar: avatar.url,
        email,
        username: username.toLowerCase(),
        password,
        mobilenumber,
        address
    });

    // Find the created admin and send response
    const createdAdmin = await Admin.findById(admin._id).select("-password -refreshToken");
    if (!createdAdmin) {
        throw new ApiError(500, "Something went wrong while registering the admin");
    }

    return res.status(201).json(
        new ApiResponse(200, createdAdmin, "Admin registered successfully")
    );
});

// Controller function to login an admin
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
        throw new ApiError(404, "Admin does not exist");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }
    
    // Validate the password
    const isPasswordValid = await admin.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid admin credentials");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id);

    // Find the logged-in admin and remove sensitive data
    const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

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
        .json(
            new ApiResponse(
                200,
                { admin: loggedInAdmin, accessToken, refreshToken },
                "Admin logged in successfully"
            )
        );
});

// Controller function to logout an admin
const logoutAdmin = asyncHandler(async (req, res) => {
    await Admin.findByIdAndUpdate(
        req.admin._id,
        {
            $unset: {
                refreshToken: 1, // this removes the field from document
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Admin logged out"));
});

// Controller function to refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const admin = await Admin.findById(decodedToken?._id);

        if (!admin) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== admin?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(admin._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

// Controller function to change admin's current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin?._id);

    const isPasswordCorrect = await admin.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    admin.password = newPassword;
    await admin.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Controller function to get current admin details
const getCurrentAdmin = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.admin,
                "Admin fetched successfully"
            )
        );
});

// Controller function to get all admins
const getAllAdmins = asyncHandler(async (req, res) => {
    const admins = await Admin.find().select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(200, admins, "All admins fetched successfully")
    );
});

// Controller function to delete an admin account by ID
const deleteAdmin = asyncHandler(async (req, res) => {
    const adminId = req.params.id;

    // Check if the admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    // Delete the admin
    await Admin.findByIdAndDelete(adminId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Admin account deleted successfully")
    );
});


export {
    registerAdmin,
    loginAdmin,
    getCurrentAdmin,
    logoutAdmin,
    changeCurrentPassword,
    refreshAccessToken,
    getAllAdmins,
    deleteAdmin
};
