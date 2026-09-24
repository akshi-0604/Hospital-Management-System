const express = require("express");

const {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
} = require("../controllers/prescriptionController");

const {
  protectRoute,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protectRoute,
  createPrescription
);

router.get(
  "/",
  protectRoute,
  getPrescriptions
);

router.get(
  "/:id",
  protectRoute,
  getPrescriptionById
);

router.put(
  "/:id",
  protectRoute,
  updatePrescription
);

router.delete(
  "/:id",
  protectRoute,
  deletePrescription
);
module.exports = router;