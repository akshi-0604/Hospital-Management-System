const Laboratory = require("../models/Laboratory");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const populateLab = (query) => {
  return query
    .populate("patient", "fullName email phone")
    .populate(
      "doctor",
      "fullName doctorId specialization department"
    )
    .populate(
      "appointment",
      "appointmentDate appointmentTime department"
    );
};

const createLaboratory = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      appointment,
      testName,
      category,
      testDate,
      result,
      unit,
      referenceRange,
      notes,
      status = "Ordered",
    } = req.body;

    if (
      !patient ||
      !doctor ||
      !testName ||
      !category ||
      !testDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Patient, doctor, test name, category and test date are required",
      });
    }

    const patientExists = await User.findById(patient);
    const doctorExists = await Doctor.findById(doctor);

    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (appointment) {
      const appointmentExists =
        await Appointment.findById(appointment);

      if (!appointmentExists) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }
    }

    const lab =
      await Laboratory.create({
        patient,
        doctor,
        appointment: appointment || null,
        testName,
        category,
        testDate,
        result: result || "",
        unit: unit || "",
        referenceRange: referenceRange || "",
        notes: notes || "",
        status,
      });

    const resultData = await populateLab(
      Laboratory.findById(lab._id)
    );

    res.status(201).json({
      success: true,
      message: "Laboratory record created successfully",
      laboratory: resultData,
    });
  } catch (error) {
    console.error("Create Laboratory Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create laboratory record",
    });
  }
};

const getLaboratories = async (req, res) => {
  try {
    const laboratories =
      await populateLab(
        Laboratory.find().sort({
          testDate: -1,
        })
      );

    res.status(200).json({
      success: true,
      message: "Laboratory records fetched successfully",
      laboratories,
    });
  } catch (error) {
    console.error("Get Laboratory Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch laboratory records",
    });
  }
};

const getLaboratoryById = async (req, res) => {
  try {
    const laboratory =
      await populateLab(
        Laboratory.findById(req.params.id)
      );

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: "Laboratory record not found",
      });
    }

    res.status(200).json({
      success: true,
      laboratory,
    });
  } catch (error) {
    console.error(
      "Get Laboratory By ID Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch laboratory record",
    });
  }
};

const updateLaboratory = async (req, res) => {
  try {
    const laboratory =
      await Laboratory.findById(
        req.params.id
      );

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: "Laboratory record not found",
      });
    }

    const fields = [
      "patient",
      "doctor",
      "appointment",
      "testName",
      "category",
      "testDate",
      "result",
      "unit",
      "referenceRange",
      "notes",
      "status",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        laboratory[field] =
          req.body[field] === ""
            ? field === "appointment"
              ? null
              : ""
            : req.body[field];
      }
    });

    await laboratory.save();

    const result = await populateLab(
      Laboratory.findById(laboratory._id)
    );

    res.status(200).json({
      success: true,
      message: "Laboratory record updated successfully",
      laboratory: result,
    });
  } catch (error) {
    console.error(
      "Update Laboratory Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update laboratory record",
    });
  }
};

const deleteLaboratory = async (req, res) => {
  try {
    const laboratory =
      await Laboratory.findByIdAndDelete(
        req.params.id
      );

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: "Laboratory record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Laboratory record deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Laboratory Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete laboratory record",
    });
  }
};

module.exports = {
  createLaboratory,
  getLaboratories,
  getLaboratoryById,
  updateLaboratory,
  deleteLaboratory,
};