import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

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
      console.error(
        "Unable to load doctor user:",
        error
      );
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  }

  function getLinkClass({ isActive }) {
    return isActive
      ? "doctor-sidebar-link active"
      : "doctor-sidebar-link";
  }

  return (
    <div className="doctor-layout">
      <aside className="doctor-sidebar">
        <div className="doctor-sidebar-brand">
          

          <div>
            <strong>Hospital HMS</strong>
            <span>Doctor Portal</span>
          </div>
        </div>

        <nav className="doctor-sidebar-nav">
          <NavLink
            to="/doctor/dashboard"
            className={getLinkClass}
          >
            
            Overview
          </NavLink>

          <NavLink
            to="/doctor/appointments"
            className={getLinkClass}
          >
            
            Appointments
          </NavLink>

          <NavLink
            to="/doctor/patients"
            className={getLinkClass}
          >
            
            Patients
          </NavLink>

          <NavLink
            to="/doctor/medical-records"
            className={getLinkClass}
          >
            
            Medical Records
          </NavLink>

          <NavLink
            to="/doctor/prescriptions"
            className={getLinkClass}
          >
            
            Prescriptions
          </NavLink>

          <NavLink
            to="/doctor/laboratory"
            className={getLinkClass}
          >
            
            Laboratory
          </NavLink>

          <NavLink
            to="/doctor/profile"
            className={getLinkClass}
          >
            
            Profile
          </NavLink>

          <NavLink
            to="/doctor/quick-actions"
            className={getLinkClass}
          >
            
            Quick Actions
          </NavLink>

          <NavLink
            to="/doctor/notifications"
            className={getLinkClass}
          >
            
            Notifications
          </NavLink>
        </nav>

        <div className="doctor-sidebar-bottom">
          <button
            type="button"
            className="doctor-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="doctor-main">
        <header className="doctor-topbar">
          <div>
            <h2>Doctor Dashboard</h2>

            <span>
              Welcome,{" "}
              {user?.fullName ||
                user?.name ||
                "Doctor"}
            </span>
          </div>

          <div className="doctor-topbar-right">
            <NotificationBell />

            <div className="doctor-user-info">
              <div className="doctor-user-avatar">
                {(
                  user?.fullName ||
                  user?.name ||
                  "D"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {user?.fullName ||
                    user?.name ||
                    "Doctor"}
                </strong>

                <span>Doctor</span>
              </div>
            </div>
          </div>
        </header>

        <main className="doctor-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DoctorLayout;