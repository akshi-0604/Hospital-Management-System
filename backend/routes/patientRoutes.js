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
router.get(
    "/",
    protectRoute,
    allowRoles(
        "admin",
        "receptionist"
    ),
    getPatients
);
router.get(
    "/:id",
    protectRoute,
    allowRoles(
        "admin",
        "receptionist"
    ),
    getPatientById
);


module.exports = router;