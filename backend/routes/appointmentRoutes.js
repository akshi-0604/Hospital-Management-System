const express = require("express");

const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();

// Create appointment
router.post("/", createAppointment);

// Get all appointments
router.get("/", getAppointments);

// Get one appointment
router.get("/:id", getAppointmentById);

// Update appointment
router.put("/:id", updateAppointment);

// Delete appointment
router.delete("/:id", deleteAppointment);

module.exports = router;