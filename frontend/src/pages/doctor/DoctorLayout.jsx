import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import NotificationBell from "../../components/notifications/NotificationBell";
import "./DoctorLayout.css";

const DoctorLayout = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error reading user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  const getInitials = () => {
    if (!user) return "D";

    const name =
      user.fullName ||
      user.name ||
      user.username ||
      "Doctor";

    const words = name.trim().split(" ");

    if (words.length >= 2) {
      return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
      ).toUpperCase();
    }

    return name.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    if (!user) return "Doctor";

    return (
      user.fullName ||
      user.name ||
      user.username ||
      "Doctor"
    );
  };

  return (
    <div className="doctor-layout">

      {/* ================= SIDEBAR ================= */}
      <aside className="doctor-sidebar">

        {/* Logo / Hospital Name */}
        <div className="doctor-sidebar-header">
          <div className="doctor-logo-icon">
            🏥
          </div>

          <div className="doctor-logo-text">
            <h2>Hospital HMS</h2>
            <span>Doctor Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="doctor-sidebar-nav">

          <div className="doctor-nav-section-title">
            MAIN MENU
          </div>

          <NavLink
            to="/doctor/dashboard"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "doctor-nav-link-active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">🏠</span>
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/doctor/appointments"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "doctor-nav-link-active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">📅</span>
            <span>Appointments</span>
          </NavLink>

          <NavLink
            to="/doctor/patients"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "doctor-nav-link-active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">👥</span>
            <span>Patients</span>
          </NavLink>

          <NavLink
            to="/doctor/medical-records"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "doctor-nav-link-active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">📋</span>
            <span>Medical Records</span>
          </NavLink>

          <NavLink
            to="/doctor/prescriptions"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "doctor-nav-link-active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">💊</span>
            <span>Prescriptions</span>
          </NavLink>

          <div className="doctor-nav-section-title doctor-nav-section-spacing">
            ACCOUNT
          </div>

          <NavLink
            to="/doctor/profile"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "doctor-nav-link-active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">👤</span>
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/doctor/notifications"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "doctor-nav-link-active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">🔔</span>
            <span>Notifications</span>
          </NavLink>

          {/* Quick Actions */}
          <NavLink
            to="/doctor/dashboard"
            className="doctor-nav-link"
          >
            <span className="doctor-nav-icon">⚡</span>
            <span>Quick Actions</span>
          </NavLink>

        </nav>

        {/* Logout */}
        <div className="doctor-sidebar-footer">
          <button
            type="button"
            className="doctor-logout-button"
            onClick={handleLogout}
          >
            <span className="doctor-nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>

      </aside>

      {/* ================= MAIN AREA ================= */}
      <div className="doctor-main">

        {/* TOP HEADER */}
        <header className="doctor-topbar">

          <div className="doctor-topbar-left">
            <div>
              <span className="doctor-topbar-label">
                Doctor Portal
              </span>

              <h3>
                Hospital Management System
              </h3>
            </div>
          </div>

          <div className="doctor-topbar-right">

            <NotificationBell />

            <div className="doctor-user-info">
              <div className="doctor-user-avatar">
                {getInitials()}
              </div>

              <div className="doctor-user-details">
                <strong>{getDisplayName()}</strong>
                <span>Doctor</span>
              </div>
            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}
        <main className="doctor-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default DoctorLayout;