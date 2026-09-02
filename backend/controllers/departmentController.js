const Department = require("../models/Department");
const Doctor = require("../models/Doctor");
const createDepartment = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      location,
      headDoctor,
      status,
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message:
          "Department name and code are required.",
      });
    }

    const normalizedName =
      name.trim();

    const normalizedCode =
      code.trim().toUpperCase();

    const existingDepartment =
      await Department.findOne({
        $or: [
          {
            name: normalizedName,
          },
          {
            code: normalizedCode,
          },
        ],
      });

    if (existingDepartment) {
      return res.status(409).json({
        message:
          "A department with this name or code already exists.",
      });
    }

    // Check head doctor if provided
    if (headDoctor) {
      const doctor =
        await Doctor.findById(
          headDoctor
        );

      if (!doctor) {
        return res.status(404).json({
          message:
            "Selected head doctor was not found.",
        });
      }
    }

    const department =
      await Department.create({
        name: normalizedName,

        code: normalizedCode,

        description:
          description || "",

        location:
          location || "",

        headDoctor:
          headDoctor || null,

        status:
          status || "Active",
      });

    const populatedDepartment =
      await Department.findById(
        department._id
      ).populate(
        "headDoctor",
        "fullName doctorId specialization department status"
      );

    return res.status(201).json({
      message:
        "Department created successfully.",
      department:
        populatedDepartment,
    });

  } catch (error) {
    console.error(
      "Create department error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to create department.",
    });
  }
};
const getDepartments = async (
  req,
  res
) => {
  try {
    const departments =
      await Department.find()
        .populate(
          "headDoctor",
          "fullName doctorId specialization department status"
        )
        .sort({
          createdAt: -1,
        });

    // Get doctor count for each department
    const departmentsWithCounts =
      await Promise.all(
        departments.map(
          async (department) => {

            const doctorCount =
              await Doctor.countDocuments(
                {
                  department:
                    department.name,
                }
              );

            return {
              ...department.toObject(),
              doctorCount,
            };
          }
        )
      );

    return res.status(200).json({
      message:
        "Departments fetched successfully.",
      departments:
        departmentsWithCounts,
    });

  } catch (error) {
    console.error(
      "Get departments error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to fetch departments.",
    });
  }
};
const getDepartmentById = async (
  req,
  res
) => {
  try {
    const department =
      await Department.findById(
        req.params.id
      ).populate(
        "headDoctor",
        "fullName doctorId specialization department status"
      );

    if (!department) {
      return res.status(404).json({
        message:
          "Department not found.",
      });
    }

    const doctorCount =
      await Doctor.countDocuments({
        department:
          department.name,
      });

    return res.status(200).json({
      department: {
        ...department.toObject(),
        doctorCount,
      },
    });

  } catch (error) {
    console.error(
      "Get department error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to fetch department.",
    });
  }
};
const updateDepartment = async (
  req,
  res
) => {
  try {
    const {
      name,
      code,
      description,
      location,
      headDoctor,
      status,
    } = req.body;

    const department =
      await Department.findById(
        req.params.id
      );

    if (!department) {
      return res.status(404).json({
        message:
          "Department not found.",
      });
    }

    if (headDoctor) {
      const doctor =
        await Doctor.findById(
          headDoctor
        );

      if (!doctor) {
        return res.status(404).json({
          message:
            "Selected head doctor was not found.",
        });
      }
    }

    const oldName =
      department.name;

    const newName =
      name !== undefined &&
      name.trim() !== ""
        ? name.trim()
        : department.name;

    const newCode =
      code !== undefined &&
      code.trim() !== ""
        ? code.trim().toUpperCase()
        : department.code;

    // Check duplicate name/code
    const duplicate =
      await Department.findOne({
        _id: {
          $ne: department._id,
        },
        $or: [
          {
            name: newName,
          },
          {
            code: newCode,
          },
        ],
      });

    if (duplicate) {
      return res.status(409).json({
        message:
          "Another department already uses this name or code.",
      });
    }

    department.name =
      newName;

    department.code =
      newCode;

    department.description =
      description !== undefined
        ? description
        : department.description;

    department.location =
      location !== undefined
        ? location
        : department.location;

    department.headDoctor =
      headDoctor !== undefined
        ? headDoctor || null
        : department.headDoctor;

    department.status =
      status !== undefined
        ? status
        : department.status;

    await department.save();

    if (oldName !== newName) {
      await Doctor.updateMany(
        {
          department: oldName,
        },
        {
          $set: {
            department: newName,
          },
        }
      );
    }

    const populatedDepartment =
      await Department.findById(
        department._id
      ).populate(
        "headDoctor",
        "fullName doctorId specialization department status"
      );

    return res.status(200).json({
      message:
        "Department updated successfully.",
      department:
        populatedDepartment,
    });

  } catch (error) {
    console.error(
      "Update department error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update department.",
    });
  }
};

const deleteDepartment = async (
  req,
  res
) => {
  try {
    const department =
      await Department.findById(
        req.params.id
      );

    if (!department) {
      return res.status(404).json({
        message:
          "Department not found.",
      });
    }
    const doctorCount =
      await Doctor.countDocuments({
        department:
          department.name,
      });

    if (doctorCount > 0) {
      return res.status(409).json({
        message:
          "This department cannot be deleted because doctors are still assigned to it.",
      });
    }

    await Department.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      message:
        "Department deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete department error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to delete department.",
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