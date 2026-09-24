const express = require("express");

const {
  getPatients,
  getPatientById,
} = require("../controllers/patientController");

const {
  protectRoute,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();


// Get all patients
router.get(
  "/",
  protectRoute,
  allowRoles("admin"),
  getPatients
);


// Get one patient
router.get(
  "/:id",
  protectRoute,
  allowRoles("admin"),
  getPatientById
);


module.exports = router;