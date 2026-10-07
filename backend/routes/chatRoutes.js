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

const upload = require("../middleware/upload");

const router = express.Router();

router.get(
  "/conversations",
  protectRoute,
  allowRoles("doctor", "patient"),
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
  allowRoles("doctor", "patient"),
  getConversation
);

router.post(
  "/send",
  protectRoute,
  allowRoles("doctor", "patient"),
  (req, res, next) => {
    upload.single("file")(req, res, (error) => {
      if (error) {
        console.error("CHAT FILE UPLOAD ERROR:", error);

        return res.status(400).json({
          success: false,
          message:
            error.message ||
            "Failed to upload the attachment.",
        });
      }

      next();
    });
  },
  sendMessage
);

router.patch(
  "/read/:userId",
  protectRoute,
  allowRoles("doctor", "patient"),
  markMessagesAsRead
);

module.exports = router;
