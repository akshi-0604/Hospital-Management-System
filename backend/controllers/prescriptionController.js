const Prescription = require("../models/Prescription");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const {
  createPatientNotification,
  sendPrescriptionCreatedEmail,
  sendPrescriptionUpdatedEmail,
  sendPrescriptionDeletedEmail,
} = require("../services/patientNotificationService");

const populatePrescription = (query) => {
  return query
    .populate(
      "patient",
      "fullName email phone"
    )
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

    const patientExists =
      await User.findById(patient);

    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const doctorExists =
      await Doctor.findById(doctor);

    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (appointment) {
      const appointmentExists =
        await Appointment.findById(
          appointment
        );

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
        appointment:
          appointment || null,
        prescriptionDate,
        diagnosis: diagnosis || "",
        medications,
        notes: notes || "",
        status,
      });

    const result =
      await populatePrescription(
        Prescription.findById(
          prescription._id
        )
      );

    try {
      await createPatientNotification({
        patientId: patientExists._id,

        type: "prescription",

        title:
          "New Prescription Created",

        message:
          `Dr. ${
            doctorExists.fullName
          } has created a new prescription for you.`,

        metadata: {
          prescriptionId:
            prescription._id,
          doctorId:
            doctorExists._id,
          appointmentId:
            appointment || null,
        },
      });

      await sendPrescriptionCreatedEmail({
        patient: patientExists,
        doctor: doctorExists,
        prescription: result,
      });

      console.log(
        "PRESCRIPTION CREATED NOTIFICATIONS SENT:",
        patientExists.email
      );
    } catch (notificationError) {
      console.error(
        "Prescription creation notification error:",
        notificationError.message
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "Prescription created successfully",
      prescription: result,
    });
  } catch (error) {
    console.error(
      "Create Prescription Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create prescription",
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

    return res.status(200).json({
      success: true,
      message:
        "Prescriptions fetched successfully",
      prescriptions,
    });
  } catch (error) {
    console.error(
      "Get Prescriptions Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch prescriptions",
    });
  }
};

const getPrescriptionById = async (
  req,
  res
) => {
  try {
    const prescription =
      await populatePrescription(
        Prescription.findById(
          req.params.id
        )
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message:
          "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error(
      "Get Prescription By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch prescription",
    });
  }
};

const updatePrescription = async (
  req,
  res
) => {
  try {
    const prescription =
      await Prescription.findById(
        req.params.id
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message:
          "Prescription not found",
      });
    }

    const oldPatientId =
      prescription.patient;

    const oldDoctorId =
      prescription.doctor;

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

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !== undefined
        ) {
          prescription[field] =
            req.body[field] === ""
              ? null
              : req.body[field];
        }
      }
    );

    await prescription.save();

    const patientExists =
      await User.findById(
        prescription.patient
      );

    const doctorExists =
      await Doctor.findById(
        prescription.doctor
      );

    const result =
      await populatePrescription(
        Prescription.findById(
          prescription._id
        )
      );

    try {
      if (patientExists) {
        await createPatientNotification({
          patientId:
            patientExists._id,

          type: "prescription",

          title:
            "Prescription Updated",

          message:
            `Your prescription has been updated by Dr. ${
              doctorExists?.fullName ||
              "your doctor"
            }.`,

          metadata: {
            prescriptionId:
              prescription._id,

            doctorId:
              doctorExists?._id ||
              oldDoctorId,

            previousPatientId:
              oldPatientId,

            previousDoctorId:
              oldDoctorId,
          },
        });

        await sendPrescriptionUpdatedEmail({
          patient: patientExists,
          doctor: doctorExists,
          prescription: result,
        });

        console.log(
          "PRESCRIPTION UPDATE NOTIFICATIONS SENT:",
          patientExists.email
        );
      }
    } catch (notificationError) {
      console.error(
        "Prescription update notification error:",
        notificationError.message
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Prescription updated successfully",
      prescription: result,
    });
  } catch (error) {
    console.error(
      "Update Prescription Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update prescription",
    });
  }
};

const deletePrescription = async (
  req,
  res
) => {
  try {
    const prescription =
      await Prescription.findById(
        req.params.id
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message:
          "Prescription not found",
      });
    }

    const patientExists =
      await User.findById(
        prescription.patient
      );

    const doctorExists =
      await Doctor.findById(
        prescription.doctor
      );

    await Prescription.findByIdAndDelete(
      req.params.id
    );

    try {
      if (patientExists) {
        await createPatientNotification({
          patientId:
            patientExists._id,

          type: "prescription",

          title:
            "Prescription Removed",

          message:
            `A prescription created by Dr. ${
              doctorExists?.fullName ||
              "your doctor"
            } has been removed.`,

          metadata: {
            prescriptionId:
              prescription._id,

            doctorId:
              doctorExists?._id ||
              prescription.doctor,
          },
        });

        await sendPrescriptionDeletedEmail({
          patient: patientExists,
          doctor: doctorExists,
          prescription,
        });

        console.log(
          "PRESCRIPTION DELETE NOTIFICATIONS SENT:",
          patientExists.email
        );
      }
    } catch (notificationError) {
      console.error(
        "Prescription deletion notification error:",
        notificationError.message
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Prescription deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Prescription Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete prescription",
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