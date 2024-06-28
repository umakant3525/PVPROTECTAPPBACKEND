import express from "express";
import { getCurrentSuperAdmin, loginSuperAdmin, logoutSuperAdmin, registerSuperAdmin} from "../controllers/superadmin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifySuperadminJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", upload.fields([{ name: "superadmin_avatar", maxCount: 1 }]), registerSuperAdmin);
router.post("/login", loginSuperAdmin);
router.get("/current-superadmin",verifySuperadminJWT , getCurrentSuperAdmin);
router.get("/logout", verifySuperadminJWT , logoutSuperAdmin);


export default router;
