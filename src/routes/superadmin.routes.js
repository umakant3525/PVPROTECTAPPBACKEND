import express from "express";
import { getCurrentSuperAdmin, loginSuperAdmin, logoutSuperAdmin, registerSuperAdmin, updateSuperAdmin} from "../controllers/superadmin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifySuperadminJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", upload.fields([{ name: "superadmin_avatar", maxCount: 1 }]), registerSuperAdmin);
router.post("/login", loginSuperAdmin);
router.get("/current-superadmin",verifySuperadminJWT , getCurrentSuperAdmin);
router.get("/logout", verifySuperadminJWT , logoutSuperAdmin);
router.patch("/update-account", verifySuperadminJWT, updateSuperAdmin);
// router.patch("/update-avatar", upload.single("superadmin_avatar"), updateSuperadminAvatar);

export default router;
