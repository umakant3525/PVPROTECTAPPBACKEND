import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteClient, getAllClients, getCurrentClient, loginClient, logoutClient, createClient } from "../controllers/client.controller.js"; // Update imports

const router = express.Router();

// Public routes

router.post("/create_client", upload.fields([{ name: "avatar", maxCount: 1 }]), createClient);
router.get("/current-client", getCurrentClient);
router.get("/all", getAllClients); 
router.post("/login", loginClient);
router.post("/logout", logoutClient);
router.delete("/delete-account/:id", deleteClient); 

export default router;
