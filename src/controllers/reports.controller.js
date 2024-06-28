// controllers/reports.controller.js

import { Reports } from "../models/reports.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnAWS, deleteFromAWS } from "../utils/awsamplify.js";
import fs from 'fs';

// Controller to create a new report
const createReport = async (req, res, next) => {
  const {
    reportName,
    reportDescription,
    clientRef,
    adminRef,
  } = req.body;

  const localFilePath = req.file?.path;

  if (!localFilePath) {
    return next(new ApiError(400, "Report document is required"));
  }

  try {
    const reportDocument = await uploadOnAWS(localFilePath);
    if (!reportDocument) {
      throw new ApiError(500, "Failed to upload document to AWS S3");
    }

    // Optionally delete the local file after uploading to S3
    fs.unlinkSync(localFilePath);

    const report = await Reports.create({
      reportName,
      reportDocument,
      reportDescription,
      clientRef,
      adminRef,
    });

    return res.status(201).json(
      new ApiResponse(201, { report }, "Report created successfully")
    );
  } catch (error) {
    next(error);
  }
};

// Controller to retrieve all reports
const getAllReports = async (req, res, next) => {
  try {
    const reports = await Reports.find();

    return res.status(200).json(
      new ApiResponse(200, { reports }, "All reports retrieved successfully")
    );
  } catch (error) {
    next(error);
  }
};

// Controller to delete a report
const deleteReport = async (req, res, next) => {
  const reportId = req.params.id;

  try {
    const report = await Reports.findById(reportId);
    if (!report) {
      return next(new ApiError(404, "Report not found"));
    }

    await deleteFromAWS(report.reportDocument);

    await Reports.findByIdAndDelete(reportId);

    return res.status(200).json(
      new ApiResponse(200, {}, "Report deleted successfully")
    );
  } catch (error) {
    next(error);
  }
};

// Controller to update a report
const updateReport = async (req, res, next) => {
  const reportId = req.params.id;
  const {
    reportName,
    reportDescription,
    clientRef,
    adminRef,
  } = req.body;

  const updateData = {
    reportName,
    reportDescription,
    clientRef,
    adminRef,
  };

  const localFilePath = req.file?.path;

  try {
    if (localFilePath) {
      const report = await Reports.findById(reportId);
      if (!report) {
        return next(new ApiError(404, "Report not found"));
      }

      await deleteFromAWS(report.reportDocument);

      const reportDocument = await uploadOnAWS(localFilePath);
      if (!reportDocument) {
        throw new ApiError(500, "Failed to upload document to AWS S3");
      }

      fs.unlinkSync(localFilePath);
      updateData.reportDocument = reportDocument;
    }

    const updatedReport = await Reports.findByIdAndUpdate(reportId, updateData, { new: true });

    if (!updatedReport) {
      return next(new ApiError(404, "Report not found"));
    }

    return res.status(200).json(
      new ApiResponse(200, { updatedReport }, "Report updated successfully")
    );
  } catch (error) {
    next(error);
  }
};

export {
  createReport,
  getAllReports,
  deleteReport,
  updateReport,
};
