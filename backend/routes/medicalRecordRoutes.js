const express = require("express");

const {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
} = require("../controllers/medicalRecordController");

const router = express.Router();

router.post("/", createMedicalRecord);
router.get("/", getMedicalRecords);
router.get("/:id", getMedicalRecordById);
router.put("/:id", updateMedicalRecord);
router.delete("/:id", deleteMedicalRecord);

module.exports = router;