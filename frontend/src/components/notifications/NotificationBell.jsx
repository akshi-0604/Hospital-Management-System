import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./NotificationBell.css";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleToggle = () => {
    setOpen((previous) => !previous);
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await api.patch(
          `/notifications/${notification._id}/read`
        );

        setNotifications((previous) =>
          previous.map((item) =>
            item._id === notification._id
              ? { ...item, read: true }
              : item
          )
        );

        setUnreadCount((previous) =>
          previous > 0 ? previous - 1 : 0
        );
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error.response?.data || error.message
      );
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate("/notifications");
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const notificationDate = new Date(date);
    const now = new Date();

    const difference =
      Math.floor((now - notificationDate) / 1000);

    if (difference < 60) {
      return "Just now";
    }

    if (difference < 3600) {
      const minutes = Math.floor(difference / 60);
      return `${minutes}m ago`;
    }

    if (difference < 86400) {
      const hours = Math.floor(difference / 3600);
      return `${hours}h ago`;
    }

    if (difference < 604800) {
      const days = Math.floor(difference / 86400);
      return `${days}d ago`;
    }

    return notificationDate.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "Appointment":
      case "Appointment Updated":
      case "Appointment Cancelled":
        return "📅";

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

  return (
    <div
      className="notification-wrapper"
      ref={dropdownRef}
    >
      <button
        type="button"
        className="notification-bell-button"
        onClick={handleToggle}
        aria-label="Notifications"
      >
        <span className="notification-bell-icon">🔔</span>

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <div>
              <h3>Notifications</h3>

              {unreadCount > 0 && (
                <span>
                  {unreadCount} unread
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={loadNotifications}
              className="notification-refresh-button"
            >
              ↻
            </button>
          </div>

          <div className="notification-dropdown-body">
            {loading ? (
              <div className="notification-empty">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <div className="notification-empty-icon">
                  🔔
                </div>

                <h4>No notifications</h4>

                <p>
                  You're all caught up.
                </p>
              </div>
            ) : (
              notifications
                .slice(0, 6)
                .map((notification) => (
                  <button
                    type="button"
                    key={notification._id}
                    className={`notification-item ${
                      !notification.read
                        ? "unread"
                        : ""
                    }`}
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                  >
                    <div className="notification-item-icon">
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    <div className="notification-item-content">
                      <div className="notification-item-title-row">
                        <h4>
                          {notification.title}
                        </h4>

                        {!notification.read && (
                          <span className="notification-unread-dot" />
                        )}
                      </div>

                      <p>
                        {notification.message}
                      </p>

                      <span className="notification-time">
                        {formatTime(
                          notification.createdAt
                        )}
                      </span>
                    </div>
                  </button>
                ))
            )}
          </div>

          <div className="notification-dropdown-footer">
            <button
              type="button"
              onClick={handleViewAll}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;