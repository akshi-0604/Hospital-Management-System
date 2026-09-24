const express = require("express");

const {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
} = require("../controllers/medicalRecordController");

const {
  protectRoute,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protectRoute,
  createMedicalRecord
);

router.get(
  "/",
  protectRoute,
  getMedicalRecords
);

router.get(
  "/:id",
  protectRoute,
  getMedicalRecordById
);

router.put(
  "/:id",
  protectRoute,
  updateMedicalRecord
);

router.delete(
  "/:id",
  protectRoute,
  deleteMedicalRecord
);
module.exports = router;