const Message = require("../models/Message");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

const getDoctorRecordForUser = async (userId) => {
  const doctorUser = await User.findById(userId).select(
    "fullName email role"
  );

  if (!doctorUser || doctorUser.role !== "doctor") {
    return null;
  }

  const doctor = await Doctor.findOne({
    email: doctorUser.email,
  });

  return doctor;
};

const doctorPatientHaveAppointment = async (
  doctorUserId,
  patientUserId
) => {
  const doctor = await getDoctorRecordForUser(doctorUserId);

  if (!doctor) {
    return false;
  }

  const appointment = await Appointment.findOne({
    doctor: doctor._id,
    patient: patientUserId,
  });

  return !!appointment;
};

const patientDoctorHaveAppointment = async (
  patientUserId,
  doctorUserId
) => {
  const doctorUser = await User.findById(doctorUserId).select(
    "email role"
  );

  if (!doctorUser || doctorUser.role !== "doctor") {
    return false;
  }

  const doctor = await Doctor.findOne({
    email: doctorUser.email,
  });

  if (!doctor) {
    return false;
  }

  const appointment = await Appointment.findOne({
    patient: patientUserId,
    doctor: doctor._id,
  });

  return !!appointment;
};

const getChatUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;

    const currentUser = await User.findById(currentUserId).select(
      "fullName email role"
    );

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId },
        { receiver: currentUserId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "fullName email role")
      .populate("receiver", "fullName email role");

    const conversationMap = new Map();

    for (const message of messages) {
      const senderId = message.sender?._id?.toString();
      const receiverId = message.receiver?._id?.toString();

      const otherUser =
        senderId === currentUserId.toString()
          ? message.receiver
          : message.sender;

      if (!otherUser?._id) {
        continue;
      }

      const otherUserId = otherUser._id.toString();

      let allowed = false;

      if (currentUser.role === "doctor") {
        allowed = await doctorPatientHaveAppointment(
          currentUserId,
          otherUserId
        );
      } else if (currentUser.role === "patient") {
        allowed = await patientDoctorHaveAppointment(
          currentUserId,
          otherUserId
        );
      }

      if (!allowed) {
        continue;
      }

      if (!conversationMap.has(otherUserId)) {
        const unreadCount = await Message.countDocuments({
          sender: otherUserId,
          receiver: currentUserId,
          isRead: false,
        });

        conversationMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount,
        });
      }
    }

    return res.status(200).json({
      success: true,
      conversations: Array.from(conversationMap.values()),
    });
  } catch (error) {
    console.error("GET CHAT USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load chat conversations.",
      error: error.message,
    });
  }
};

const getChatPatients = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;

    const doctor = await getDoctorRecordForUser(currentUserId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
    }).populate(
      "patient",
      "fullName email role phone"
    );

    const patientMap = new Map();

    appointments.forEach((appointment) => {
      const patient = appointment.patient;

      if (!patient?._id) {
        return;
      }

      const patientId = patient._id.toString();

      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, patient);
      }
    });

    return res.status(200).json({
      success: true,
      patients: Array.from(patientMap.values()),
    });
  } catch (error) {
    console.error("GET CHAT PATIENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load patients for chat.",
      error: error.message,
    });
  }
};

const getChatDoctors = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;

    const appointments = await Appointment.find({
      patient: currentUserId,
    }).populate(
      "doctor",
      "fullName doctorId email specialization department"
    );

    const doctorMap = new Map();

    for (const appointment of appointments) {
      const doctor = appointment.doctor;

      if (!doctor?._id || !doctor.email) {
        continue;
      }

      const doctorUser = await User.findOne({
        email: doctor.email,
        role: "doctor",
      }).select("fullName email role phone");

      if (!doctorUser) {
        continue;
      }

      const doctorUserId = doctorUser._id.toString();

      if (!doctorMap.has(doctorUserId)) {
        doctorMap.set(doctorUserId, {
          _id: doctorUser._id,
          fullName: doctorUser.fullName,
          email: doctorUser.email,
          role: doctorUser.role,
          phone: doctorUser.phone,
          specialization: doctor.specialization,
          department: doctor.department,
          doctorId: doctor.doctorId,
        });
      }
    }

    return res.status(200).json({
      success: true,
      doctors: Array.from(doctorMap.values()),
    });
  } catch (error) {
    console.error("GET CHAT DOCTORS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load doctors for chat.",
      error: error.message,
    });
  }
};

const getConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const otherUserId = req.params.userId;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "Other user ID is required.",
      });
    }

    if (String(currentUserId) === String(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with yourself.",
      });
    }

    const currentUser = await User.findById(currentUserId).select(
      "fullName email role"
    );

    const otherUser = await User.findById(otherUserId).select(
      "fullName email role"
    );

    if (!currentUser || !otherUser) {
      return res.status(404).json({
        success: false,
        message: "Chat user not found.",
      });
    }

    let allowed = false;

    if (
      currentUser.role === "doctor" &&
      otherUser.role === "patient"
    ) {
      allowed = await doctorPatientHaveAppointment(
        currentUserId,
        otherUserId
      );
    }

    if (
      currentUser.role === "patient" &&
      otherUser.role === "doctor"
    ) {
      allowed = await patientDoctorHaveAppointment(
        currentUserId,
        otherUserId
      );
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You can only chat with users connected through an appointment.",
      });
    }

    const messages = await Message.find({
      $or: [
        {
          sender: currentUserId,
          receiver: otherUserId,
        },
        {
          sender: otherUserId,
          receiver: currentUserId,
        },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "fullName email role")
      .populate("receiver", "fullName email role");

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("GET CONVERSATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load conversation.",
      error: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;

    const {
      receiverId,
      message = "",
    } = req.body;

    const trimmedMessage =
      typeof message === "string"
        ? message.trim()
        : "";

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required.",
      });
    }

    if (String(currentUserId) === String(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself.",
      });
    }

    const sender = await User.findById(currentUserId).select(
      "fullName email role"
    );

    const receiver = await User.findById(receiverId).select(
      "fullName email role"
    );

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    if (
      !(
        (sender.role === "doctor" &&
          receiver.role === "patient") ||
        (sender.role === "patient" &&
          receiver.role === "doctor")
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Doctors can only chat with patients and patients can only chat with doctors.",
      });
    }

    let allowed = false;

    if (sender.role === "doctor") {
      allowed = await doctorPatientHaveAppointment(
        currentUserId,
        receiverId
      );
    } else if (sender.role === "patient") {
      allowed = await patientDoctorHaveAppointment(
        currentUserId,
        receiverId
      );
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You can only send messages to users connected through an appointment.",
      });
    }

    const hasFile = !!req.file;

    if (!trimmedMessage && !hasFile) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message or attach a file.",
      });
    }

    let attachmentUrl = null;
    let attachmentPublicId = null;
    let attachmentName = null;
    let attachmentType = null;
    let attachmentSize = null;

    if (req.file) {
      const uploadResult =
        await uploadBufferToCloudinary(
          req.file.buffer,
          {
            resource_type: "auto",
            folder: "hms-chat-attachments",
            use_filename: true,
            unique_filename: true,
          }
        );

      attachmentUrl = uploadResult.secure_url;
      attachmentPublicId = uploadResult.public_id;
      attachmentName = req.file.originalname;
      attachmentType = req.file.mimetype;
      attachmentSize = req.file.size;
    }

    const newMessage = await Message.create({
      sender: currentUserId,
      receiver: receiverId,
      senderRole: sender.role,
      receiverRole: receiver.role,
      message: trimmedMessage,
      attachmentUrl,
      attachmentPublicId,
      attachmentName,
      attachmentType,
      attachmentSize,
      isRead: false,
    });

    const populatedMessage =
      await Message.findById(newMessage._id)
        .populate("sender", "fullName email role")
        .populate("receiver", "fullName email role");

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message.",
      error: error.message,
    });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const otherUserId = req.params.userId;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const currentUser = await User.findById(currentUserId).select(
      "role"
    );

    const otherUser = await User.findById(otherUserId).select(
      "role"
    );

    if (!currentUser || !otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let allowed = false;

    if (
      currentUser.role === "doctor" &&
      otherUser.role === "patient"
    ) {
      allowed = await doctorPatientHaveAppointment(
        currentUserId,
        otherUserId
      );
    }

    if (
      currentUser.role === "patient" &&
      otherUser.role === "doctor"
    ) {
      allowed = await patientDoctorHaveAppointment(
        currentUserId,
        otherUserId
      );
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You can only access messages connected to an appointment.",
      });
    }

    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as read.",
    });
  } catch (error) {
    console.error("MARK MESSAGES READ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read.",
      error: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getChatUsers,
  markMessagesAsRead,
  getChatPatients,
  getChatDoctors,
};