const express = require("express");

const {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
} = require("../controllers/notificationController");

const {
  protectRoute,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protectRoute,
  getMyNotifications
);

router.get(
  "/unread-count",
  protectRoute,
  getUnreadNotificationCount
);

router.patch(
  "/:id/read",
  protectRoute,
  markNotificationAsRead
);

router.patch(
  "/read-all",
  protectRoute,
  markAllNotificationsAsRead
);

router.delete(
  "/:id",
  protectRoute,
  deleteNotification
);

router.delete(
  "/read/all",
  protectRoute,
  deleteAllReadNotifications
);

module.exports = router;