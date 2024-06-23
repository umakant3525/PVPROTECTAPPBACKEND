// In client.routes.js

import express from "express";
import { registerClient, loginClient, logoutClient, changeCurrentPassword, getCurrentClient, updateClientAccountDetails, updateClientAvatar, refreshAccessToken, getAllClients, deleteClient, updateClient } from "../controllers/client.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyClientJWT, verifyAdminJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginClient);
router.post("/logout", logoutClient);
router.get("/current-client", getCurrentClient);
router.post("/refresh-token", refreshAccessToken);

// Routes protected by admin
router.post("/register", verifyAdminJWT, upload.fields([{ name: "avatar", maxCount: 1 }]), registerClient);
router.patch("/change-password", verifyClientJWT, changeCurrentPassword);
router.get("/all", verifyAdminJWT, getAllClients); 
router.delete("/delete-account/:id", verifyAdminJWT, deleteClient); 

export default router;
