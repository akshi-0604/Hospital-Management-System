const Prescription = require("../models/Prescription");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const populatePrescription = (query) => {
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

const createPrescription = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      appointment,
      prescriptionDate,
      diagnosis,
      medications,
      notes,
      status = "Active",
    } = req.body;

    if (
      !patient ||
      !doctor ||
      !prescriptionDate ||
      !Array.isArray(medications) ||
      medications.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Patient, doctor, date and at least one medicine are required",
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

    const prescription =
      await Prescription.create({
        patient,
        doctor,
        appointment: appointment || null,
        prescriptionDate,
        diagnosis: diagnosis || "",
        medications,
        notes: notes || "",
        status,
      });

    const result = await populatePrescription(
      Prescription.findById(prescription._id)
    );

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: result,
    });
  } catch (error) {
    console.error("Create Prescription Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to create prescription",
    });
  }
};

const getPrescriptions = async (req, res) => {
  try {
    const prescriptions =
      await populatePrescription(
        Prescription.find().sort({
          prescriptionDate: -1,
        })
      );

    res.status(200).json({
      success: true,
      message: "Prescriptions fetched successfully",
      prescriptions,
    });
  } catch (error) {
    console.error("Get Prescriptions Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to fetch prescriptions",
    });
  }
};

const getPrescriptionById = async (req, res) => {
  try {
    const prescription =
      await populatePrescription(
        Prescription.findById(req.params.id)
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error(
      "Get Prescription By ID Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to fetch prescription",
    });
  }
};

const updatePrescription = async (req, res) => {
  try {
    const prescription =
      await Prescription.findById(
        req.params.id
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    const allowedFields = [
      "patient",
      "doctor",
      "appointment",
      "prescriptionDate",
      "diagnosis",
      "medications",
      "notes",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        prescription[field] =
          req.body[field] === ""
            ? null
            : req.body[field];
      }
    });

    await prescription.save();

    const result = await populatePrescription(
      Prescription.findById(prescription._id)
    );

    res.status(200).json({
      success: true,
      message: "Prescription updated successfully",
      prescription: result,
    });
  } catch (error) {
    console.error("Update Prescription Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update prescription",
    });
  }
};

const deletePrescription = async (req, res) => {
  try {
    const prescription =
      await Prescription.findByIdAndDelete(
        req.params.id
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Prescription Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to delete prescription",
    });
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
};