import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Superadmin } from "../models/superadmin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { deleteFromAWS, uploadOnAWS } from "../utils/awsamplify.js";
// import jwt from "jsonwebtoken";


// Controller function to register a new superadmin
const registerSuperAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, contact_number } = req.body;

    // Check if any required fields are missing
    if (!name || !email || !password || !contact_number) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if a superadmin with the same email already exists
    const existedSuperAdmin = await SuperAdmin.findOne({ email });
    if (existedSuperAdmin) {
        throw new ApiError(409, "Superadmin with this email already exists");
    }

    // Upload avatar to AWS assuming req.files contains avatar data
    const avatarLocalPath = req.files?.superadmin_avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    const avatar = await uploadOnAWS(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file upload failed");
    }

    // Create the superadmin
    const superAdmin = await SuperAdmin.create({
        name,
        avatar: avatar.url,
        email,
        password,
        contact_number
    });

    // Find the created superadmin and send response
    const createdSuperAdmin = await SuperAdmin.findById(superAdmin._id).select("-password -refreshToken");
    if (!createdSuperAdmin) {
        throw new ApiError(500, "Something went wrong while registering the superadmin");
    }

    return res.status(201).json(
        new ApiResponse(200, createdSuperAdmin, "Superadmin registered successfully")
    );
});

// // Controller function to login a superadmin
// const loginSuperadmin = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;

//     if (!email) {
//         throw new ApiError(400, "Email is required");
//     }

//     const superadmin = await Superadmin.findOne({ email });

//     if (!superadmin) {
//         throw new ApiError(404, "Superadmin does not exist");
//     }

//     if (!password) {
//         throw new ApiError(400, "Password is required");
//     }
    
//     // Validate the password
//     const isPasswordValid = await superadmin.isPasswordCorrect(password);
//     if (!isPasswordValid) {
//         throw new ApiError(401, "Invalid superadmin credentials");
//     }

//     // Generate access and refresh tokens
//     const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(superadmin._id);

//     // Find the logged-in superadmin and remove sensitive data
//     const loggedInSuperadmin = await Superadmin.findById(superadmin._id).select("-password -refreshToken");

//     // Set cookie options
//     const options = {
//         httpOnly: true,
//         secure: true, // Make sure to use HTTPS in production
//     };

//     // Set cookies and send response
//     return res
//         .status(200)
//         .cookie("accessToken", accessToken, options)
//         .cookie("refreshToken", refreshToken, options)
//         .json(
//             new ApiResponse(
//                 200,
//                 { superadmin: loggedInSuperadmin, accessToken, refreshToken },
//                 "Superadmin logged in successfully"
//             )
//         );
// });

// // Controller function to logout a superadmin
// const logoutSuperadmin = asyncHandler(async (req, res) => {
//     await Superadmin.findByIdAndUpdate(
//         req.superadmin._id,
//         {
//             $unset: {
//                 refreshToken: 1, // this removes the field from document
//             },
//         },
//         {
//             new: true,
//         }
//     );

//     const options = {
//         httpOnly: true,
//         secure: true,
//     };

//     return res
//         .status(200)
//         .clearCookie("accessToken", options)
//         .clearCookie("refreshToken", options)
//         .json(new ApiResponse(200, {}, "Superadmin logged out"));
// });

// // Controller function to refresh access token
// const refreshAccessToken = asyncHandler(async (req, res) => {
//     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

//     if (!incomingRefreshToken) {
//         throw new ApiError(401, "Unauthorized request");
//     }

//     try {
//         const decodedToken = jwt.verify(
//             incomingRefreshToken,
//             process.env.REFRESH_TOKEN_SECRET
//         );

//         const superadmin = await Superadmin.findById(decodedToken?._id);

//         if (!superadmin) {
//             throw new ApiError(401, "Invalid refresh token");
//         }

//         if (incomingRefreshToken !== superadmin?.refreshToken) {
//             throw new ApiError(401, "Refresh token is expired or used");
//         }

//         const options = {
//             httpOnly: true,
//             secure: true,
//         };

//         const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(superadmin._id);

//         return res
//             .status(200)
//             .cookie("accessToken", accessToken, options)
//             .cookie("refreshToken", newRefreshToken, options)
//             .json(
//                 new ApiResponse(
//                     200,
//                     { accessToken, refreshToken: newRefreshToken },
//                     "Access token refreshed"
//                 )
//             );
//     } catch (error) {
//         throw new ApiError(401, error?.message || "Invalid refresh token");
//     }
// });

// // Controller function to change superadmin's current password
// const changeCurrentPassword = asyncHandler(async (req, res) => {
//     const { oldPassword, newPassword } = req.body;

//     const superadmin = await Superadmin.findById(req.superadmin?._id);

//     const isPasswordCorrect = await superadmin.isPasswordCorrect(oldPassword);

//     if (!isPasswordCorrect) {
//         throw new ApiError(400, "Invalid old password");
//     }

//     superadmin.password = newPassword;
//     await superadmin.save({ validateBeforeSave: false });

//     return res
//         .status(200)
//         .json(new ApiResponse(200, {}, "Password changed successfully"));
// });

// // Controller function to get current superadmin details
// const getCurrentSuperadmin = asyncHandler(async (req, res) => {
//     return res
//         .status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 req.superadmin,
//                 "Superadmin fetched successfully"
//             )
//         );
// });


// // Controller function to update superadmin's account details
// const updateSuperadminAccountDetails = asyncHandler(async (req, res) => {
//     const { fullName, email } = req.body;

//     if (!fullName || !email) {
//         throw new ApiError(400, "All fields are required");
//     }

//     const superadmin = await Superadmin.findByIdAndUpdate(
//         req.superadmin?._id,
//         {
//             $set: {
//                 fullName,
//                 email: email,
//             },
//         },
//         { new: true }
//     ).select("-password");

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 superadmin,
//                 "Account details updated successfully"
//             )
//         );
// });

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
    registerSuperadmin,
    loginSuperadmin,
    getCurrentSuperadmin,
    logoutSuperadmin,
    changeCurrentPassword,
    updateSuperadminAccountDetails,
    updateSuperadminAvatar,
    refreshAccessToken
};
