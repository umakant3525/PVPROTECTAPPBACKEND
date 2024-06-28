import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
// import { verifyAdminJWT, verifySuperadminJWT } from "../middlewares/auth.middleware.js";
import { deleteAdmin, getAllAdmins, getCurrentAdmin, loginAdmin, logoutAdmin, createAdmin  } from "../controllers/admin.controller.js";

const router = express.Router();

// Public routes

router.post("/create_admin", upload.fields([{ name: "avatar", maxCount: 1 }]), createAdmin);
router.get("/current-admin", getCurrentAdmin);
router.get("/all", getAllAdmins); 
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.delete("/delete-account/:id", deleteAdmin); 



export default router;
