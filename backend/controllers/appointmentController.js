const Appointment = require("../models/Appointment");

// Create appointment
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

    if (
      !patient ||
      !doctor ||
      !department ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return res.status(400).json({
        message: "Please provide all required appointment details.",
      });
    }

    const appointment = await Appointment.create({
      patient,
      doctor,
      department,
      appointmentDate,
      appointmentTime,
      reason: reason || "",
      notes: notes || "",
      status: status || "Pending",
    });

    const populatedAppointment = await Appointment.findById(
      appointment._id
    )
      .populate("patient", "fullName email phone")
      .populate("doctor", "fullName email phone");

    return res.status(201).json({
      message: "Appointment created successfully.",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    return res.status(500).json({
      message: "Unable to create appointment.",
      error: error.message,
    });
  }
};


// Get all appointments
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "fullName email phone")
      .populate("doctor", "fullName email phone")
      .sort({
        appointmentDate: 1,
        appointmentTime: 1,
      });

    return res.status(200).json({
      appointments,
    });
  } catch (error) {
    console.error("Get appointments error:", error);

    return res.status(500).json({
      message: "Unable to fetch appointments.",
      error: error.message,
    });
  }
};


// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "fullName email phone")
      .populate("doctor", "fullName email phone");

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found.",
      });
    }

    return res.status(200).json({
      appointment,
    });
  } catch (error) {
    console.error("Get appointment error:", error);

    return res.status(500).json({
      message: "Unable to fetch appointment.",
      error: error.message,
    });
  }
};


// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("patient", "fullName email phone")
      .populate("doctor", "fullName email phone");

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found.",
      });
    }

    return res.status(200).json({
      message: "Appointment updated successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);

    return res.status(500).json({
      message: "Unable to update appointment.",
      error: error.message,
    });
  }
};


// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(
      req.params.id
    );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found.",
      });
    }

    return res.status(200).json({
      message: "Appointment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete appointment error:", error);

    return res.status(500).json({
      message: "Unable to delete appointment.",
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