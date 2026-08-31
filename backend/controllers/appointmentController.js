const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

const createAppointment = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      department,
      appointmentDate,
      appointmentTime,
      reason,
      notes,
      status,
    } = req.body;

    // Validate required fields
    if (
      !patient ||
      !doctor ||
      !department ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return res.status(400).json({
        message:
          "Please provide all required appointment details.",
      });
    }

    // Check patient exists
    const patientExists = await User.findById(patient);

    if (!patientExists) {
      return res.status(404).json({
        message: "Selected patient was not found.",
      });
    }

    // Check doctor exists in Doctor collection
    const doctorExists = await Doctor.findById(doctor);

    if (!doctorExists) {
      return res.status(404).json({
        message: "Selected doctor was not found.",
      });
    }

    // Create appointment
    const appointment =
      await Appointment.create({
        patient,
        doctor,
        department,
        appointmentDate,
        appointmentTime,
        reason: reason || "",
        notes: notes || "",
        status: status || "Pending",
      });

    // Return appointment with real patient + doctor details
    const populatedAppointment =
      await Appointment.findById(
        appointment._id
      )
        .populate(
          "patient",
          "fullName email phone role"
        )
        .populate(
          "doctor",
          "fullName doctorId email phone specialization department experience qualification consultationFee gender status"
        );

    return res.status(201).json({
      message:
        "Appointment created successfully.",
      appointment:
        populatedAppointment,
    });
  } catch (error) {
    console.error(
      "Create appointment error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to create appointment.",
      error: error.message,
    });
  }
};

const getAppointments = async (
  req,
  res
) => {
  try {
    const appointments =
      await Appointment.find()
        .populate(
          "patient",
          "fullName email phone role"
        )
        .populate(
          "doctor",
          "fullName doctorId email phone specialization department experience qualification consultationFee gender status"
        )
        .sort({
          appointmentDate: 1,
          appointmentTime: 1,
        });

    return res.status(200).json({
      message:
        "Appointments fetched successfully.",
      appointments,
    });
  } catch (error) {
    console.error(
      "Get appointments error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to fetch appointments.",
      error: error.message,
    });
  }
};

const getAppointmentById = async (
  req,
  res
) => {
  try {
    const appointment =
      await Appointment.findById(
        req.params.id
      )
        .populate(
          "patient",
          "fullName email phone role"
        )
        .populate(
          "doctor",
          "fullName doctorId email phone specialization department experience qualification consultationFee gender status"
        );

    if (!appointment) {
      return res.status(404).json({
        message:
          "Appointment not found.",
      });
    }

    return res.status(200).json({
      appointment,
    });
  } catch (error) {
    console.error(
      "Get appointment error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to fetch appointment.",
      error: error.message,
    });
  }
};

const updateAppointment = async (
  req,
  res
) => {
  try {
    const {
      patient,
      doctor,
      department,
      appointmentDate,
      appointmentTime,
      reason,
      notes,
      status,
    } = req.body;

    // If patient is being changed, verify it
    if (patient) {
      const patientExists =
        await User.findById(patient);

      if (!patientExists) {
        return res.status(404).json({
          message:
            "Selected patient was not found.",
        });
      }
    }

    // If doctor is being changed, verify it
    if (doctor) {
      const doctorExists =
        await Doctor.findById(doctor);

      if (!doctorExists) {
        return res.status(404).json({
          message:
            "Selected doctor was not found.",
        });
      }
    }

    const updateData = {};

    if (patient !== undefined) {
      updateData.patient = patient;
    }

    if (doctor !== undefined) {
      updateData.doctor = doctor;
    }

    if (department !== undefined) {
      updateData.department = department;
    }

    if (
      appointmentDate !==
      undefined
    ) {
      updateData.appointmentDate =
        appointmentDate;
    }

    if (
      appointmentTime !==
      undefined
    ) {
      updateData.appointmentTime =
        appointmentTime;
    }

    if (reason !== undefined) {
      updateData.reason = reason;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const appointment =
      await Appointment.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "patient",
          "fullName email phone role"
        )
        .populate(
          "doctor",
          "fullName doctorId email phone specialization department experience qualification consultationFee gender status"
        );

    if (!appointment) {
      return res.status(404).json({
        message:
          "Appointment not found.",
      });
    }

    return res.status(200).json({
      message:
        "Appointment updated successfully.",
      appointment,
    });
  } catch (error) {
    console.error(
      "Update appointment error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update appointment.",
      error: error.message,
    });
  }
};
const deleteAppointment = async (
  req,
  res
) => {
  try {
    const appointment =
      await Appointment.findByIdAndDelete(
        req.params.id
      );

    if (!appointment) {
      return res.status(404).json({
        message:
          "Appointment not found.",
      });
    }

    return res.status(200).json({
      message:
        "Appointment deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete appointment error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to delete appointment.",
      error: error.message,
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};