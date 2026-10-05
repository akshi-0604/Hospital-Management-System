import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import NotificationBell from "../../components/notifications/NotificationBell";

import "./DoctorLayout.css";

function DoctorLayout() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Unable to load doctor user:", error);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  }

  function getInitial() {
    return (
      user?.fullName?.charAt(0)?.toUpperCase() ||
      user?.name?.charAt(0)?.toUpperCase() ||
      "D"
    );
  }

  function getUserName() {
    return (
      user?.fullName ||
      user?.name ||
      "Doctor"
    );
  }

  return (
    <div className="doctor-layout">
      <aside className="doctor-sidebar">

        <div className="doctor-sidebar-brand">

          <div className="doctor-brand-icon">
            🏥
          </div>

          <div className="doctor-brand-text">
            <h2>Hospital HMS</h2>
            <span>Doctor Portal</span>
          </div>

        </div>

        <nav className="doctor-sidebar-nav">

          <div className="doctor-nav-section-title">
            MAIN MENU
          </div>

          <NavLink
            to="/doctor/dashboard"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">
              🏠
            </span>

            <span>
              Overview
            </span>
          </NavLink>

          <NavLink
            to="/doctor/appointments"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">
              📅
            </span>

            <span>
              Appointments
            </span>
          </NavLink>

          <NavLink
            to="/doctor/patients"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">
              👥
            </span>

            <span>
              Patients
            </span>
          </NavLink>

          <NavLink
            to="/doctor/medical-records"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">
              📋
            </span>

            <span>
              Medical Records
            </span>
          </NavLink>

          <NavLink
            to="/doctor/prescriptions"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">
              💊
            </span>

            <span>
              Prescriptions
            </span>
          </NavLink>

          <NavLink
            to="/doctor/profile"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">
              👤
            </span>

            <span>
              Profile
            </span>
          </NavLink>

          <div className="doctor-nav-section-title doctor-quick-title">
            QUICK ACTIONS
          </div>

          <NavLink
            to="/doctor/dashboard"
            className="doctor-nav-link doctor-quick-link"
          >
            <span className="doctor-nav-icon">
              ⚡
            </span>

            <span>
              Quick Actions
            </span>
          </NavLink>

          <NavLink
            to="/doctor/notifications"
            className={({ isActive }) =>
              `doctor-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="doctor-nav-icon">
              🔔
            </span>

            <span>
              Notifications
            </span>
          </NavLink>

        </nav>
        <div className="doctor-sidebar-footer">

          <div className="doctor-sidebar-user">

            <div className="doctor-sidebar-avatar">
              {getInitial()}
            </div>

            <div className="doctor-sidebar-user-info">

              <strong>
                {getUserName()}
              </strong>

              <span>
                Doctor
              </span>

            </div>

          </div>

          <button
            type="button"
            className="doctor-logout-button"
            onClick={handleLogout}
          >
            <span className="doctor-nav-icon">
              🚪
            </span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      <div className="doctor-main-area">

        <header className="doctor-topbar">

          <div className="doctor-topbar-left">

            <div>
              <h1>
                Doctor Portal
              </h1>

              <p>
                Manage your appointments,
                patients and clinical records.
              </p>
            </div>

          </div>

          <div className="doctor-topbar-right">

            <NotificationBell />

            <div className="doctor-topbar-user">

              <div className="doctor-topbar-avatar">
                {getInitial()}
              </div>

              <div className="doctor-topbar-user-info">

                <strong>
                  {getUserName()}
                </strong>

                <span>
                  Doctor
                </span>

              </div>

            </div>

          </div>

        </header>

        <main className="doctor-page-content">

          <Outlet />

        </main>

      </div>

    </div>
  );
}

export default DoctorLayout;