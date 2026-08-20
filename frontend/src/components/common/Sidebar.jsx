import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
    },
    {
      name: "Patients",
      path: "/admin/patients",
    },
    {
      name: "Doctors",
      path: "/admin/doctors",
    },
    {
      name: "Appointments",
      path: "/admin/appointments",
    },
    {
      name: "Medical Records",
      path: "/admin/medical-records",
    },
    {
      name: "Prescriptions",
      path: "/admin/prescriptions",
    },
    {
      name: "Laboratory",
      path: "/admin/laboratory",
    },
    {
      name: "Billing",
      path: "/admin/billing",
    },
    {
      name: "Admissions",
      path: "/admin/admissions",
    },
    {
      name: "Reports",
      path: "/admin/reports",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">+</div>

        <div>
          <h2>HMS</h2>
          <span>Hospital Management</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <p className="menu-title">MAIN MENU</p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <NavLink
          to="/admin/settings"
          className="sidebar-link"
        >
          Settings
        </NavLink>

        <button className="logout-button">
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;