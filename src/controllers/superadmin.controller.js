// Import necessary modules and models
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { SuperAdmin } from "../models/superadmin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { deleteFromAWS, uploadOnAWS } from "../utils/awsamplify.js";
// import jwt from "jsonwebtoken";

 const registerSuperAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, contact_number } = req.body;

    if (!name || !email || !password || !contact_number) {
        throw new ApiError(400, "All fields are required");
    }

    const existedSuperAdmin = await SuperAdmin.findOne({ email });
    if (existedSuperAdmin) {
        throw new ApiError(409, "Superadmin with this email already exists");
    }

    const avatar = "umakantimg";
    // const avatarLocalPath = req.files?.superadmin_avatar[0]?.path;
    // if (!avatarLocalPath) {
    //     throw new ApiError(400, "Superadmin Avatar file is required");
    // }
    // const avatar = await uploadOnAWS(avatarLocalPath);
    // if (!avatar) {
    //     throw new ApiError(400, "Superadmin Avatar file upload failed");
    // }

    const superAdmin = await SuperAdmin.create({
        name,
        avatar: avatar.url,
        email,
        password,
        contact_number
    });

    const createdSuperAdmin = await SuperAdmin.findById(superAdmin._id).select("-password -refreshToken");
    if (!createdSuperAdmin) {
        throw new ApiError(500, "Something went wrong while registering the superadmin");
    }

    return res.status(201).json(
        new ApiResponse(200, createdSuperAdmin, "Superadmin registered successfully")
    );
});

 const loginSuperAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const superadmin = await SuperAdmin.findOne({ email });

    if (!superadmin) {
        throw new ApiError(404, "Superadmin does not exist");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const isPasswordValid = await superadmin.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid superadmin credentials");
    }

    const accessToken = superadmin.generateAccessToken();
    const refreshToken = superadmin.generateRefreshToken();

    superadmin.refreshToken = refreshToken;
    await superadmin.save();

    const loggedInSuperAdmin = await SuperAdmin.findById(superadmin._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true, 
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { superadmin: loggedInSuperAdmin, accessToken, refreshToken },
                "Superadmin logged in successfully"
            )
        );
});

const getCurrentSuperAdmin = asyncHandler(async (req, res) => {
    const currentSuperAdmin = req.user; // This should be set by verifySuperadminJWT middleware

    if (!currentSuperAdmin) {
        throw new ApiError(401, "Unauthorized: Superadmin not authenticated");
    }

    // Retrieve additional fields from the currentSuperAdmin object
    const { _id, email, name, avatar, contact_number } = currentSuperAdmin;

    // Construct the response object with desired fields
    const response = {
        _id,
        email,
        name,
        avatar,
        contact_number
    };

    return res.status(200).json(
        new ApiResponse(200, {
            response,
            message: "Super Admin fetched successfully"
        })
    );
});

const logoutSuperAdmin = asyncHandler(async (req, res) => {
    const currentSuperAdmin = req.user; // This should be set by verifySuperadminJWT middleware

    if (!currentSuperAdmin) {
        throw new ApiError(401, "Unauthorized: Superadmin not authenticated");
    }

    // Update refreshToken to unset (remove it from the document)
    await SuperAdmin.findByIdAndUpdate(
        currentSuperAdmin._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    // Options for cookie clearing
    const options = {
        httpOnly: true,
        secure: true, // Make sure to use HTTPS in production
    };

    // Clear cookies and send logout response
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Superadmin logged out"));
});

export {
    registerSuperAdmin,
    loginSuperAdmin,
    getCurrentSuperAdmin,
    logoutSuperAdmin
};
