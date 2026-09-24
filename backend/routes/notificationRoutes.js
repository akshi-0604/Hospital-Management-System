const express = require("express");

const {
  getPatientNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const {
  protectRoute,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/user/:userId",
  protectRoute,
  getPatientNotifications
);

router.patch(
  "/:id/read",
  protectRoute,
  markNotificationAsRead
);

router.patch(
  "/user/:userId/read-all",
  protectRoute,
  markAllNotificationsAsRead
);
module.exports = router;