import { useEffect, useState } from "react";
import axios from "axios";

import "./PatientNotifications.css";

const API_BASE_URL =
  "https://hospital-management-system-nvjt.onrender.com/api";

const NOTIFICATIONS_URL =
  `${API_BASE_URL}/notifications`;

function PatientNotifications({ userId }) {
  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function fetchNotifications() {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await axios.get(
        `${NOTIFICATIONS_URL}/user/${userId}`
      );

      setNotifications(
        response.data?.notifications || []
      );

      setUnreadCount(
        response.data?.unreadCount || 0
      );
    } catch (error) {
      console.error(
        "Notification fetch error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();

    const interval =
      setInterval(() => {
        fetchNotifications();
      }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [userId]);

  async function markAsRead(
    notificationId
  ) {
    try {
      await axios.patch(
        `${NOTIFICATIONS_URL}/${notificationId}/read`
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification._id ===
              notificationId
                ? {
                    ...notification,
                    read: true,
                  }
                : notification
          )
      );

      setUnreadCount(
        (previous) =>
          Math.max(previous - 1, 0)
      );
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    }
  }

  async function markAllAsRead() {
    if (
      !userId ||
      unreadCount === 0
    ) {
      return;
    }

    try {
      await axios.patch(
        `${NOTIFICATIONS_URL}/user/${userId}/read-all`
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              read: true,
            })
          )
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case "Appointment":
      case "Appointment Updated":
      case "Appointment Cancelled":
        return "📅";

      case "Medical Record":
        return "🩺";

      case "Prescription":
        return "💊";

      case "Laboratory":
        return "🧪";

      case "Billing":
        return "💳";

      case "Hospital Information":
        return "🏥";

      case "Welcome":
        return "👋";

      default:
        return "🔔";
    }
  }

  function formatDate(date) {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  return (
    <div className="patient-notifications">
      <div className="notifications-header">
        <div>
          <h2>
            Notifications
          </h2>

          <p>
            Stay updated with your
            hospital information and
            appointments.
          </p>
        </div>

        <div className="notification-header-right">
          <span className="unread-badge">
            {unreadCount} unread
          </span>

          <button
            type="button"
            className="mark-all-button"
            onClick={
              markAllAsRead
            }
            disabled={
              unreadCount === 0
            }
          >
            Mark all as read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="notification-state">
          Loading notifications...
        </div>
      ) : error ? (
        <div className="notification-error">
          {error}
        </div>
      ) : notifications.length ===
        0 ? (
        <div className="notification-state">
          <div className="empty-notification-icon">
            🔔
          </div>

          <h3>
            No notifications
          </h3>

          <p>
            You are all caught up.
          </p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map(
            (notification) => (
              <div
                key={
                  notification._id
                }
                className={`notification-card ${
                  notification.read
                    ? "notification-read"
                    : "notification-unread"
                }`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(
                    notification.type
                  )}
                </div>

                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3>
                      {
                        notification.title
                      }
                    </h3>

                    {!notification.read && (
                      <span className="new-badge">
                        NEW
                      </span>
                    )}
                  </div>

                  <p>
                    {
                      notification.message
                    }
                  </p>

                  <span className="notification-date">
                    {formatDate(
                      notification.createdAt
                    )}
                  </span>

                  {!notification.read && (
                    <button
                      type="button"
                      className="mark-read-button"
                      onClick={() =>
                        markAsRead(
                          notification._id
                        )
                      }
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default PatientNotifications;