import { Outlet } from "react-router-dom";

import Sidebar from "../components/admin/Sidebar";

import { useTheme } from "../context/ThemeContext";

import "./AdminLayout.css";

function AdminLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <main className="admin-main">

        {/* Top Bar */}
        <div className="admin-topbar">

          <div className="admin-title-section">

            <h1>
              Hospital Management System
            </h1>

            <p>
              Admin Panel
            </p>

          </div>


          {/* Topbar Right Side */}
          <div className="admin-topbar-right">

            {/* Theme Toggle */}
            <button
              type="button"
              className="theme-toggle-button"
              onClick={toggleTheme}
              title={
                theme === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"
              }
            >

              <span className="theme-toggle-icon">
                {theme === "light" ? "🌙" : "☀️"}
              </span>

              <span className="theme-toggle-text">
                {theme === "light"
                  ? "Dark"
                  : "Light"}
              </span>

            </button>


            {/* Admin Profile */}
            <div className="admin-profile">

              <div className="profile-avatar">
                A
              </div>

              <div className="profile-info">

                <strong>
                  Administrator
                </strong>

                <span>
                  Admin
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* Current Page */}
        <div className="admin-content">

          <Outlet />

        </div>

      </main>

    </div>
  );
}

export default AdminLayout;