const Appointment = require("../models/Appointment");
const User = require("../models/User");

async function createAppointment(req, res) {
  try {
    const {
      patient,
      doctor,
      department,
      appointmentDate,
      appointmentTime,
      reason,
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
        message:
          "Patient, doctor, department, date and time are required.",
      });
    }

    const patientUser = await User.findById(patient);

    if (!patientUser) {
      return res.status(404).json({
        message: "Patient not found.",
      });
    }

    const doctorUser = await User.findById(doctor);

    if (!doctorUser) {
      return res.status(404).json({
        message: "Doctor not found.",
      });
    }

    if (patientUser.role !== "patient") {
      return res.status(400).json({
        message: "Selected user is not a patient.",
      });
    }

    if (doctorUser.role !== "doctor") {
      return res.status(400).json({
        message: "Selected user is not a doctor.",
      });
    }

    const appointment = await Appointment.create({
      patient,
      doctor,
      department,
      appointmentDate,
      appointmentTime,
      reason: reason || "",
      status: status || "Pending",
    });

    const populatedAppointment =
      await Appointment.findById(appointment._id)
        .populate("patient", "fullName email phone")
        .populate("doctor", "fullName email phone");

    res.status(201).json({
      message: "Appointment created successfully.",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error(
      "Create appointment error:",
      error
    );

    res.status(500).json({
      message: "Unable to create appointment.",
      error: error.message,
    });
  }
}
async function getAppointments(req, res) {
  try {
    const appointments =
      await Appointment.find()
        .populate(
          "patient",
          "fullName email phone"
        )
        .populate(
          "doctor",
          "fullName email phone"
        )
        .sort({
          appointmentDate: 1,
          appointmentTime: 1,
        });

    res.status(200).json({
      message: "Appointments fetched successfully.",
      appointments,
    });
  } catch (error) {
    console.error(
      "Get appointments error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch appointments.",
      error: error.message,
    });
  }
}
async function getAppointmentById(req, res) {
  try {
    const appointment =
      await Appointment.findById(req.params.id)
        .populate(
          "patient",
          "fullName email phone"
        )
        .populate(
          "doctor",
          "fullName email phone"
        );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found.",
      });
    }

    res.status(200).json({
      message: "Appointment fetched successfully.",
      appointment,
    });
  } catch (error) {
    console.error(
      "Get appointment error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch appointment.",
      error: error.message,
    });
  }
}

async function updateAppointment(req, res) {
  try {
    const {
      patient,
      doctor,
      department,
      appointmentDate,
      appointmentTime,
      reason,
      status,
    } = req.body;

    const appointment =
      await Appointment.findById(
        req.params.id
      );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found.",
      });
    }

    if (patient) {
      const patientUser =
        await User.findById(patient);

      if (!patientUser) {
        return res.status(404).json({
          message: "Patient not found.",
        });
      }

      if (patientUser.role !== "patient") {
        return res.status(400).json({
          message:
            "Selected user is not a patient.",
        });
      }

      appointment.patient = patient;
    }

    if (doctor) {
      const doctorUser =
        await User.findById(doctor);

      if (!doctorUser) {
        return res.status(404).json({
          message: "Doctor not found.",
        });
      }

      if (doctorUser.role !== "doctor") {
        return res.status(400).json({
          message:
            "Selected user is not a doctor.",
        });
      }

      appointment.doctor = doctor;
    }

    if (department !== undefined) {
      appointment.department = department;
    }

    if (appointmentDate !== undefined) {
      appointment.appointmentDate =
        appointmentDate;
    }

    if (appointmentTime !== undefined) {
      appointment.appointmentTime =
        appointmentTime;
    }

    if (reason !== undefined) {
      appointment.reason = reason;
    }

    if (status !== undefined) {
      appointment.status = status;
    }

    await appointment.save();

    const updatedAppointment =
      await Appointment.findById(
        appointment._id
      )
        .populate(
          "patient",
          "fullName email phone"
        )
        .populate(
          "doctor",
          "fullName email phone"
        );

    res.status(200).json({
      message:
        "Appointment updated successfully.",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error(
      "Update appointment error:",
      error
    );

    res.status(500).json({
      message: "Unable to update appointment.",
      error: error.message,
    });
  }
}
async function deleteAppointment(req, res) {
  try {
    const appointment =
      await Appointment.findById(
        req.params.id
      );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found.",
      });
    }

    await Appointment.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message:
        "Appointment deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete appointment error:",
      error
    );

    res.status(500).json({
      message: "Unable to delete appointment.",
      error: error.message,
    });
  }
}

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
