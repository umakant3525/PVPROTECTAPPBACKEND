// routes/plant.routes.js

import express from "express";
import { verifyAdminJWT, verifyClientJWT } from "../middlewares/auth.middleware.js";
import {
  createPlant,
  getCurrentPlant,
  getAllPlants,
  updatePlant,
  deletePlant,
} from "../controllers/plant.controller.js";

const router = express.Router();

// Public routes (Assuming middleware checks are done before calling controllers)
router.post("/create", verifyAdminJWT, createPlant);
router.get("/plant/:plantid", verifyClientJWT, getCurrentPlant);
router.get("/all", getAllPlants);
router.put("/update/:plantid", verifyAdminJWT, updatePlant);
router.delete("/delete/:plantid", verifyAdminJWT, deletePlant);

export default router;
