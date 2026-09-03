const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    visitDate: {
      type: Date,
      required: true,
    },

    symptoms: {
      type: String,
      trim: true,
      default: "",
    },

    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },

    treatmentPlan: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    bloodPressure: {
      type: String,
      trim: true,
      default: "",
    },

    pulseRate: {
      type: Number,
      default: null,
    },

    temperature: {
      type: Number,
      default: null,
    },

    oxygenLevel: {
      type: Number,
      default: null,
    },

    weight: {
      type: Number,
      default: null,
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.MedicalRecord ||
  mongoose.model("MedicalRecord", medicalRecordSchema);