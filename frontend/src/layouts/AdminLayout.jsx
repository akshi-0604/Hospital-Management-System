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

        {/* Top bar */}
        <div className="admin-topbar">

          <div className="admin-title-section">

            <h1>
              Hospital Management System
            </h1>

            <p>
              Admin Panel
            </p>

          </div>


          {/* Right side */}
          <div className="admin-topbar-right">

            {/* Theme Button */}
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
              {theme === "light" ? "🌙" : "☀️"}

              <span>
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


        {/* Current page */}
        <div className="admin-content">

          <Outlet />

        </div>

      </main>

    </div>
  );
}

export default AdminLayout;