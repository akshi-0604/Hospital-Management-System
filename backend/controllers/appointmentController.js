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

    // Check doctor exists
    const doctorExists = await Doctor.findById(doctor);

    if (!doctorExists) {
      return res.status(404).json({
        message: "Selected doctor was not found.",
      });
    }

    if (doctorExists.status !== "Available") {
      return res.status(409).json({
        message:
          `Dr. ${doctorExists.fullName} is currently ${doctorExists.status.toLowerCase()}. Please select another doctor.`,
      });
    }
    const conflictingAppointment =
      await Appointment.findOne({
        doctor: doctor,
        appointmentDate: new Date(appointmentDate),
        appointmentTime: appointmentTime,
        status: {
          $in: ["Pending", "Confirmed"],
        },
      });

    if (conflictingAppointment) {
      return res.status(409).json({
        message:
          `Dr. ${doctorExists.fullName} is already booked on ${appointmentDate} at ${appointmentTime}. Please choose another time.`,
      });
    }
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
    const existingAppointment =
      await Appointment.findById(
        req.params.id
      );

    if (!existingAppointment) {
      return res.status(404).json({
        message:
          "Appointment not found.",
      });
    }

    // Use existing values when fields
    // are not being changed
    const finalPatient =
      patient !== undefined
        ? patient
        : existingAppointment.patient;

    const finalDoctor =
      doctor !== undefined
        ? doctor
        : existingAppointment.doctor;

    const finalDate =
      appointmentDate !== undefined
        ? appointmentDate
        : existingAppointment.appointmentDate;

    const finalTime =
      appointmentTime !== undefined
        ? appointmentTime
        : existingAppointment.appointmentTime;

    const finalDepartment =
      department !== undefined
        ? department
        : existingAppointment.department;

    const finalStatus =
      status !== undefined
        ? status
        : existingAppointment.status;


    const patientExists =
      await User.findById(finalPatient);

    if (!patientExists) {
      return res.status(404).json({
        message:
          "Selected patient was not found.",
      });
    }
    const doctorExists =
      await Doctor.findById(finalDoctor);

    if (!doctorExists) {
      return res.status(404).json({
        message:
          "Selected doctor was not found.",
      });
    }

    const doctorWasChanged =
      String(finalDoctor) !==
      String(existingAppointment.doctor);

    if (
      doctorWasChanged &&
      doctorExists.status !== "Available"
    ) {
      return res.status(409).json({
        message:
          `Dr. ${doctorExists.fullName} is currently ${doctorExists.status.toLowerCase()}. Please select an available doctor.`,
      });
    }

    const conflict =
      await Appointment.findOne({
        _id: {
          $ne: existingAppointment._id,
        },

        doctor: finalDoctor,

        appointmentDate:
          new Date(finalDate),

        appointmentTime: finalTime,

        status: {
          $in: ["Pending", "Confirmed"],
        },
      });

    if (conflict) {
      return res.status(409).json({
        message:
          `Dr. ${doctorExists.fullName} is already booked on ${finalDate} at ${finalTime}. Please choose another time.`,
      });
    }

    const updateData = {
      patient: finalPatient,
      doctor: finalDoctor,
      department: finalDepartment,
      appointmentDate: finalDate,
      appointmentTime: finalTime,
      reason:
        reason !== undefined
          ? reason
          : existingAppointment.reason,
      notes:
        notes !== undefined
          ? notes
          : existingAppointment.notes,
      status: finalStatus,
    };

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