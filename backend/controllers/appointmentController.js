const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");

const {
  createPatientNotification,
  sendAppointmentEmail,
} = require("../services/patientNotificationService");

function hasAppointmentPassed(
  appointmentDate,
  appointmentTime
) {
  if (
    !appointmentDate ||
    !appointmentTime
  ) {
    return false;
  }

  const storedDate =
    new Date(appointmentDate);

  if (
    Number.isNaN(
      storedDate.getTime()
    )
  ) {
    return false;
  }
  const year =
    storedDate.getUTCFullYear();

  const month =
    String(
      storedDate.getUTCMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      storedDate.getUTCDate()
    ).padStart(2, "0");

  const timeParts =
    String(appointmentTime)
      .split(":");

  const hour =
    String(
      Number(
        timeParts[0] || 0
      )
    ).padStart(2, "0");

  const minute =
    String(
      Number(
        timeParts[1] || 0
      )
    ).padStart(2, "0");

  const appointmentDateTime =
    new Date(
      `${year}-${month}-${day}T${hour}:${minute}:00+05:30`
    );

  if (
    Number.isNaN(
      appointmentDateTime.getTime()
    )
  ) {
    return false;
  }

  return (
    appointmentDateTime.getTime() <
    Date.now()
  );
}

async function updatePastAppointments() {
  try {
    const appointments =
      await Appointment.find({
        status: {
          $in: [
            "Pending",
            "Confirmed",
          ],
        },
      });

    for (
      const appointment
      of appointments
    ) {
      const passed =
        hasAppointmentPassed(
          appointment.appointmentDate,
          appointment.appointmentTime
        );

      if (!passed) {
        continue;
      }

      const previousStatus =
        appointment.status;

      appointment.status =
        "Completed";

      await appointment.save();

      console.log(
        `Appointment ${appointment._id} status changed from ${previousStatus} to Completed`
      );

      try {
        const patient =
          await User.findById(
            appointment.patient
          );

        const doctor =
          await Doctor.findById(
            appointment.doctor
          );

        const department =
          await Department.findOne({
            name:
              appointment.department,
          });

        if (
          patient &&
          doctor
        ) {
          const location =
            department?.location ||
            "Please contact hospital reception";

          await createPatientNotification({
            patientId:
              patient._id,

            type:
              "Appointment Updated",

            title:
              "Appointment Completed",

            message:
              `Your appointment with Dr. ${doctor.fullName} has been marked as completed.`,

            metadata: {
              appointmentId:
                appointment._id,

              doctorId:
                doctor._id,

              doctorName:
                doctor.fullName,

              specialization:
                doctor.specialization,

              department:
                appointment.department,

              location,

              appointmentDate:
                appointment.appointmentDate,

              appointmentTime:
                appointment.appointmentTime,

              previousStatus,

              newStatus:
                "Completed",
            },
          });
          await sendAppointmentEmail({
            patient,

            doctor,

            appointment,

            departmentLocation:
              location,
          });

          console.log(
            "Appointment completion email sent to:",
            patient.email
          );
        }
      } catch (
        notificationError
      ) {
        
        console.error(
          "Appointment completion notification error:",
          notificationError.message
        );
      }
    }
  } catch (error) {
    console.error(
      "Automatic appointment status update error:",
      error.message
    );
  }
}
const createAppointment =
  async (req, res) => {
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
          message:
            "Please provide all required appointment details.",
        });
      }

      const patientExists =
        await User.findById(
          patient
        );

      if (!patientExists) {
        return res.status(404).json({
          message:
            "Selected patient was not found.",
        });
      }
      const doctorExists =
        await Doctor.findById(
          doctor
        );

      if (!doctorExists) {
        return res.status(404).json({
          message:
            "Selected doctor was not found.",
        });
      }
      if (
        doctorExists.status !==
        "Available"
      ) {
        return res.status(409).json({
          message:
            `Dr. ${doctorExists.fullName} is currently ${doctorExists.status.toLowerCase()}. Please select another doctor.`,
        });
      }

      const conflictingAppointment =
        await Appointment.findOne({
          doctor,

          appointmentDate:
            new Date(
              appointmentDate
            ),

          appointmentTime,

          status: {
            $in: [
              "Pending",
              "Confirmed",
            ],
          },
        });

      if (
        conflictingAppointment
      ) {
        return res.status(409).json({
          message:
            `Dr. ${doctorExists.fullName} is already booked on ${appointmentDate} at ${appointmentTime}. Please choose another time.`,
        });
      }

      let initialStatus =
        status || "Pending";

      if (
        hasAppointmentPassed(
          appointmentDate,
          appointmentTime
        )
      ) {
        initialStatus =
          "Completed";
      }

      const appointment =
        await Appointment.create({
          patient,

          doctor,

          department,

          appointmentDate,

          appointmentTime,

          reason:
            reason || "",

          notes:
            notes || "",

          status:
            initialStatus,
        });

      try {
        const departmentData =
          await Department.findOne({
            name:
              department,
          });

        const departmentLocation =
          departmentData?.location ||
          "Please contact hospital reception";
        await createPatientNotification({
          patientId:
            patientExists._id,

          type:
            initialStatus ===
            "Completed"
              ? "Appointment Updated"
              : "Appointment",

          title:
            initialStatus ===
            "Completed"
              ? "Appointment Completed"
              : "Appointment Created",

          message:
            initialStatus ===
            "Completed"
              ? `Your appointment with Dr. ${doctorExists.fullName} has been completed.`
              : `Your appointment with Dr. ${doctorExists.fullName} has been ${initialStatus.toLowerCase()}.`,

          metadata: {
            appointmentId:
              appointment._id,

            doctorId:
              doctorExists._id,

            doctorName:
              doctorExists.fullName,

            specialization:
              doctorExists.specialization,

            department:
              appointment.department,

            location:
              departmentLocation,

            appointmentDate:
              appointment.appointmentDate,

            appointmentTime:
              appointment.appointmentTime,

            status:
              initialStatus,
          },
        });
        await sendAppointmentEmail({
          patient:
            patientExists,

          doctor:
            doctorExists,

          appointment,

          departmentLocation,
        });

        console.log(
          "APPOINTMENT NOTIFICATION SENT:",
          patientExists.email
        );
      } catch (
        notificationError
      ) {
        console.error(
          "APPOINTMENT NOTIFICATION ERROR:",
          notificationError.message
        );
      }
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

        error:
          error.message,
      });
    }
  };
