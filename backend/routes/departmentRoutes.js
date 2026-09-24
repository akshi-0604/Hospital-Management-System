const express = require("express");

const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

const {
  protectRoute,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protectRoute,
  allowRoles("admin"),
  createDepartment
);

router.get(
  "/",
  protectRoute,
  allowRoles("admin"),
  getDepartments
);

router.get(
  "/:id",
  protectRoute,
  allowRoles("admin"),
  getDepartmentById
);

router.put(
  "/:id",
  protectRoute,
  allowRoles("admin"),
  updateDepartment
);

router.delete(
  "/:id",
  protectRoute,
  allowRoles("admin"),
  deleteDepartment
);
module.exports = router;