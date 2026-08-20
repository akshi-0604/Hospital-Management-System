import { Outlet } from "react-router-dom";

import Sidebar from "../components/admin/Sidebar";

import "./AdminLayout.css";


function AdminLayout() {
  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <Sidebar />


      {/* Main area */}
      <main className="admin-main">

        <div className="admin-topbar">

          <div>
            <h1>Hospital Management System</h1>

            <p>
              Admin Panel
            </p>
          </div>


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


        {/* Current page */}
        <div className="admin-content">

          <Outlet />

        </div>

      </main>

    </div>
  );
}


export default AdminLayout;