const express = require("express");

const {
  sendMessage,
  getConversation,
  getChatUsers,
  markMessagesAsRead,
  getChatPatients,
  getChatDoctors,
} = require("../controllers/chatController");

const {
  protectRoute,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/conversations",
  protectRoute,
  allowRoles(
    "doctor",
    "patient"
  ),
  getChatUsers
);

router.get(
  "/patients",
  protectRoute,
  allowRoles("doctor"),
  getChatPatients
);

router.get(
  "/doctors",
  protectRoute,
  allowRoles("patient"),
  getChatDoctors
);

router.get(
  "/conversation/:userId",
  protectRoute,
  allowRoles(
    "doctor",
    "patient"
  ),
  getConversation
);

router.post(
  "/send",
  protectRoute,
  allowRoles(
    "doctor",
    "patient"
  ),
  sendMessage
);

router.patch(
  "/read/:userId",
  protectRoute,
  allowRoles(
    "doctor",
    "patient"
  ),
  markMessagesAsRead
);


module.exports = router;