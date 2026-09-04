const express = require("express");

const {
  getPatientNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get(
  "/user/:userId",
  getPatientNotifications
);

router.patch(
  "/:id/read",
  markNotificationAsRead
);

router.patch(
  "/user/:userId/read-all",
  markAllNotificationsAsRead
);

module.exports = router;