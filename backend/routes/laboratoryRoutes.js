const express = require("express");

const {
  createLaboratory,
  getLaboratories,
  getLaboratoryById,
  updateLaboratory,
  deleteLaboratory,
} = require("../controllers/laboratoryController");

const router = express.Router();

router.post("/", createLaboratory);
router.get("/", getLaboratories);
router.get("/:id", getLaboratoryById);
router.put("/:id", updateLaboratory);
router.delete("/:id", deleteLaboratory);

module.exports = router;