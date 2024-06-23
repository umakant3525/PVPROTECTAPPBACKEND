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

const updateSuperAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params; // Retrieve superadmin ID from route parameters
    const { name, email, contact_number, password } = req.body;

    // Check if any required fields are missing
    if (!name || !email || !contact_number || !password) {
        throw new ApiError(400, "All fields (name, email, contact_number, password) are required");
    }

    // Fetch the current superadmin from req.user (set by verifySuperadminJWT middleware)
    const currentSuperAdmin = req.user;

    // Check if the current superadmin is authorized to perform this update
    if (id !== currentSuperAdmin.id) {
        throw new ApiError(403, "Unauthorized: You are not allowed to update this superadmin");
    }

    // Find the superadmin to be updated
    let superAdmin = await SuperAdmin.findById(id);
    if (!superAdmin) {
        throw new ApiError(404, "Superadmin not found");
    }

    // Check if the provided email is already taken by another superadmin
    if (email !== superAdmin.email) {
        const existingEmail = await SuperAdmin.findOne({ email });
        if (existingEmail) {
            throw new ApiError(409, "Email is already in use by another superadmin");
        }
    }

    // Update the superadmin object with new details and password
    superAdmin.name = name;
    superAdmin.email = email;
    superAdmin.contact_number = contact_number;

    // Set and hash the new password securely
    superAdmin.password = await bcrypt.hash(password, 10); // Assuming bcrypt for hashing

    // Save the updated superadmin details securely
    await superAdmin.save();

    // Fetch the updated superadmin details to send in the response
    superAdmin = await SuperAdmin.findById(id).select("-password");

    // Send success response with updated superadmin details
    return res.status(200).json(
        new ApiResponse(200, superAdmin, "Superadmin details updated successfully")
    );
});



// // Controller function to update superadmin's avatar
// const updateSuperadminAvatar = asyncHandler(async (req, res) => {
//     const avatarLocalPath = req.file?.path;

//     if (!avatarLocalPath) {
//         throw new ApiError(400, "Avatar file is missing");
//     }

//     const avatar = await uploadOnAWS(avatarLocalPath);

//     if (!avatar.url) {
//         throw new ApiError(400, "Error while uploading avatar");
//     }

//     try {
//         // Extracting public ID from old avatar URL
//         const oldAvatarUrl = req.superadmin?.avatar;
//         if (oldAvatarUrl) {
//             const publicId = oldAvatarUrl.split('/').pop().split('.')[0]; // Extracting public ID from URL
//             await deleteFromAWS(publicId); 
//         }
//     } catch (error) {
//         throw new ApiError(400, "Error occurred when deleting img from cloud");
//     }

//     const superadmin = await Superadmin.findByIdAndUpdate(
//         req.superadmin?._id,
//         { $set: { avatar: avatar.url } },
//         { new: true }
//     ).select("-password");

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 superadmin,
//                 "Avatar image updated successfully"
//             )
//         );
// });

// // Function to generate access and refresh tokens for a superadmin
// const generateAccessAndRefreshTokens = async (superadminId) => {
//     try {
//         const superadmin = await Superadmin.findById(superadminId);
//         const accessToken = superadmin.generateAccessToken();
//         const refreshToken = superadmin.generateRefreshToken();

//         superadmin.refreshToken = refreshToken;
//         await superadmin.save({ validateBeforeSave: false });

//         return { accessToken, refreshToken };
//     } catch (error) {
//         throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
//     }
// };

export {
    registerSuperAdmin,
    loginSuperAdmin,
    getCurrentSuperAdmin,
    logoutSuperAdmin,
    updateSuperAdmin
};
