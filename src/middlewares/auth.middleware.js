import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { SuperAdmin } from "../models/superadmin.model.js";
import { Admin } from "../models/admin.model.js";
import { Client } from "../models/client.model.js";
import { Technician } from "../models/technician.model.js";

export const verifyJWT = (Model) => asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await Model.findById(decodedToken?._id).select("-password -refreshToken");
    
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export const verifySuperadminJWT = verifyJWT(SuperAdmin);
export const verifyAdminJWT = verifyJWT(Admin);
export const verifyClientJWT = verifyJWT(Client);
export const verifyTechnicianJWT = verifyJWT(Technician);
