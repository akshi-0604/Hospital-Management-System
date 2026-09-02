const express = require("express");

const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

const router =
  express.Router();


// Create department
router.post(
  "/",
  createDepartment
);


// Get all departments
router.get(
  "/",
  getDepartments
);


// Get one department
router.get(
  "/:id",
  getDepartmentById
);


// Update department
router.put(
  "/:id",
  updateDepartment
);


// Delete department
router.delete(
  "/:id",
  deleteDepartment
);


module.exports = router;