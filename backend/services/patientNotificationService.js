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
    departmentLocation ||
    "Please contact hospital reception";

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
    throw new Error(
      `Unsupported appointment status: ${status}`
    );
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

async function sendMedicalRecordCreatedEmail({
  patient,
  doctor,
  record,
}) {
  const visitDate = new Date(
    record.visitDate
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const followUpDate = record.followUpDate
    ? new Date(record.followUpDate).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      )
    : "Not scheduled";

  const message = `Hello ${patient.fullName},

A new medical record has been created for your visit.

Medical Record Details
----------------------
Doctor: Dr. ${doctor.fullName}
Specialization: ${doctor.specialization || "Not provided"}
Department: ${doctor.department || "Not provided"}

Visit Date:
${visitDate}

Symptoms:
${record.symptoms || "Not provided"}

Diagnosis:
${record.diagnosis || "Not provided"}

Treatment Plan:
${record.treatmentPlan || "Not provided"}

Notes:
${record.notes || "Not provided"}

Vital Information
-----------------
Blood Pressure: ${record.bloodPressure || "Not recorded"}
Pulse Rate: ${
    record.pulseRate !== null &&
    record.pulseRate !== undefined
      ? record.pulseRate
      : "Not recorded"
  }
Temperature: ${
    record.temperature !== null &&
    record.temperature !== undefined
      ? record.temperature
      : "Not recorded"
  }
Oxygen Level: ${
    record.oxygenLevel !== null &&
    record.oxygenLevel !== undefined
      ? record.oxygenLevel
      : "Not recorded"
  }
Weight: ${
    record.weight !== null &&
    record.weight !== undefined
      ? record.weight
      : "Not recorded"
  }

Follow-up Date:
${followUpDate}

Status:
${record.status || "Open"}

Hospital Information
--------------------
Hospital: ${hospitalInfo.name}
Address: ${hospitalInfo.address}
Phone: ${hospitalInfo.phone}

You can log in to the Hospital Management System to view your medical record.

Regards,
${hospitalInfo.name}`;

  return sendEmail({
    to: patient.email,
    subject: `New Medical Record - ${hospitalInfo.name}`,
    message,
  });
}
async function sendMedicalRecordUpdatedEmail({
  patient,
  doctor,
  record,
}) {
  const visitDate = new Date(
    record.visitDate
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const followUpDate = record.followUpDate
    ? new Date(record.followUpDate).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      )
    : "Not scheduled";

  const message = `Hello ${patient.fullName},

Your medical record has been updated by the hospital.

Updated Medical Record
----------------------
Doctor: Dr. ${doctor.fullName}
Specialization: ${doctor.specialization || "Not provided"}
Department: ${doctor.department || "Not provided"}

Visit Date:
${visitDate}

Symptoms:
${record.symptoms || "Not provided"}

Diagnosis:
${record.diagnosis || "Not provided"}

Treatment Plan:
${record.treatmentPlan || "Not provided"}

Notes:
${record.notes || "Not provided"}

Vital Information
-----------------
Blood Pressure: ${record.bloodPressure || "Not recorded"}
Pulse Rate: ${
    record.pulseRate !== null &&
    record.pulseRate !== undefined
      ? record.pulseRate
      : "Not recorded"
  }
Temperature: ${
    record.temperature !== null &&
    record.temperature !== undefined
      ? record.temperature
      : "Not recorded"
  }
Oxygen Level: ${
    record.oxygenLevel !== null &&
    record.oxygenLevel !== undefined
      ? record.oxygenLevel
      : "Not recorded"
  }
Weight: ${
    record.weight !== null &&
    record.weight !== undefined
      ? record.weight
      : "Not recorded"
  }

Follow-up Date:
${followUpDate}

Status:
${record.status || "Open"}

Please log in to the Hospital Management System to view the latest information.

Hospital Information
--------------------
Hospital: ${hospitalInfo.name}
Address: ${hospitalInfo.address}
Phone: ${hospitalInfo.phone}

Regards,
${hospitalInfo.name}`;

  return sendEmail({
    to: patient.email,
    subject: `Medical Record Updated - ${hospitalInfo.name}`,
    message,
  });
}

async function sendMedicalRecordDeletedEmail({
  patient,
  doctor,
  record,
}) {
  const visitDate = record.visitDate
    ? new Date(record.visitDate).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      )
    : "Not available";

  const message = `Hello ${patient.fullName},

A medical record associated with your hospital visit has been removed from the Hospital Management System.

Medical Record Details
----------------------
Doctor: Dr. ${doctor.fullName}
Department: ${doctor.department || "Not provided"}
Visit Date: ${visitDate}

Diagnosis:
${record.diagnosis || "Not provided"}

If you believe this record was removed incorrectly or you need further information, please contact the hospital.

Hospital Information
--------------------
Hospital: ${hospitalInfo.name}
Address: ${hospitalInfo.address}
Phone: ${hospitalInfo.phone}

Regards,
${hospitalInfo.name}`;

  return sendEmail({
    to: patient.email,
    subject: `Medical Record Removed - ${hospitalInfo.name}`,
    message,
  });
}

