import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((previous) =>
        previous > 0 ? previous - 1 : 0
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error.response?.data || error.message
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error.response?.data || error.message
      );
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const notification = notifications.find(
        (item) => item._id === notificationId
      );

      await api.delete(
        `/notifications/${notificationId}`
      );

      setNotifications((previous) =>
        previous.filter(
          (item) => item._id !== notificationId
        )
      );

      if (notification && !notification.read) {
        setUnreadCount((previous) =>
          previous > 0 ? previous - 1 : 0
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error.response?.data || error.message
      );
    }
  };

  const deleteAllRead = async () => {
    try {
      await api.delete("/notifications/read/all");

      setNotifications((previous) =>
        previous.filter(
          (notification) => !notification.read
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete read notifications:",
        error.response?.data || error.message
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "Appointment":
        return "📅";

      case "Appointment Updated":
        return "🔄";

      case "Appointment Cancelled":
        return "❌";

      case "Medical Record":
        return "📋";

      case "Prescription":
        return "💊";

      case "Laboratory":
        return "🧪";

      case "Billing":
        return "💳";

      case "Security":
        return "🔐";

      case "Welcome":
        return "👋";

      case "Hospital Information":
        return "🏥";

      default:
        return "🔔";
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div>
            <button
              type="button"
              className="notifications-back-button"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>

            <h1>Notifications</h1>

            <p>
              Stay updated with your hospital activities.
            </p>
          </div>

          <div className="notifications-header-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="notifications-action-button"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}

            {notifications.some(
              (notification) => notification.read
            ) && (
              <button
                type="button"
                className="notifications-action-button danger"
                onClick={deleteAllRead}
              >
                Clear read
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="notifications-error">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">
              🔔
            </div>

            <h2>No notifications yet</h2>

            <p>
              When you have new hospital activities,
              they will appear here.
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-card ${
                  !notification.read
                    ? "notification-card-unread"
                    : ""
                }`}
              >
                <div className="notification-card-icon">
                  {getNotificationIcon(
                    notification.type
                  )}
                </div>

                <div className="notification-card-content">
                  <div className="notification-card-top">
                    <div>
                      <h3>
                        {notification.title}
                      </h3>

                      <span className="notification-type">
                        {notification.type}
                      </span>
                    </div>

                    {!notification.read && (
                      <span className="notification-new-badge">
                        New
                      </span>
                    )}
                  </div>

                  <p className="notification-card-message">
                    {notification.message}
                  </p>

                  <div className="notification-card-bottom">
                    <span>
                      {formatDate(
                        notification.createdAt
                      )}
                    </span>

                    <div className="notification-card-actions">
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(
                              notification._id
                            )
                          }
                        >
                          Mark as read
                        </button>
                      )}

                      <button
                        type="button"
                        className="delete"
                        onClick={() =>
                          deleteNotification(
                            notification._id
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;