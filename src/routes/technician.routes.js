import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteTechnician, getAllTechnicians, getCurrentTechnician, loginTechnician, logoutTechnician, registerTechnician } from "../controllers/technician.controller.js";

const router = express.Router();

// Public routes
router.post("/register", upload.fields([{ name: "avatar", maxCount: 1 }]), registerTechnician);
router.get("/current-technician", getCurrentTechnician);
router.get("/all-technicians", getAllTechnicians);
router.post("/login", loginTechnician);
router.post("/logout", logoutTechnician);
router.delete("/delete/:id", deleteTechnician);

export default router;
