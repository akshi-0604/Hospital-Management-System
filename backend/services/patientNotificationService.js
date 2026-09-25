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

async function sendDoctorAppointmentEmail({
  doctor,
  patient,
  appointment,
}) {
  const appointmentDate = new Date(
    appointment.appointmentDate
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const message = `Hello Dr. ${doctor.fullName},

You have a new appointment.

Appointment Details
-------------------
Patient: ${patient.fullName}
Department: ${appointment.department}

Date: ${appointmentDate}
Time: ${appointment.appointmentTime}

Reason:
${appointment.reason || "Not provided"}

Hospital Information
--------------------
Hospital: ${hospitalInfo.name}
Address: ${hospitalInfo.address}
Phone: ${hospitalInfo.phone}

Please review the appointment in the Hospital Management System.

Regards,
${hospitalInfo.name}`;

  return sendEmail({
    to: doctor.email,
    subject: `New Appointment - ${appointment.department}`,
    message,
  });
}

async function sendAppointmentStatusEmail({
  patient,
  doctor,
  appointment,
  status,
  departmentLocation,
}) {
  const appointmentDate = new Date(
    appointment.appointmentDate
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  let subject = "";
  let patientMessage = "";
  let doctorMessage = "";

  if (status === "Confirmed") {
    subject = `Appointment Confirmed - ${appointment.department}`;

    patientMessage = `Hello ${patient.fullName},

Your appointment has been confirmed.

Appointment Details
-------------------
Department: ${appointment.department}
Doctor: Dr. ${doctor.fullName}

Date: ${appointmentDate}
Time: ${appointment.appointmentTime}

Location / Floor:
${departmentLocation || "Please contact hospital reception"}

Reason:
${appointment.reason || "Not provided"}

Please arrive 10-15 minutes before your appointment time.

Hospital Information
--------------------
Hospital: ${hospitalInfo.name}
Address: ${hospitalInfo.address}
Phone: ${hospitalInfo.phone}

Thank you,
${hospitalInfo.name}`;

    doctorMessage = `Hello Dr. ${doctor.fullName},

An appointment has been confirmed.

Appointment Details
-------------------
Patient: ${patient.fullName}
Department: ${appointment.department}

Date: ${appointmentDate}
Time: ${appointment.appointmentTime}

Reason:
${appointment.reason || "Not provided"}

Please review the appointment in the Hospital Management System.

Regards,
${hospitalInfo.name}`;
  }

  if (status === "Cancelled") {
    subject = `Appointment Cancelled - ${appointment.department}`;

    patientMessage = `Hello ${patient.fullName},

Your appointment has been cancelled.

Appointment Details
-------------------
Department: ${appointment.department}
Doctor: Dr. ${doctor.fullName}

Date: ${appointmentDate}
Time: ${appointment.appointmentTime}

Please contact the hospital if you need to book another appointment.

Hospital Information
--------------------
Hospital: ${hospitalInfo.name}
Address: ${hospitalInfo.address}
Phone: ${hospitalInfo.phone}

Regards,
${hospitalInfo.name}`;

    doctorMessage = `Hello Dr. ${doctor.fullName},

An appointment has been cancelled.

Appointment Details
-------------------
Patient: ${patient.fullName}
Department: ${appointment.department}

Date: ${appointmentDate}
Time: ${appointment.appointmentTime}

Please review the appointment status in the Hospital Management System.

Regards,
${hospitalInfo.name}`;
  }

  if (status === "Rescheduled") {
    subject = `Appointment Rescheduled - ${appointment.department}`;

    patientMessage = `Hello ${patient.fullName},

Your appointment has been rescheduled.

Updated Appointment Details
---------------------------
Department: ${appointment.department}
Doctor: Dr. ${doctor.fullName}

New Date: ${appointmentDate}
New Time: ${appointment.appointmentTime}

Location / Floor:
${departmentLocation || "Please contact hospital reception"}

Reason:
${appointment.reason || "Not provided"}

Please arrive 10-15 minutes before your new appointment time.

Hospital Information
--------------------
Hospital: ${hospitalInfo.name}
Address: ${hospitalInfo.address}
Phone: ${hospitalInfo.phone}

Regards,
${hospitalInfo.name}`;

    doctorMessage = `Hello Dr. ${doctor.fullName},

An appointment has been rescheduled.

Updated Appointment Details
---------------------------
Patient: ${patient.fullName}
Department: ${appointment.department}

New Date: ${appointmentDate}
New Time: ${appointment.appointmentTime}

Reason:
${appointment.reason || "Not provided"}

Please review the updated appointment in the Hospital Management System.

Regards,
${hospitalInfo.name}`;
  }

  if (!patientMessage || !doctorMessage) {
    throw new Error(`Unsupported appointment status: ${status}`);
  }

  await sendEmail({
    to: patient.email,
    subject,
    message: patientMessage,
  });

  await sendEmail({
    to: doctor.email,
    subject,
    message: doctorMessage,
  });
}

module.exports = {
  createPatientNotification,
  sendWelcomeEmail,
  sendHospitalInformationEmail,
  sendAppointmentEmail,
  sendDoctorAppointmentEmail,
  sendAppointmentStatusEmail,
};