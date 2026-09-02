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
            <div className="sidebar-brand">

                <div className="sidebar-logo">
                    +
                </div>

                <div className="sidebar-brand-text">

                    <h2>
                        HMS
                    </h2>

                    <span>
                        Hospital Management
                    </span>

                </div>

            </div>
            <nav className="sidebar-navigation">

                {/* MAIN MENU */}

                <p className="navigation-title">
                    MAIN MENU
                </p>


                {/* DASHBOARD */}

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


                {/* PATIENTS */}

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


                {/* DOCTORS */}

                <NavLink
                    to="/admin/doctors"
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
                        Doctors
                    </span>
                </NavLink>


                {/* APPOINTMENTS */}

                <NavLink
                    to="/admin/appointments"
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
                        Appointments
                    </span>
                </NavLink>


                {/* DEPARTMENTS */}

                <NavLink
                    to="/admin/departments"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-link-icon">
                        ▦
                    </span>

                    <span>
                        Departments
                    </span>
                </NavLink>


                {/* HOSPITAL MANAGEMENT */}

                <p className="navigation-title second-title">
                    HOSPITAL MANAGEMENT
                </p>


                {/* MEDICAL RECORDS */}

                <NavLink
                    to="/admin/medical-records"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-link-icon">
                        ▤
                    </span>

                    <span>
                        Medical Records
                    </span>
                </NavLink>


                {/* PRESCRIPTIONS */}

                <NavLink
                    to="/admin/prescriptions"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-link-icon">
                        ▤
                    </span>

                    <span>
                        Prescriptions
                    </span>
                </NavLink>


                {/* LABORATORY */}

                <NavLink
                    to="/admin/laboratory"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-link-icon">
                        +
                    </span>

                    <span>
                        Laboratory
                    </span>
                </NavLink>


                {/* BILLING */}

                <NavLink
                    to="/admin/billing"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
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

                {/* SETTINGS */}

                <NavLink
                    to="/admin/settings"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-link-icon">
                        ⚙
                    </span>

                    <span>
                        Settings
                    </span>
                </NavLink>


                {/* LOGOUT */}

                <button
                    type="button"
                    className="sidebar-logout"
                    onClick={handleLogout}
                >

                    <span className="sidebar-icon">
                        ↪
                    </span>

                    <span>
                        Logout
                    </span>

                </button>

            </div>

        </aside>
    );
}

export default Sidebar;