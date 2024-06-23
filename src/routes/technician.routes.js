// In technician.routes.js

import express from "express";
import { registerTechnician, loginTechnician, logoutTechnician, changeCurrentPassword, getCurrentTechnician, updateTechnicianAccountDetails, updateTechnicianAvatar, refreshAccessToken, getAllTechnicians, deleteTechnician, updateTechnician } from "../controllers/technician.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyTechnicianJWT, verifySuperadminJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginTechnician);
router.post("/logout", logoutTechnician);
router.get("/current-technician", getCurrentTechnician);
router.post("/refresh-token", refreshAccessToken);

// Routes protected by superadmin
router.post("/register", verifySuperadminJWT, upload.fields([{ name: "avatar", maxCount: 1 }]), registerTechnician);
router.patch("/change-password", verifyTechnicianJWT, changeCurrentPassword);
router.get("/all", verifySuperadminJWT, getAllTechnicians); 
router.delete("/delete-account/:id", verifySuperadminJWT, deleteTechnician); 

export default router;