const getAppointments =
  async (req, res) => {
    try {
      await updatePastAppointments();
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

        error:
          error.message,
      });
    }
  };

const getAppointmentById =
  async (req, res) => {
    try {
      const appointment =
        await Appointment.findById(
          req.params.id
        );

      if (!appointment) {
        return res.status(404).json({
          message:
            "Appointment not found.",
        });
      }
      if (
        (
          appointment.status ===
          "Pending" ||
          appointment.status ===
          "Confirmed"
        ) &&
        hasAppointmentPassed(
          appointment.appointmentDate,
          appointment.appointmentTime
        )
      ) {
        const previousStatus =
          appointment.status;

        appointment.status =
          "Completed";

        await appointment.save();

        console.log(
          `Appointment ${appointment._id} changed from ${previousStatus} to Completed`
        );
      }
      const populatedAppointment =
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

      return res.status(200).json({
        appointment:
          populatedAppointment,
      });
    } catch (error) {
      console.error(
        "Get appointment error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to fetch appointment.",

        error:
          error.message,
      });
    }
  };

const updateAppointment =
  async (req, res) => {
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

      let finalStatus =
        status !== undefined
          ? status
          : existingAppointment.status;

      const patientExists =
        await User.findById(
          finalPatient
        );

      if (!patientExists) {
        return res.status(404).json({
          message:
            "Selected patient was not found.",
        });
      }
      const doctorExists =
        await Doctor.findById(
          finalDoctor
        );

      if (!doctorExists) {
        return res.status(404).json({
          message:
            "Selected doctor was not found.",
        });
      }
      const doctorWasChanged =
        String(
          finalDoctor
        ) !==
        String(
          existingAppointment.doctor
        );

      if (
        doctorWasChanged &&
        doctorExists.status !==
          "Available"
      ) {
        return res.status(409).json({
          message:
            `Dr. ${doctorExists.fullName} is currently ${doctorExists.status.toLowerCase()}. Please select an available doctor.`,
        });
      }
      const conflict =
        await Appointment.findOne({
          _id: {
            $ne:
              existingAppointment._id,
          },

          doctor:
            finalDoctor,

          appointmentDate:
            new Date(finalDate),

          appointmentTime:
            finalTime,

          status: {
            $in: [
              "Pending",
              "Confirmed",
            ],
          },
        });

      if (conflict) {
        return res.status(409).json({
          message:
            `Dr. ${doctorExists.fullName} is already booked on ${finalDate} at ${finalTime}. Please choose another time.`,
        });
      }
      if (
        finalStatus !==
          "Cancelled" &&
        finalStatus !==
          "Completed" &&
        hasAppointmentPassed(
          finalDate,
          finalTime
        )
      ) {
        finalStatus =
          "Completed";
      }
      const updateData = {
        patient:
          finalPatient,

        doctor:
          finalDoctor,

        department:
          finalDepartment,

        appointmentDate:
          finalDate,

        appointmentTime:
          finalTime,

        reason:
          reason !== undefined
            ? reason
            : existingAppointment.reason,

        notes:
          notes !== undefined
            ? notes
            : existingAppointment.notes,

        status:
          finalStatus,
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
      if (
        appointment &&
        appointment.status !==
          existingAppointment.status
      ) {
        try {
          const departmentData =
            await Department.findOne({
              name:
                appointment.department,
            });

          const departmentLocation =
            departmentData?.location ||
            "Please contact hospital reception";

          let notificationTitle =
            "Appointment Updated";

          let notificationMessage =
            `Your appointment with Dr. ${doctorExists.fullName} has been updated to ${appointment.status}.`;

          if (
            appointment.status ===
            "Completed"
          ) {
            notificationTitle =
              "Appointment Completed";

            notificationMessage =
              `Your appointment with Dr. ${doctorExists.fullName} has been completed.`;
          }

          if (
            appointment.status ===
            "Cancelled"
          ) {
            notificationTitle =
              "Appointment Cancelled";

            notificationMessage =
              `Your appointment with Dr. ${doctorExists.fullName} has been cancelled.`;
          }
          await createPatientNotification({
            patientId:
              patientExists._id,

            type:
              appointment.status ===
              "Completed"
                ? "Appointment Updated"
                : appointment.status ===
                  "Cancelled"
                ? "Appointment Cancelled"
                : "Appointment Updated",

            title:
              notificationTitle,

            message:
              notificationMessage,

            metadata: {
              appointmentId:
                appointment._id,

              doctorId:
                doctorExists._id,

              doctorName:
                doctorExists.fullName,

              specialization:
                doctorExists.specialization,

              department:
                appointment.department,

              location:
                departmentLocation,

              appointmentDate:
                appointment.appointmentDate,

              appointmentTime:
                appointment.appointmentTime,

              oldStatus:
                existingAppointment.status,

              newStatus:
                appointment.status,
            },
          });

          /*
           * Send email
           *
           * Reuse your existing Brevo email service
           * through sendAppointmentEmail().
           */
          await sendAppointmentEmail({
            patient:
              patientExists,

            doctor:
              doctorExists,

            appointment,

            departmentLocation,
          });

          console.log(
            "Appointment status notification sent:",
            patientExists.email
          );
        } catch (
          notificationError
        ) {
          console.error(
            "Appointment update notification error:",
            notificationError.message
          );
        }
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

        error:
          error.message,
      });
    }
  };

const deleteAppointment =
  async (req, res) => {
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

        error:
          error.message,
      });
    }
  };
module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  updatePastAppointments,
};