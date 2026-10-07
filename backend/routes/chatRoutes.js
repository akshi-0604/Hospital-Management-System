const express = require("express");

const {
  sendMessage,
  getConversation,
  getChatUsers,
  markMessagesAsRead,
} = require("../controllers/chatController");

const {
  protectRoute,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/conversations",
  protectRoute,
  allowRoles("doctor", "patient"),
  getChatUsers
);

router.get(
  "/conversation/:userId",
  protectRoute,
  allowRoles("doctor", "patient"),
  getConversation
);

router.post(
  "/send",
  protectRoute,
  allowRoles("doctor", "patient"),
  sendMessage
);

router.patch(
  "/read/:userId",
  protectRoute,
  allowRoles("doctor", "patient"),
  markMessagesAsRead
);

module.exports = router;