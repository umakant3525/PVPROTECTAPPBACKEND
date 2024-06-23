import express from "express";
import { registerSuperadmin, loginSuperadmin, logoutSuperadmin, changeCurrentPassword, getCurrentSuperadmin, updateSuperadminAccountDetails, updateSuperadminAvatar, refreshAccessToken } from "../controllers/superadmin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifySuperadminJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", upload.fields([{ name: "avatar", maxCount: 1 }]), registerSuperadmin);
router.post("/login", loginSuperadmin);

// Protected routes
router.use(verifySuperadminJWT);

router.post("/logout", logoutSuperadmin);
router.post("/change-password", changeCurrentPassword);
router.get("/current-superadmin", getCurrentSuperadmin);
router.patch("/update-account", updateSuperadminAccountDetails);
router.patch("/update-avatar", upload.single("avatar"), updateSuperadminAvatar);
router.post("/refresh-token", refreshAccessToken);

export default router;
