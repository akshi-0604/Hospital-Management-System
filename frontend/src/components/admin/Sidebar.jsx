import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    }
    return (
        <aside className="admin-sidebar">

            {/* Hospital Logo */}
            <div className="sidebar-brand">

                <div className="sidebar-logo">
                    +
                </div>

                <div className="sidebar-brand-text">
                    <h2>HMS</h2>
                    <span>Hospital Management</span>
                </div>

            </div>

            <nav className="sidebar-navigation">

                <p className="navigation-title">
                    MAIN MENU
                </p>


                <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-link-icon">
                        ▣
                    </span>

                    <span>
                        Dashboard
                    </span>
                </NavLink>


                <NavLink
                    to="/admin/patients"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-link-icon">
                        ♙
                    </span>

                    <span>
                        Patients
                    </span>
                </NavLink>


                <NavLink
                    to="/admin/doctors"
                    className="sidebar-link"
                >
                    <span className="sidebar-link-icon">
                        ♙
                    </span>

                    <span>
                        Doctors
                    </span>
                </NavLink>


                <NavLink
                    to="/admin/appointments"
                    className="sidebar-link"
                >
                    <span className="sidebar-link-icon">
                        ▣
                    </span>

                    <span>
                        Appointments
                    </span>
                </NavLink>


                <p className="navigation-title second-title">
                    HOSPITAL MANAGEMENT
                </p>


                <NavLink
                    to="/admin/medical-records"
                    className="sidebar-link"
                >
                    <span className="sidebar-link-icon">
                        ▤
                    </span>

                    <span>
                        Medical Records
                    </span>
                </NavLink>


                <NavLink
                    to="/admin/prescriptions"
                    className="sidebar-link"
                >
                    <span className="sidebar-link-icon">
                        ▤
                    </span>

                    <span>
                        Prescriptions
                    </span>
                </NavLink>


                <NavLink
                    to="/admin/laboratory"
                    className="sidebar-link"
                >
                    <span className="sidebar-link-icon">
                        +
                    </span>

                    <span>
                        Laboratory
                    </span>
                </NavLink>


                <NavLink
                    to="/admin/billing"
                    className="sidebar-link"
                >
                    <span className="sidebar-link-icon">
                        ₹
                    </span>

                    <span>
                        Billing
                    </span>
                </NavLink>

            </nav>
            <div className="sidebar-bottom">

                <NavLink
                    to="/admin/settings"
                    className="sidebar-link"
                >
                    <span className="sidebar-link-icon">
                        ⚙
                    </span>

                    <span>
                        Settings
                    </span>
                </NavLink>


                <button
                    type="button"
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    <span className="sidebar-icon">↪</span>
                    <span>Logout</span>
                </button>


            </div>

        </aside>
    );
}

export default Sidebar;