const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");
const hospitalInfo = require("../config/hospitalInfo");

async function createPatientNotification({
  patientId,
  type,
  title,
  message,
  metadata = {},
}) {
  try {
    const notification = await Notification.create({
      recipient: patientId,
      type,
      title,
      message,
      metadata,
    });

    return notification;
  } catch (error) {
    console.error(
      "Notification creation error:",
      error.message
    );

    throw error;
  }
}

async function sendWelcomeEmail(patient) {
  const message = `Hello ${patient.fullName},

Welcome to ${hospitalInfo.name}.

Your patient account has been successfully created.

Hospital Information
---------------------
Hospital: ${hospitalInfo.name}
Address: ${hospitalInfo.address}
Phone: ${hospitalInfo.phone}
Email: ${hospitalInfo.email}
Working Hours: ${hospitalInfo.workingHours}
Emergency: ${hospitalInfo.emergency}

You can use your registered account to access your appointments,
medical records, prescriptions, laboratory reports, and billing information.

Website:
${hospitalInfo.website}

Thank you for choosing ${hospitalInfo.name}.

Regards,
${hospitalInfo.name}`;

  return sendEmail({
    to: patient.email,
    subject: `Welcome to ${hospitalInfo.name}`,
    message,
  });
}

async function sendHospitalInformationEmail(patient) {
  const message = `Hello ${patient.fullName},

Here is the hospital information for your reference.

Hospital: ${hospitalInfo.name}

Address:
${hospitalInfo.address}

Phone:
${hospitalInfo.phone}

Email:
${hospitalInfo.email}

Working Hours:
${hospitalInfo.workingHours}

Emergency:
${hospitalInfo.emergency}

Website:
${hospitalInfo.website}

Please contact the hospital reception if you need assistance.

Regards,
${hospitalInfo.name}`;

  return sendEmail({
    to: patient.email,
    subject: `Hospital Information - ${hospitalInfo.name}`,
    message,
  });
}

async function sendAppointmentEmail({
  patient,
  doctor,
  appointment,
  departmentLocation,
}) {
  const appointmentDate = new Date(
    appointment.appointmentDate
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const location =
    departmentLocation || "Please contact hospital reception";

  const message = `Hello ${patient.fullName},

Your appointment has been ${appointment.status.toLowerCase()}.

Appointment Details
-------------------
Department: ${appointment.department}
Doctor: Dr. ${doctor.fullName}
Specialization: ${doctor.specialization}

Date: ${appointmentDate}
Time: ${appointment.appointmentTime}

Location / Floor:
${location}

Reason:
${appointment.reason || "Not provided"}

Hospital Information
--------------------
Hospital: ${hospitalInfo.name}
Address: ${hospitalInfo.address}
Phone: ${hospitalInfo.phone}

Please arrive 10-15 minutes before your appointment time.

Thank you,
${hospitalInfo.name}`;

  return sendEmail({
    to: patient.email,
    subject: `Appointment ${appointment.status} - ${appointment.department}`,
    message,
  });
}

module.exports = {
  createPatientNotification,
  sendWelcomeEmail,
  sendHospitalInformationEmail,
  sendAppointmentEmail,
};