async function sendPrescriptionCreatedEmail({
  patient,
  doctor,
  prescription,
}) {
  try {
    if (!patient?.email) {
      throw new Error(
        "Patient email is required for prescription email"
      );
    }

    const hospitalInfo = `
Hospital Management System

For any assistance, please contact the hospital administration.
`;

    const medicines = Array.isArray(
      prescription.medications
    )
      ? prescription.medications
          .map(
            (medicine, index) =>
              `${index + 1}. ${medicine.medicineName}
   Dosage: ${medicine.dosage}
   Frequency: ${medicine.frequency}
   Duration: ${medicine.duration}
   Instructions: ${
     medicine.instructions || "No special instructions"
   }`
          )
          .join("\n\n")
      : "No medicines available.";

    const message = `
Hello ${patient.fullName},

A new prescription has been created for you.

PRESCRIPTION DETAILS
--------------------

Doctor:
${doctor?.fullName || "N/A"}

Doctor ID:
${doctor?.doctorId || "N/A"}

Specialization:
${doctor?.specialization || "N/A"}

Department:
${doctor?.department || "N/A"}

Prescription Date:
${prescription.prescriptionDate
  ? new Date(
      prescription.prescriptionDate
    ).toLocaleDateString("en-IN")
  : "N/A"}

Diagnosis:
${prescription.diagnosis || "Not provided"}

Medicines:
${medicines}

Notes:
${prescription.notes || "No additional notes"}

Status:
${prescription.status || "Active"}

Please follow the prescribed dosage and instructions carefully.

${hospitalInfo}
`;

    return await sendEmail({
      to: patient.email,
      subject:
        "New Prescription Created - Hospital Management System",
      message,
    });
  } catch (error) {
    console.error(
      "Prescription created email error:",
      error.message
    );

    throw error;
  }
}

async function sendPrescriptionUpdatedEmail({
  patient,
  doctor,
  prescription,
}) {
  try {
    if (!patient?.email) {
      throw new Error(
        "Patient email is required for prescription email"
      );
    }

    const hospitalInfo = `
Hospital Management System

For any assistance, please contact the hospital administration.
`;

    const medicines = Array.isArray(
      prescription.medications
    )
      ? prescription.medications
          .map(
            (medicine, index) =>
              `${index + 1}. ${medicine.medicineName}
   Dosage: ${medicine.dosage}
   Frequency: ${medicine.frequency}
   Duration: ${medicine.duration}
   Instructions: ${
     medicine.instructions || "No special instructions"
   }`
          )
          .join("\n\n")
      : "No medicines available.";

    const message = `
Hello ${patient.fullName},

Your prescription has been updated.

UPDATED PRESCRIPTION DETAILS
----------------------------

Doctor:
${doctor?.fullName || "N/A"}

Doctor ID:
${doctor?.doctorId || "N/A"}

Specialization:
${doctor?.specialization || "N/A"}

Department:
${doctor?.department || "N/A"}

Prescription Date:
${prescription.prescriptionDate
  ? new Date(
      prescription.prescriptionDate
    ).toLocaleDateString("en-IN")
  : "N/A"}

Diagnosis:
${prescription.diagnosis || "Not provided"}

Medicines:
${medicines}

Notes:
${prescription.notes || "No additional notes"}

Status:
${prescription.status || "Active"}

Please review the updated prescription carefully.

${hospitalInfo}
`;

    return await sendEmail({
      to: patient.email,
      subject:
        "Prescription Updated - Hospital Management System",
      message,
    });
  } catch (error) {
    console.error(
      "Prescription updated email error:",
      error.message
    );

    throw error;
  }
}

async function sendPrescriptionDeletedEmail({
  patient,
  doctor,
  prescription,
}) {
  try {
    if (!patient?.email) {
      throw new Error(
        "Patient email is required for prescription email"
      );
    }

    const hospitalInfo = `
Hospital Management System

For any assistance, please contact the hospital administration.
`;

    const message = `
Hello ${patient.fullName},

Your prescription has been removed from the hospital management system.

PRESCRIPTION DETAILS
--------------------

Doctor:
${doctor?.fullName || "N/A"}

Doctor ID:
${doctor?.doctorId || "N/A"}

Department:
${doctor?.department || "N/A"}

Prescription Date:
${prescription.prescriptionDate
  ? new Date(
      prescription.prescriptionDate
    ).toLocaleDateString("en-IN")
  : "N/A"}

Diagnosis:
${prescription.diagnosis || "Not provided"}

Status:
${prescription.status || "N/A"}

If you believe this prescription was removed incorrectly, please contact the hospital administration.

${hospitalInfo}
`;

    return await sendEmail({
      to: patient.email,
      subject:
        "Prescription Removed - Hospital Management System",
      message,
    });
  } catch (error) {
    console.error(
      "Prescription deleted email error:",
      error.message
    );

    throw error;
  }
}

module.exports = {
  createPatientNotification,
  sendWelcomeEmail,
  sendHospitalInformationEmail,
  sendAppointmentEmail,
  sendDoctorAppointmentEmail,
  sendAppointmentStatusEmail,
  sendMedicalRecordCreatedEmail,
  sendMedicalRecordUpdatedEmail,
  sendMedicalRecordDeletedEmail,
  sendPrescriptionCreatedEmail,
  sendPrescriptionUpdatedEmail,
  sendPrescriptionDeletedEmail,
};
