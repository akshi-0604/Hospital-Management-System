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
router.post(
    "/",
    protectRoute,
    allowRoles("admin"),
    addDoctor
);

router.get(
    "/",
    protectRoute,
    allowRoles(
        "admin",
        "doctor",
        "receptionist",
        "patient"
    ),
    getDoctors
);

router.get(
    "/:id",
    protectRoute,
    allowRoles(
        "admin",
        "doctor",
        "receptionist",
        "patient"
    ),
    getDoctorById
);

router.put(
    "/:id",
    protectRoute,
    allowRoles("admin"),
    updateDoctor
);
router.delete(
    "/:id",
    protectRoute,
    allowRoles("admin"),
    deleteDoctor
);


module.exports = router;