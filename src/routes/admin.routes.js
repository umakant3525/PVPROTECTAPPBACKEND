// In admin.routes.js

import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
// import { verifyAdminJWT, verifySuperadminJWT } from "../middlewares/auth.middleware.js";
import { deleteAdmin, getAllAdmins, getCurrentAdmin, loginAdmin, logoutAdmin, registerAdmin } from "../controllers/admin.controller.js";

const router = express.Router();

// Public routes

router.post("/register", upload.fields([{ name: "avatar", maxCount: 1 }]), registerAdmin);
router.get("/current-admin", getCurrentAdmin);
router.get("/all", getAllAdmins); 
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.delete("/delete-account/:id", deleteAdmin); 



export default router;
