// controllers/plant.controller.js

import { PlantInformation } from "../models/plant.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Controller function to create a new plant
const createPlant = async (req, res, next) => {
  const {
    plantname,
    plantAddress,
    adminRef,
    commissioningDate,
    operationYear,
    postCommissioningAudit,
    msedclConsumerNumber,
    billingUnitNo,
    billingCycleDate,
    msedclRegisteredMobileNumber,
    documentsReceived,
    numberOfModules,
    moduleMake,
    wattPeak,
    moduleType,
    numberOfStrings,
    inverterMake,
    inverterModelNumber,
    numberOfInverters,
    inverterSerialNumber,
    inverterCapacity,
    modeOfInternetConnection,
  } = req.body;

  try {
    // Get the plant owner ID from the authenticated client
    const plantowner = req.client._id;

    // Create the plant
    const plant = await PlantInformation.create({
      plantname,
      plantowner,
      plantAddress,
      adminRef,
      commissioningDate,
      operationYear,
      postCommissioningAudit,
      msedclConsumerNumber,
      billingUnitNo,
      billingCycleDate,
      msedclRegisteredMobileNumber,
      documentsReceived,
      numberOfModules,
      moduleMake,
      wattPeak,
      moduleType,
      numberOfStrings,
      inverterMake,
      inverterModelNumber,
      numberOfInverters,
      inverterSerialNumber,
      inverterCapacity,
      modeOfInternetConnection,
    });

    // Respond with success
    return res.status(201).json(
      new ApiResponse(
        200,
        {
          plantId: plant._id,
          message: "Plant information created successfully",
        },
        "Plant created successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// Controller function to retrieve all plants
const getAllPlants = async (req, res, next) => {
  try {
    // Retrieve all plants
    const plants = await PlantInformation.find();

    // Respond with success
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          plants,
        },
        "All plants retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// Controller function to update a plant
const updatePlant = async (req, res, next) => {
  const plantId = req.params.plantid;
  const updateData = req.body;
  const ownerId = req.client._id; // Assuming req.client is set by auth middleware

  try {
    // Find the plant to update and check ownership
    const plant = await PlantInformation.findById(plantId);

    if (!plant) {
      throw new ApiError(404, "Plant not found");
    }

    // Check if the authenticated client is the owner of the plant
    if (plant.plantowner.toString() !== ownerId.toString()) {
      throw new ApiError(403, "You are not authorized to update this plant");
    }

    // Update the plant
    const updatedPlant = await PlantInformation.findByIdAndUpdate(
      plantId,
      updateData,
      { new: true }
    );

    // Check if plant exists
    if (!updatedPlant) {
      throw new ApiError(404, "Plant not found");
    }

    // Respond with success
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          updatedPlant,
        },
        "Plant updated successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// Controller function to delete a plant
const deletePlant = async (req, res, next) => {
  const plantId = req.params.plantid;

  try {
    // Delete the plant
    const deletedPlant = await PlantInformation.findByIdAndDelete(plantId);

    // Check if plant exists
    if (!deletedPlant) {
      throw new ApiError(404, "Plant not found");
    }

    // Respond with success
    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Plant deleted successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

// Controller function to retrieve current plant details
const getCurrentPlant = async (req, res, next) => {
  try {
    // Fetch current plant from req.plant (assuming it's set in middleware)
    const plant = req.plant;

    // Populate owner reference field
    await plant.populate('plantowner', 'name email').execPopulate();

    // Respond with success
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          plant,
        },
        "Current plant fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

export {
  createPlant,
  getAllPlants,
  updatePlant,
  deletePlant,
  getCurrentPlant,
};
