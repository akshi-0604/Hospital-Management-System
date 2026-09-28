const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  metadata = {},
}) => {
  try {
    if (!recipient) {
      throw new Error("Notification recipient is required");
    }

    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      metadata,
    });

    return notification;
  } catch (error) {
    console.error(
      "Create notification error:",
      error.message
    );

    throw error;
  }
};

const createWelcomeNotification = async ({
  recipient,
  name,
}) => {
  return createNotification({
    recipient,
    type: "Welcome",
    title: "Welcome to Hospital Management System",
    message: `Welcome ${name || "to our hospital"}. Your account has been created successfully.`,
    metadata: {
      notificationCategory: "account",
    },
  });
};

const createHospitalInformationNotification = async ({
  recipient,
}) => {
  return createNotification({
    recipient,
    type: "Hospital Information",
    title: "Hospital Information",
    message:
      "Welcome to our hospital. You can now access your healthcare services through the Hospital Management System.",
    metadata: {
      notificationCategory: "hospital",
    },
  });
};

const createAppointmentNotification = async ({
  recipient,
  title,
  message,
  metadata = {},
}) => {
  return createNotification({
    recipient,
    type: "Appointment",
    title,
    message,
    metadata: {
      ...metadata,
      notificationCategory: "appointment",
    },
  });
};

const createAppointmentUpdatedNotification = async ({
  recipient,
  title,
  message,
  metadata = {},
}) => {
  return createNotification({
    recipient,
    type: "Appointment Updated",
    title,
    message,
    metadata: {
      ...metadata,
      notificationCategory: "appointment",
    },
  });
};

const createAppointmentCancelledNotification = async ({
  recipient,
  title,
  message,
  metadata = {},
}) => {
  return createNotification({
    recipient,
    type: "Appointment Cancelled",
    title,
    message,
    metadata: {
      ...metadata,
      notificationCategory: "appointment",
    },
  });
};

const createMedicalRecordNotification = async ({
  recipient,
  title,
  message,
  metadata = {},
}) => {
  return createNotification({
    recipient,
    type: "Medical Record",
    title,
    message,
    metadata: {
      ...metadata,
      notificationCategory: "medical_record",
    },
  });
};

const createPrescriptionNotification = async ({
  recipient,
  title,
  message,
  metadata = {},
}) => {
  return createNotification({
    recipient,
    type: "Prescription",
    title,
    message,
    metadata: {
      ...metadata,
      notificationCategory: "prescription",
    },
  });
};

const createLaboratoryNotification = async ({
  recipient,
  title,
  message,
  metadata = {},
}) => {
  return createNotification({
    recipient,
    type: "Laboratory",
    title,
    message,
    metadata: {
      ...metadata,
      notificationCategory: "laboratory",
    },
  });
};

const createBillingNotification = async ({
  recipient,
  title,
  message,
  metadata = {},
}) => {
  return createNotification({
    recipient,
    type: "Billing",
    title,
    message,
    metadata: {
      ...metadata,
      notificationCategory: "billing",
    },
  });
};

const createSecurityNotification = async ({
  recipient,
  title,
  message,
  metadata = {},
}) => {
  return createNotification({
    recipient,
    type: "Security",
    title,
    message,
    metadata: {
      ...metadata,
      notificationCategory: "security",
    },
  });
};

module.exports = {
  createNotification,
  createWelcomeNotification,
  createHospitalInformationNotification,
  createAppointmentNotification,
  createAppointmentUpdatedNotification,
  createAppointmentCancelledNotification,
  createMedicalRecordNotification,
  createPrescriptionNotification,
  createLaboratoryNotification,
  createBillingNotification,
  createSecurityNotification,
};