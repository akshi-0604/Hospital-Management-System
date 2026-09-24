const express = require("express");

const {
  createLaboratory,
  getLaboratories,
  getLaboratoryById,
  updateLaboratory,
  deleteLaboratory,
} = require("../controllers/laboratoryController");

const {
  protectRoute,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protectRoute,
  createLaboratory
);

router.get(
  "/",
  protectRoute,
  getLaboratories
);

router.get(
  "/:id",
  protectRoute,
  getLaboratoryById
);

router.put(
  "/:id",
  protectRoute,
  updateLaboratory
);

router.delete(
  "/:id",
  protectRoute,
  deleteLaboratory
);
module.exports = router;