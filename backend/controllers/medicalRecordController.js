const MedicalRecord = require("../models/MedicalRecord");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const populateRecord = (query) => {
  return query
    .populate("patient", "fullName email phone role")
    .populate(
      "doctor",
      "fullName doctorId specialization department"
    )
    .populate(
      "appointment",
      "appointmentDate appointmentTime department status"
    );
};

// CREATE
const createMedicalRecord = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      appointment,
      visitDate,
      symptoms,
      diagnosis,
      treatmentPlan,
      notes,
      bloodPressure,
      pulseRate,
      temperature,
      oxygenLevel,
      weight,
      followUpDate,
      status = "Open",
    } = req.body;

    if (!patient || !doctor || !visitDate || !diagnosis) {
      return res.status(400).json({
        success: false,
        message:
          "Patient, doctor, visit date and diagnosis are required",
      });
    }

    const patientExists = await User.findById(patient);

    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const doctorExists = await Doctor.findById(doctor);

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

    const record = await MedicalRecord.create({
      patient,
      doctor,
      appointment: appointment || null,
      visitDate,
      symptoms: symptoms || "",
      diagnosis,
      treatmentPlan: treatmentPlan || "",
      notes: notes || "",
      bloodPressure: bloodPressure || "",
      pulseRate:
        pulseRate === "" || pulseRate === undefined
          ? null
          : Number(pulseRate),
      temperature:
        temperature === "" || temperature === undefined
          ? null
          : Number(temperature),
      oxygenLevel:
        oxygenLevel === "" || oxygenLevel === undefined
          ? null
          : Number(oxygenLevel),
      weight:
        weight === "" || weight === undefined
          ? null
          : Number(weight),
      followUpDate: followUpDate || null,
      status,
    });

    const result = await populateRecord(
      MedicalRecord.findById(record._id)
    );

    res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      record: result,
    });
  } catch (error) {
    console.error("Create Medical Record Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to create medical record",
    });
  }
};

// GET ALL
const getMedicalRecords = async (req, res) => {
  try {
    const records = await populateRecord(
      MedicalRecord.find().sort({ visitDate: -1 })
    );

    res.status(200).json({
      success: true,
      message: "Medical records fetched successfully",
      records,
    });
  } catch (error) {
    console.error("Get Medical Records Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to fetch medical records",
    });
  }
};

// GET ONE
const getMedicalRecordById = async (req, res) => {
  try {
    const record = await populateRecord(
      MedicalRecord.findById(req.params.id)
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    console.error("Get Medical Record Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to fetch medical record",
    });
  }
};

// UPDATE
const updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(
      req.params.id
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    const fields = [
      "patient",
      "doctor",
      "appointment",
      "visitDate",
      "symptoms",
      "diagnosis",
      "treatmentPlan",
      "notes",
      "bloodPressure",
      "followUpDate",
      "status",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        record[field] =
          req.body[field] === ""
            ? field === "appointment" ||
              field === "followUpDate"
              ? null
              : ""
            : req.body[field];
      }
    });

    if (req.body.pulseRate !== undefined) {
      record.pulseRate =
        req.body.pulseRate === ""
          ? null
          : Number(req.body.pulseRate);
    }

    if (req.body.temperature !== undefined) {
      record.temperature =
        req.body.temperature === ""
          ? null
          : Number(req.body.temperature);
    }

    if (req.body.oxygenLevel !== undefined) {
      record.oxygenLevel =
        req.body.oxygenLevel === ""
          ? null
          : Number(req.body.oxygenLevel);
    }

    if (req.body.weight !== undefined) {
      record.weight =
        req.body.weight === ""
          ? null
          : Number(req.body.weight);
    }

    await record.save();

    const result = await populateRecord(
      MedicalRecord.findById(record._id)
    );

    res.status(200).json({
      success: true,
      message: "Medical record updated successfully",
      record: result,
    });
  } catch (error) {
    console.error("Update Medical Record Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update medical record",
    });
  }
};

// DELETE
const deleteMedicalRecord = async (req, res) => {
  try {
    const record =
      await MedicalRecord.findByIdAndDelete(
        req.params.id
      );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medical record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Medical Record Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to delete medical record",
    });
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
};