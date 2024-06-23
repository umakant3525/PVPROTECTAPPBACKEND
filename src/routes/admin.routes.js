// In admin.routes.js

import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdminJWT, verifySuperadminJWT } from "../middlewares/auth.middleware.js";
import { changeCurrentPassword, deleteAdmin, getAllAdmins, getCurrentAdmin, loginAdmin, logoutAdmin, refreshAccessToken, registerAdmin } from "../controllers/admin.controller.js";

const router = express.Router();

// Public routes
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/current-admin", getCurrentAdmin);
router.post("/refresh-token", refreshAccessToken);

// Routes protected by superadmin
router.post("/register", verifySuperadminJWT, upload.fields([{ name: "avatar", maxCount: 1 }]), registerAdmin);
router.patch("/change-password", verifySuperadminJWT, changeCurrentPassword);
router.get("/all", verifySuperadminJWT, getAllAdmins); 
router.delete("/delete-account/:id", verifySuperadminJWT, deleteAdmin); 

export default router;
