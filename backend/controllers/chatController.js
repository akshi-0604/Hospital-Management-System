const Message = require("../models/Message");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

const sendMessage = async (req, res) => {
  try {
    const senderId =
      req.user?.userId ||
      req.user?.id ||
      req.user?._id;

    const senderRole = String(
      req.user?.role || ""
    )
      .trim()
      .toLowerCase();

    const { receiverId, message } = req.body;

    if (!senderId) {
      return res.status(401).json({
        message:
          "User authentication information not found",
      });
    }

    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    if (
      !["doctor", "patient"].includes(
        senderRole
      )
    ) {
      return res.status(403).json({
        message:
          "Only doctors and patients can use chat",
      });
    }

    if (
      String(senderId) ===
      String(receiverId)
    ) {
      return res.status(400).json({
        message:
          "You cannot send a message to yourself",
      });
    }

    const receiver =
      await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    const receiverRole = String(
      receiver.role || ""
    )
      .trim()
      .toLowerCase();

    if (
      senderRole === "doctor" &&
      receiverRole !== "patient"
    ) {
      return res.status(403).json({
        message:
          "Doctors can chat only with patients",
      });
    }

    if (
      senderRole === "patient" &&
      receiverRole !== "doctor"
    ) {
      return res.status(403).json({
        message:
          "Patients can chat only with doctors",
      });
    }

    if (senderRole === "patient") {
      const doctorUser =
        await User.findById(receiverId).select(
          "email"
        );

      if (!doctorUser?.email) {
        return res.status(403).json({
          message:
            "Doctor account information is incomplete",
        });
      }

      const doctor =
        await Doctor.findOne({
          email:
            doctorUser.email
              .toLowerCase()
              .trim(),
        });

      if (!doctor) {
        return res.status(403).json({
          message:
            "Doctor profile was not found",
        });
      }

      const appointment =
        await Appointment.findOne({
          patient: senderId,
          doctor: doctor._id,
        });

      if (!appointment) {
        return res.status(403).json({
          message:
            "You can chat only with a doctor you have an appointment with.",
        });
      }
    }

    const newMessage =
      await Message.create({
        sender: senderId,
        receiver: receiverId,
        senderRole: senderRole,
        receiverRole: receiverRole,
        message: message.trim(),
        isRead: false,
      });

    const populatedMessage =
      await Message.findById(
        newMessage._id
      )
        .populate(
          "sender",
          "fullName name email role"
        )
        .populate(
          "receiver",
          "fullName name email role"
        );

    return res.status(201).json({
      message:
        "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error(
      "Send message error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to send message",
      error: error.message,
    });
  }
};

const getConversation = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?.userId ||
      req.user?.id ||
      req.user?._id;

    const userRole = String(
      req.user?.role || ""
    )
      .trim()
      .toLowerCase();

    const otherUserId =
      req.params.userId;

    if (!userId) {
      return res.status(401).json({
        message:
          "User authentication information not found",
      });
    }

    if (!otherUserId) {
      return res.status(400).json({
        message:
          "Other user ID is required",
      });
    }

    const currentUser =
      await User.findById(userId);

    const otherUser =
      await User.findById(otherUserId);

    if (!currentUser || !otherUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otherRole = String(
      otherUser.role || ""
    )
      .trim()
      .toLowerCase();

    if (userRole === "doctor") {
      if (otherRole !== "patient") {
        return res.status(403).json({
          message:
            "Doctors can chat only with patients",
        });
      }
    }

    if (userRole === "patient") {
      if (otherRole !== "doctor") {
        return res.status(403).json({
          message:
            "Patients can chat only with doctors",
        });
      }

      if (!otherUser.email) {
        return res.status(403).json({
          message:
            "Doctor account information is incomplete",
        });
      }

      const doctor =
        await Doctor.findOne({
          email:
            otherUser.email
              .toLowerCase()
              .trim(),
        });

      if (!doctor) {
        return res.status(403).json({
          message:
            "Doctor profile was not found",
        });
      }

      const appointment =
        await Appointment.findOne({
          patient: userId,
          doctor: doctor._id,
        });

      if (!appointment) {
        return res.status(403).json({
          message:
            "You can chat only with a doctor you have an appointment with.",
        });
      }
    }

    const messages =
      await Message.find({
        $or: [
          {
            sender: userId,
            receiver: otherUserId,
          },
          {
            sender: otherUserId,
            receiver: userId,
          },
        ],
      })
        .populate(
          "sender",
          "fullName name email role"
        )
        .populate(
          "receiver",
          "fullName name email role"
        )
        .sort({
          createdAt: 1,
        });

    return res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error(
      "Get conversation error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to get conversation",
      error: error.message,
    });
  }
};

