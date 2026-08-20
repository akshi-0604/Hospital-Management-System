const express = require("express");

const {
  getPatients,
  getPatientById,
} = require("../controllers/patientController");


const router = express.Router();


// Get all patients
router.get(
  "/",
  getPatients
);


// Get one patient
router.get(
  "/:id",
  getPatientById
);


module.exports = router;