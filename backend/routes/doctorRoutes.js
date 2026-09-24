const express = require("express");

const {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController");

const {
  protectRoute,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();


// Add doctor
router.post(
  "/",
  protectRoute,
  allowRoles("admin"),
  addDoctor
);


// Get all doctors
router.get(
  "/",
  protectRoute,
  allowRoles("admin"),
  getDoctors
);


// Get one doctor
router.get(
  "/:id",
  protectRoute,
  allowRoles("admin"),
  getDoctorById
);


// Update doctor
router.put(
  "/:id",
  protectRoute,
  allowRoles("admin"),
  updateDoctor
);


// Delete doctor
router.delete(
  "/:id",
  protectRoute,
  allowRoles("admin"),
  deleteDoctor
);


module.exports = router;