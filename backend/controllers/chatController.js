const Message = require("../models/Message");
const User = require("../models/User");

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user?.userId || req.user?.id || req.user?._id;
    const senderRole = req.user?.role;

    const { receiverId, message } = req.body;

    if (!senderId) {
      return res.status(401).json({
        message: "User authentication information not found",
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

    if (!["doctor", "patient"].includes(senderRole)) {
      return res.status(403).json({
        message: "Only doctors and patients can use chat",
      });
    }

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({
        message: "You cannot send a message to yourself",
      });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    // Doctor can chat only with patient
    if (senderRole === "doctor" && receiver.role !== "patient") {
      return res.status(403).json({
        message: "Doctors can chat only with patients",
      });
    }

    // Patient can chat only with doctor
    if (senderRole === "patient" && receiver.role !== "doctor") {
      return res.status(403).json({
        message: "Patients can chat only with doctors",
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      senderRole,
      receiverRole: receiver.role,
      message: message.trim(),
      isRead: false,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "fullName name email role")
      .populate("receiver", "fullName name email role");

    return res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};

const getConversation = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const otherUserId = req.params.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication information not found",
      });
    }

    if (!otherUserId) {
      return res.status(400).json({
        message: "Other user ID is required",
      });
    }

    const currentUser = await User.findById(userId);
    const otherUser = await User.findById(otherUserId);

    if (!currentUser || !otherUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const validConversation =
      (currentUser.role === "doctor" && otherUser.role === "patient") ||
      (currentUser.role === "patient" && otherUser.role === "doctor");

    if (!validConversation) {
      return res.status(403).json({
        message: "Chat is available only between doctors and patients",
      });
    }

    const messages = await Message.find({
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
      .populate("sender", "fullName name email role")
      .populate("receiver", "fullName name email role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error("Get conversation error:", error);

    return res.status(500).json({
      message: "Failed to get conversation",
      error: error.message,
    });
  }
};

const getChatUsers = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication information not found",
      });
    }

    if (!["doctor", "patient"].includes(userRole)) {
      return res.status(403).json({
        message: "Only doctors and patients can use chat",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
      .populate("sender", "fullName name email role")
      .populate("receiver", "fullName name email role")
      .sort({ createdAt: -1 });

    const conversationMap = new Map();

    for (const message of messages) {
      const senderId = String(message.sender?._id);
      const receiverId = String(message.receiver?._id);

      const otherUser =
        senderId === String(userId)
          ? message.receiver
          : message.sender;

      if (!otherUser) {
        continue;
      }

      const otherUserId = String(otherUser._id);

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      if (
        String(message.receiver?._id) === String(userId) &&
        !message.isRead
      ) {
        conversationMap.get(otherUserId).unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationMap.values());

    return res.status(200).json({
      conversations,
    });
  } catch (error) {
    console.error("Get chat users error:", error);

    return res.status(500).json({
      message: "Failed to get chat conversations",
      error: error.message,
    });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const otherUserId = req.params.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication information not found",
      });
    }

    if (!otherUserId) {
      return res.status(400).json({
        message: "Other user ID is required",
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
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);

    return res.status(500).json({
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

// GET PATIENTS FOR DOCTOR CHAT
const getChatPatients = async (req, res) => {
  try {
    const userId =
      req.user?.userId ||
      req.user?.id ||
      req.user?._id;

    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication information not found",
      });
    }

    if (userRole !== "doctor") {
      return res.status(403).json({
        message: "Only doctors can access chat patients",
      });
    }

    const patients = await User.find({
      role: "patient",
    }).select(
      "fullName name email role phone phoneNumber gender dateOfBirth"
    );

    return res.status(200).json({
      patients,
    });
  } catch (error) {
    console.error("Get chat patients error:", error);

    return res.status(500).json({
      message: "Failed to get chat patients",
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
};