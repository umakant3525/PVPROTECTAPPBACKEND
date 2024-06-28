// routes/reports.routes.js

import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createReport,
  getAllReports,
  deleteReport,
  updateReport,
} from "../controllers/reports.controller.js";

const router = express.Router();

router.post("/add-report", upload.single('reportDocument'), createReport);
router.get("/get-reports", getAllReports);
router.delete("/delete-report/:id", deleteReport);
router.put("/update-report/:id", upload.single('reportDocument'), updateReport);

export default router;
