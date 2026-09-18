import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./Settings.css";

const HOSPITAL_INFORMATION = {
  name: "Hospital Management System",
  phone: "+91 98765 43210",
  email: "support@hospital.com",
  address: "Hospital Main Building, Healthcare Avenue, India",
  workingHours: "Monday to Saturday, 8:00 AM to 8:00 PM",
  emergency: "Emergency services available 24/7",
};

const DEFAULT_NOTIFICATIONS = {
  appointments: true,
  billing: true,
  medicalRecords: true,
  laboratory: true,
  hospitalInformation: true,
};

function Settings() {
  const [user, setUser] = useState(null);

  const [notifications, setNotifications] =
    useState(DEFAULT_NOTIFICATIONS);

  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  function loadSettings() {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        const parsedUser =
          JSON.parse(storedUser);

        setUser(parsedUser);
      }
    } catch (error) {
      console.error(
        "Unable to read user information:",
        error
      );
    }

    try {
      const savedNotifications =
        localStorage.getItem(
          "hms-notification-settings"
        );

      if (savedNotifications) {
        const parsedNotifications =
          JSON.parse(savedNotifications);

        setNotifications({
          ...DEFAULT_NOTIFICATIONS,
          ...parsedNotifications,
        });
      }
    } catch (error) {
      console.error(
        "Unable to read notification settings:",
        error
      );
    }
  }

  function handleNotificationChange(
    settingName
  ) {
    setNotifications((previous) => ({
      ...previous,
      [settingName]:
        !previous[settingName],
    }));

    setSavedMessage("");
  }

  function saveNotificationSettings() {
    try {
      localStorage.setItem(
        "hms-notification-settings",
        JSON.stringify(notifications)
      );

      setSavedMessage(
        "Notification settings saved successfully."
      );

      setTimeout(() => {
        setSavedMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Unable to save notification settings:",
        error
      );
    }
  }

  function getDisplayValue(value) {
    if (
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    ) {
      return "Not provided";
    }

    return value;
  }

  function formatRole(role) {
    if (!role) {
      return "Admin";
    }

    return (
      role.charAt(0).toUpperCase() +
      role.slice(1)
    );
  }

  return (
    <div className="settings-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="settings-header">
        <div>
          <h2>Settings</h2>

          <p>
            Manage your account,
            notification preferences,
            and hospital information.
          </p>
        </div>
      </div>


      {/* =========================
          ACCOUNT INFORMATION
      ========================= */}

      <section className="settings-card">

        <div className="settings-card-header">
          <div className="settings-section-icon">
            👤
          </div>

          <div>
            <h3>Account Information</h3>

            <p>
              Information associated with
              the current account.
            </p>
          </div>
        </div>

        <div className="settings-account-profile">

          <div className="settings-profile-avatar">
            {user?.fullName
              ? user.fullName
                  .charAt(0)
                  .toUpperCase()
              : "A"}
          </div>

          <div className="settings-profile-main">
            <h4>
              {getDisplayValue(
                user?.fullName
              )}
            </h4>

            <span>
              {formatRole(user?.role)}
            </span>
          </div>

        </div>

        <div className="settings-details-grid">

          <div className="settings-detail-item">
            <label>
              Full Name
            </label>

            <strong>
              {getDisplayValue(
                user?.fullName
              )}
            </strong>
          </div>

          <div className="settings-detail-item">
            <label>
              Email Address
            </label>

            <strong>
              {getDisplayValue(
                user?.email
              )}
            </strong>
          </div>

          <div className="settings-detail-item">
            <label>
              Phone Number
            </label>

            <strong>
              {getDisplayValue(
                user?.phone
              )}
            </strong>
          </div>

          <div className="settings-detail-item">
            <label>
              Role
            </label>

            <strong>
              {formatRole(
                user?.role
              )}
            </strong>
          </div>

        </div>

      </section>


      {/* =========================
          NOTIFICATION SETTINGS
      ========================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            🔔
          </div>

          <div>
            <h3>
              Notification Preferences
            </h3>

            <p>
              Choose which hospital updates
              you want to keep enabled.
            </p>
          </div>

        </div>


        <div className="settings-options">

          {/* APPOINTMENTS */}

          <div className="settings-option">

            <div className="settings-option-content">

              <div className="settings-option-icon">
                📅
              </div>

              <div>
                <h4>
                  Appointment Updates
                </h4>

                <p>
                  Receive updates when appointments
                  are created, confirmed, completed,
                  updated, or cancelled.
                </p>
              </div>

            </div>

            <label className="settings-switch">

              <input
                type="checkbox"
                checked={
                  notifications.appointments
                }
                onChange={() =>
                  handleNotificationChange(
                    "appointments"
                  )
                }
              />

              <span className="settings-slider"></span>

            </label>

          </div>


          {/* BILLING */}

          <div className="settings-option">

            <div className="settings-option-content">

              <div className="settings-option-icon">
                ₹
              </div>

              <div>
                <h4>
                  Billing Updates
                </h4>

                <p>
                  Receive notifications related
                  to billing and payment updates.
                </p>
              </div>

            </div>

            <label className="settings-switch">

              <input
                type="checkbox"
                checked={
                  notifications.billing
                }
                onChange={() =>
                  handleNotificationChange(
                    "billing"
                  )
                }
              />

              <span className="settings-slider"></span>

            </label>

          </div>


          {/* MEDICAL RECORDS */}

          <div className="settings-option">

            <div className="settings-option-content">

              <div className="settings-option-icon">
                📋
              </div>

              <div>
                <h4>
                  Medical Record Updates
                </h4>

                <p>
                  Receive notifications when
                  medical records are added or updated.
                </p>
              </div>

            </div>

            <label className="settings-switch">

              <input
                type="checkbox"
                checked={
                  notifications.medicalRecords
                }
                onChange={() =>
                  handleNotificationChange(
                    "medicalRecords"
                  )
                }
              />

              <span className="settings-slider"></span>

            </label>

          </div>


          {/* LABORATORY */}

          <div className="settings-option">

            <div className="settings-option-content">

              <div className="settings-option-icon">
                🧪
              </div>

              <div>
                <h4>
                  Laboratory Updates
                </h4>

                <p>
                  Receive updates related to
                  laboratory reports and test results.
                </p>
              </div>

            </div>

            <label className="settings-switch">

              <input
                type="checkbox"
                checked={
                  notifications.laboratory
                }
                onChange={() =>
                  handleNotificationChange(
                    "laboratory"
                  )
                }
              />

              <span className="settings-slider"></span>

            </label>

          </div>


          {/* HOSPITAL INFORMATION */}

          <div className="settings-option">

            <div className="settings-option-content">

              <div className="settings-option-icon">
                🏥
              </div>

              <div>
                <h4>
                  Hospital Information
                </h4>

                <p>
                  Receive important hospital
                  announcements and information updates.
                </p>
              </div>

            </div>

            <label className="settings-switch">

              <input
                type="checkbox"
                checked={
                  notifications.hospitalInformation
                }
                onChange={() =>
                  handleNotificationChange(
                    "hospitalInformation"
                  )
                }
              />

              <span className="settings-slider"></span>

            </label>

          </div>

        </div>


        {savedMessage && (
          <div className="settings-success-message">
            {savedMessage}
          </div>
        )}


        <div className="settings-actions">

          <button
            type="button"
            className="settings-save-button"
            onClick={
              saveNotificationSettings
            }
          >
            Save Notification Settings
          </button>

        </div>

      </section>


      {/* =========================
          HOSPITAL INFORMATION
      ========================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            🏥
          </div>

          <div>
            <h3>
              Hospital Information
            </h3>

            <p>
              General information displayed
              throughout the hospital system.
            </p>
          </div>

        </div>


        <div className="hospital-info-grid">

          <div className="settings-detail-item">
            <label>
              Hospital Name
            </label>

            <strong>
              {HOSPITAL_INFORMATION.name}
            </strong>
          </div>


          <div className="settings-detail-item">
            <label>
              Phone
            </label>

            <strong>
              {HOSPITAL_INFORMATION.phone}
            </strong>
          </div>


          <div className="settings-detail-item">
            <label>
              Email
            </label>

            <strong>
              {HOSPITAL_INFORMATION.email}
            </strong>
          </div>


          <div className="settings-detail-item">
            <label>
              Working Hours
            </label>

            <strong>
              {HOSPITAL_INFORMATION.workingHours}
            </strong>
          </div>


          <div className="settings-detail-item settings-detail-full">
            <label>
              Address
            </label>

            <strong>
              {HOSPITAL_INFORMATION.address}
            </strong>
          </div>


          <div className="settings-detail-item settings-detail-full">
            <label>
              Emergency Services
            </label>

            <strong>
              {HOSPITAL_INFORMATION.emergency}
            </strong>
          </div>

        </div>

      </section>


      {/* =========================
          SECURITY
      ========================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            🔐
          </div>

          <div>
            <h3>
              Security
            </h3>

            <p>
              Manage password recovery and account security.
            </p>
          </div>

        </div>


        <div className="security-box">

          <div className="security-content">

            <div className="security-icon">
              🔑
            </div>

            <div>
              <h4>
                Password Management
              </h4>

              <p>
                Use the password recovery flow
                to create a new account password.
              </p>
            </div>

          </div>

          <Link
            to="/forgot-password"
            className="security-button"
          >
            Reset Password
          </Link>

        </div>

      </section>


      {/* =========================
          DISPLAY INFORMATION
      ========================= */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            🖥️
          </div>

          <div>
            <h3>
              Display
            </h3>

            <p>
              Theme settings for the hospital
              management application.
            </p>
          </div>

        </div>


        <div className="display-info">

          <div className="display-icon">
            🌙
          </div>

          <div>
            <h4>
              Light / Dark Mode
            </h4>

            <p>
              Use the Light / Dark Mode button
              in the main navigation bar to change
              the application theme.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Settings;