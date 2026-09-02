const Department = require("../models/Department");
const Doctor = require("../models/Doctor");

// Create Department
const createDepartment = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      location,
      headDoctor,
      doctors = [],
      status = "Active",
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Department name and code are required",
      });
    }

    const departmentName = name.trim();
    const departmentCode = code.trim().toUpperCase();

    // Check duplicate department name
    const existingName = await Department.findOne({
      name: {
        $regex: `^${departmentName}$`,
        $options: "i",
      },
    });

    if (existingName) {
      return res.status(409).json({
        success: false,
        message: "Department with this name already exists",
      });
    }

    // Check duplicate code
    const existingCode = await Department.findOne({
      code: departmentCode,
    });

    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: "Department with this code already exists",
      });
    }

    // Make sure doctors is always an array
    const doctorIds = Array.isArray(doctors) ? doctors : [];

    // Validate selected doctors
    if (doctorIds.length > 0) {
      const foundDoctors = await Doctor.find({
        _id: { $in: doctorIds },
      });

      if (foundDoctors.length !== doctorIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more selected doctors were not found",
        });
      }
    }

    // Head doctor must exist
    if (headDoctor) {
      const headDoctorExists = await Doctor.findById(headDoctor);

      if (!headDoctorExists) {
        return res.status(404).json({
          success: false,
          message: "Selected head doctor was not found",
        });
      }

      // Automatically make head doctor part of department doctors
      if (!doctorIds.includes(String(headDoctor))) {
        doctorIds.push(String(headDoctor));
      }
    }

    // Create department
    const department = await Department.create({
      name: departmentName,
      code: departmentCode,
      description: description || "",
      location: location || "",
      headDoctor: headDoctor || null,
      doctors: doctorIds,
      status,
    });

    // Update selected doctors' department
    if (doctorIds.length > 0) {
      await Doctor.updateMany(
        {
          _id: { $in: doctorIds },
        },
        {
          $set: {
            department: departmentName,
          },
        }
      );
    }

    const populatedDepartment = await Department.findById(
      department._id
    )
      .populate("headDoctor", "fullName doctorId specialization department")
      .populate("doctors", "fullName doctorId specialization department");

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department: populatedDepartment,
    });
  } catch (error) {
    console.error("Create Department Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create department",
    });
  }
};

// Get All Departments
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("headDoctor", "fullName doctorId specialization department")
      .populate("doctors", "fullName doctorId specialization department")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Get Departments Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch departments",
    });
  }
};

// Get Department By ID
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate("headDoctor", "fullName doctorId specialization department")
      .populate("doctors", "fullName doctorId specialization department");

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    console.error("Get Department By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch department",
    });
  }
};

// Update Department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      code,
      description,
      location,
      headDoctor,
      doctors = [],
      status,
    } = req.body;

    const existingDepartment = await Department.findById(id);

    if (!existingDepartment) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const oldDepartmentName = existingDepartment.name;

    const updatedName = name
      ? name.trim()
      : existingDepartment.name;

    const updatedCode = code
      ? code.trim().toUpperCase()
      : existingDepartment.code;

    // Check duplicate name
    const duplicateName = await Department.findOne({
      name: {
        $regex: `^${updatedName}$`,
        $options: "i",
      },
      _id: { $ne: id },
    });

    if (duplicateName) {
      return res.status(409).json({
        success: false,
        message: "Another department already uses this name",
      });
    }

    // Check duplicate code
    const duplicateCode = await Department.findOne({
      code: updatedCode,
      _id: { $ne: id },
    });

    if (duplicateCode) {
      return res.status(409).json({
        success: false,
        message: "Another department already uses this code",
      });
    }

    const doctorIds = Array.isArray(doctors)
      ? [...doctors]
      : [...(existingDepartment.doctors || [])];

    // Validate selected doctors
    if (doctorIds.length > 0) {
      const foundDoctors = await Doctor.find({
        _id: { $in: doctorIds },
      });

      if (foundDoctors.length !== doctorIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more selected doctors were not found",
        });
      }
    }

    // Validate head doctor
    const updatedHeadDoctor =
      headDoctor !== undefined
        ? headDoctor || null
        : existingDepartment.headDoctor;

    if (updatedHeadDoctor) {
      const headDoctorExists = await Doctor.findById(
        updatedHeadDoctor
      );

      if (!headDoctorExists) {
        return res.status(404).json({
          success: false,
          message: "Selected head doctor was not found",
        });
      }

      // Head doctor must also be part of department doctors
      if (!doctorIds.includes(String(updatedHeadDoctor))) {
        doctorIds.push(String(updatedHeadDoctor));
      }
    }

    // Find old doctors assigned to this department
    const oldDoctorIds = (existingDepartment.doctors || []).map(
      (doctor) => String(doctor)
    );

    // Remove doctors that are no longer selected
    const removedDoctorIds = oldDoctorIds.filter(
      (doctorId) => !doctorIds.includes(doctorId)
    );

    if (removedDoctorIds.length > 0) {
      await Doctor.updateMany(
        {
          _id: { $in: removedDoctorIds },
          department: oldDepartmentName,
        },
        {
          $set: {
            department: "",
          },
        }
      );
    }

    // Update selected doctors
    if (doctorIds.length > 0) {
      await Doctor.updateMany(
        {
          _id: { $in: doctorIds },
        },
        {
          $set: {
            department: updatedName,
          },
        }
      );
    }

    // If department name changed, update all its doctors
    if (oldDepartmentName !== updatedName) {
      await Doctor.updateMany(
        {
          department: oldDepartmentName,
        },
        {
          $set: {
            department: updatedName,
          },
        }
      );
    }

    existingDepartment.name = updatedName;
    existingDepartment.code = updatedCode;
    existingDepartment.description =
      description !== undefined
        ? description
        : existingDepartment.description;
    existingDepartment.location =
      location !== undefined
        ? location
        : existingDepartment.location;
    existingDepartment.headDoctor = updatedHeadDoctor;
    existingDepartment.doctors = doctorIds;

    if (status) {
      existingDepartment.status = status;
    }

    await existingDepartment.save();

    const populatedDepartment = await Department.findById(id)
      .populate("headDoctor", "fullName doctorId specialization department")
      .populate("doctors", "fullName doctorId specialization department");

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department: populatedDepartment,
    });
  } catch (error) {
    console.error("Update Department Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update department",
    });
  }
};

// Delete Department
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Don't allow deletion when doctors are assigned
    const assignedDoctors = await Doctor.countDocuments({
      department: department.name,
    });

    if (assignedDoctors > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete this department because doctors are still assigned to it",
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete Department Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete department",
    });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};