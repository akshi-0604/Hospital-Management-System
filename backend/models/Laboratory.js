const mongoose = require("mongoose");

const laboratorySchema = new mongoose.Schema(
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

    testName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    testDate: {
      type: Date,
      required: true,
    },

    result: {
      type: String,
      trim: true,
      default: "",
    },

    unit: {
      type: String,
      trim: true,
      default: "",
    },

    referenceRange: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Ordered",
        "Sample Collected",
        "Processing",
        "Completed",
        "Cancelled",
      ],
      default: "Ordered",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Laboratory ||
  mongoose.model("Laboratory", laboratorySchema);