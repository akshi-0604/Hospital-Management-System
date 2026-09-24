const express = require("express");

const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController");

const {
  protectRoute,
} = require("../middleware/authMiddleware");

const router = express.Router();
// Create appointment
router.post(
  "/",
  protectRoute,
  createAppointment
);

router.get(
  "/",
  protectRoute,
  getAppointments
);

router.get(
  "/:id",
  protectRoute,
  getAppointmentById
);

router.put(
  "/:id",
  protectRoute,
  updateAppointment
);

router.delete(
  "/:id",
  protectRoute,
  deleteAppointment
);
module.exports = router;
