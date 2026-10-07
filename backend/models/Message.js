const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderRole: {
      type: String,
      enum: ["doctor", "patient"],
      required: true,
    },

    receiverRole: {
      type: String,
      enum: ["doctor", "patient"],
      required: true,
    },

    message: {
      type: String,
      trim: true,
      default: "",
    },

    attachmentUrl: {
      type: String,
      default: null,
    },

    attachmentPublicId: {
      type: String,
      default: null,
    },

    attachmentName: {
      type: String,
      default: null,
    },

    attachmentType: {
      type: String,
      default: null,
    },

    attachmentSize: {
      type: Number,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Message =
  mongoose.models.Message ||
  mongoose.model("Message", messageSchema);

module.exports = Message;