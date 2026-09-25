const Laboratory = require("../models/Laboratory");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const {
  createPatientNotification,
  sendLaboratoryTestOrderedEmail,
  sendLaboratoryDoctorNotificationEmail,
  sendLaboratoryReportAvailableEmail,
  sendLaboratoryUpdatedEmail,
  sendLaboratoryDeletedEmail,
} = require("../services/patientNotificationService");

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

    const lab = await Laboratory.create({
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

    try {
      
      await createPatientNotification({
        patientId: patient,
        type: "laboratory",
        title:
          status === "Completed"
            ? "Lab Report Available"
            : "Laboratory Test Ordered",
        message:
          status === "Completed"
            ? `Your ${testName} laboratory report is now available.`
            : `A ${testName} laboratory test has been ordered for you.`,
        metadata: {
          laboratoryId: lab._id,
          doctorId: doctor,
          appointmentId: appointment || null,
        },
      });

      if (
        status === "Completed" &&
        result
      ) {
        await sendLaboratoryReportAvailableEmail({
          patient: patientExists,
          doctor: doctorExists,
          laboratory: resultData,
        });
      } else {
      
        await sendLaboratoryTestOrderedEmail({
          patient: patientExists,
          doctor: doctorExists,
          laboratory: resultData,
        });
      }

      await sendLaboratoryDoctorNotificationEmail({
        doctor: doctorExists,
        patient: patientExists,
        laboratory: resultData,
      });
    } catch (notificationError) {
      console.error(
        "Laboratory notification error:",
        notificationError.message
      );
    }

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
    const laboratories = await populateLab(
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
    const laboratory = await populateLab(
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
      await Laboratory.findById(req.params.id);

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: "Laboratory record not found",
      });
    }

    const oldStatus = laboratory.status;
    const oldResult = laboratory.result;

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

    const resultData = await populateLab(
      Laboratory.findById(laboratory._id)
    );

    const patient = await User.findById(
      laboratory.patient
    );

    const doctor = await Doctor.findById(
      laboratory.doctor
    );

    try {
      const becameCompleted =
        laboratory.status === "Completed" &&
        oldStatus !== "Completed";

      const resultWasAdded =
        laboratory.status === "Completed" &&
        laboratory.result &&
        !oldResult;

      if (
        becameCompleted ||
        resultWasAdded
      ) {
        await createPatientNotification({
          patientId: laboratory.patient,
          type: "laboratory",
          title: "Lab Report Available",
          message: `Your ${laboratory.testName} laboratory report is now available.`,
          metadata: {
            laboratoryId: laboratory._id,
            doctorId: laboratory.doctor,
            appointmentId:
              laboratory.appointment || null,
          },
        });

        await sendLaboratoryReportAvailableEmail({
          patient,
          doctor,
          laboratory: resultData,
        });
      } else {
        await createPatientNotification({
          patientId: laboratory.patient,
          type: "laboratory",
          title: "Laboratory Record Updated",
          message: `Your ${laboratory.testName} laboratory record has been updated.`,
          metadata: {
            laboratoryId: laboratory._id,
            doctorId: laboratory.doctor,
            appointmentId:
              laboratory.appointment || null,
          },
        });

        await sendLaboratoryUpdatedEmail({
          patient,
          doctor,
          laboratory: resultData,
        });
      }
    } catch (notificationError) {
      console.error(
        "Laboratory update notification error:",
        notificationError.message
      );
    }

    res.status(200).json({
      success: true,
      message: "Laboratory record updated successfully",
      laboratory: resultData,
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
      await Laboratory.findById(req.params.id);

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: "Laboratory record not found",
      });
    }

    const patient = await User.findById(
      laboratory.patient
    );

    const doctor = await Doctor.findById(
      laboratory.doctor
    );

    const laboratoryId = laboratory._id;

    await Laboratory.findByIdAndDelete(
      req.params.id
    );

    try {
      await createPatientNotification({
        patientId: laboratory.patient,
        type: "laboratory",
        title: "Laboratory Record Removed",
        message: `Your ${laboratory.testName} laboratory record has been removed from the system.`,
        metadata: {
          laboratoryId,
          doctorId: laboratory.doctor,
        },
      });

      await sendLaboratoryDeletedEmail({
        patient,
        doctor,
        laboratory,
      });
    } catch (notificationError) {
      console.error(
        "Laboratory deletion notification error:",
        notificationError.message
      );
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