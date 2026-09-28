const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({
      recipient: userId,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get unread notification count error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch unread notification count",
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: id,
          recipient: userId,
        },
        {
          $set: {
            read: true,
          },
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      {
        recipient: userId,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification =
      await Notification.findOneAndDelete({
        _id: id,
        recipient: userId,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error(
      "Delete notification error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

const deleteAllReadNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.deleteMany({
      recipient: userId,
      read: true,
    });

    res.status(200).json({
      success: true,
      message: "Read notifications deleted",
    });
  } catch (error) {
    console.error(
      "Delete read notifications error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete read notifications",
    });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
};