const getChatUsers = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?.userId ||
      req.user?.id ||
      req.user?._id;

    const userRole = String(
      req.user?.role || ""
    )
      .trim()
      .toLowerCase();

    if (!userId) {
      return res.status(401).json({
        message:
          "User authentication information not found",
      });
    }

    if (
      !["doctor", "patient"].includes(
        userRole
      )
    ) {
      return res.status(403).json({
        message:
          "Only doctors and patients can use chat",
      });
    }

    const messages =
      await Message.find({
        $or: [
          {
            sender: userId,
          },
          {
            receiver: userId,
          },
        ],
      })
        .populate(
          "sender",
          "fullName name email role"
        )
        .populate(
          "receiver",
          "fullName name email role"
        )
        .sort({
          createdAt: -1,
        });

    const conversationMap =
      new Map();

    for (const message of messages) {
      const senderId =
        String(message.sender?._id);

      const receiverId =
        String(message.receiver?._id);

      const otherUser =
        senderId === String(userId)
          ? message.receiver
          : message.sender;

      if (!otherUser) {
        continue;
      }

      const otherUserId =
        String(otherUser._id);

      if (
        !conversationMap.has(
          otherUserId
        )
      ) {
        conversationMap.set(
          otherUserId,
          {
            user: otherUser,
            lastMessage: message,
            unreadCount: 0,
          }
        );
      }

      if (
        receiverId ===
          String(userId) &&
        !message.isRead
      ) {
        conversationMap.get(
          otherUserId
        ).unreadCount += 1;
      }
    }

    const conversations =
      Array.from(
        conversationMap.values()
      );

    return res.status(200).json({
      conversations,
    });
  } catch (error) {
    console.error(
      "Get chat users error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to get chat conversations",
      error: error.message,
    });
  }
};

const markMessagesAsRead = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?.userId ||
      req.user?.id ||
      req.user?._id;

    const otherUserId =
      req.params.userId;

    if (!userId) {
      return res.status(401).json({
        message:
          "User authentication information not found",
      });
    }

    if (!otherUserId) {
      return res.status(400).json({
        message:
          "Other user ID is required",
      });
    }

    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      message:
        "Messages marked as read",
    });
  } catch (error) {
    console.error(
      "Mark messages as read error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to mark messages as read",
      error: error.message,
    });
  }
};

const getChatPatients = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?.userId ||
      req.user?.id ||
      req.user?._id;

    const userRole = String(
      req.user?.role || ""
    )
      .trim()
      .toLowerCase();

    if (!userId) {
      return res.status(401).json({
        message:
          "User authentication information not found",
      });
    }

    if (userRole !== "doctor") {
      return res.status(403).json({
        message:
          "Only doctors can access chat patients",
      });
    }

    const patients =
      await User.find({
        role: "patient",
      }).select(
        "fullName name email role phone phoneNumber"
      );

    return res.status(200).json({
      patients,
    });
  } catch (error) {
    console.error(
      "Get chat patients error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to get chat patients",
      error: error.message,
    });
  }
};

const getChatDoctors = async (
  req,
  res
) => {
  try {
    const patientUserId =
      req.user?.userId ||
      req.user?.id ||
      req.user?._id;

    const userRole = String(
      req.user?.role || ""
    )
      .trim()
      .toLowerCase();

    if (!patientUserId) {
      return res.status(401).json({
        message:
          "User authentication information not found",
      });
    }

    if (userRole !== "patient") {
      return res.status(403).json({
        message:
          "Only patients can access chat doctors",
      });
    }

    const appointments =
      await Appointment.find({
        patient: patientUserId,
      })
        .populate(
          "doctor",
          "fullName doctorId email phone specialization department status"
        )
        .sort({
          appointmentDate: -1,
        });

    const doctorMap =
      new Map();

    for (const appointment of appointments) {
      if (!appointment.doctor) {
        continue;
      }

      const doctor =
        appointment.doctor;

      doctorMap.set(
        String(doctor._id),
        doctor
      );
    }

    const appointmentDoctors =
      Array.from(
        doctorMap.values()
      );

    const doctorEmails =
      appointmentDoctors
        .map((doctor) =>
          String(
            doctor.email || ""
          )
            .trim()
            .toLowerCase()
        )
        .filter(Boolean);

    if (
      doctorEmails.length === 0
    ) {
      return res.status(200).json({
        doctors: [],
      });
    }

    const doctorUsers =
      await User.find({
        role: "doctor",
        email: {
          $in: doctorEmails,
        },
      }).select(
        "fullName email role phone"
      );


    const doctorUserMap =
      new Map();

    for (const doctorUser of doctorUsers) {
      if (!doctorUser.email) {
        continue;
      }

      doctorUserMap.set(
        doctorUser.email
          .trim()
          .toLowerCase(),
        doctorUser
      );
    }

    const doctors = [];

    for (const doctor of appointmentDoctors) {
      const email =
        String(
          doctor.email || ""
        )
          .trim()
          .toLowerCase();

      const doctorUser =
        doctorUserMap.get(email);

      if (!doctorUser) {
        console.warn(
          "Doctor has no matching User account:",
          {
            doctorId:
              doctor._id,
            doctorName:
              doctor.fullName,
            doctorEmail:
              doctor.email,
          }
        );

        continue;
      }

      doctors.push({
        _id: doctorUser._id,

        doctorId:
          doctor.doctorId,

        fullName:
          doctor.fullName ||
          doctorUser.fullName ||
          "Doctor",

        email:
          doctor.email ||
          doctorUser.email,

        phone:
          doctor.phone ||
          doctorUser.phone ||
          "",

        specialization:
          doctor.specialization ||
          "",

        department:
          doctor.department ||
          "",

        status:
          doctor.status ||
          "Available",
      });
    }

    console.log(
      "PATIENT CHAT DOCTORS:",
      {
        patientUserId,
        appointments:
          appointments.length,
        appointmentDoctors:
          appointmentDoctors.length,
        matchingDoctorUsers:
          doctorUsers.length,
        finalDoctors:
          doctors.length,
      }
    );

    return res.status(200).json({
      doctors,
    });
  } catch (error) {
    console.error(
      "Get chat doctors error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to get chat doctors",
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