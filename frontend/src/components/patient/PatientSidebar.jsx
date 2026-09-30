import { NavLink, useNavigate } from "react-router-dom";

import "./PatientSidebar.css";

function PatientSidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <aside className="patient-sidebar">

            <div className="patient-sidebar-brand">

                <div className="patient-sidebar-logo">
                    +
                </div>

                <div className="patient-sidebar-brand-text">
                    <h2>HMS</h2>
                    <span>Hospital Management</span>
                </div>

            </div>

            <div className="patient-sidebar-content">

                {/* MAIN MENU */}
                <div className="patient-sidebar-section">

                    <p className="patient-sidebar-section-title">
                        MAIN MENU
                    </p>

                    <NavLink
                        to="/patient/dashboard"
                        className={({ isActive }) =>
                            `patient-sidebar-link ${isActive ? "active" : ""
                            }`
                        }
                    >
                        <span className="patient-sidebar-icon">
                            ▣
                        </span>

                        <span>Overview</span>
                    </NavLink>

                </div>


                {/* PATIENT SERVICES */}
                <div className="patient-sidebar-section">

                    <p className="patient-sidebar-section-title">
                        PATIENT SERVICES
                    </p>


                    {/* Appointments */}
                    <NavLink
                        to="/patient/appointments"
                        className={({ isActive }) =>
                            `patient-sidebar-link ${isActive ? "active" : ""
                            }`
                        }
                    >
                        <span className="patient-sidebar-icon">
                            ▣
                        </span>

                        <span>Appointments</span>
                    </NavLink>


                    {/* Medical Records */}
                    <NavLink
                        to="/patient/medical-records"
                        className={({ isActive }) =>
                            `patient-sidebar-link ${isActive ? "active" : ""
                            }`
                        }
                    >
                        <span className="patient-sidebar-icon">
                            ▤
                        </span>

                        <span>Medical Records</span>
                    </NavLink>


                    {/* Prescriptions */}
                    <NavLink
                        to="/patient/prescriptions"
                        className={({ isActive }) =>
                            `patient-sidebar-link ${isActive ? "active" : ""
                            }`
                        }
                    >
                        <span className="patient-sidebar-icon">
                            ▤
                        </span>

                        <span>Prescriptions</span>
                    </NavLink>


                    {/* Laboratory */}
                    <NavLink
                        to="/patient/laboratory"
                        className={({ isActive }) =>
                            `patient-sidebar-link ${isActive ? "active" : ""
                            }`
                        }
                    >
                        <span className="patient-sidebar-icon">
                            +
                        </span>

                        <span>Laboratory</span>
                    </NavLink>


                    {/* Billing */}
                    <NavLink
                        to="/patient/billing"
                        className={({ isActive }) =>
                            `patient-sidebar-link ${isActive ? "active" : ""
                            }`
                        }
                    >
                        <span className="patient-sidebar-icon">
                            ₹
                        </span>

                        <span>Billing</span>
                    </NavLink>

                </div>


                {/* ACCOUNT */}
                <div className="patient-sidebar-section">

                    <p className="patient-sidebar-section-title">
                        ACCOUNT
                    </p>


                    {/* Profile */}
                    <NavLink
                        to="/patient/profile"
                        className={({ isActive }) =>
                            `patient-sidebar-link ${isActive ? "active" : ""
                            }`
                        }
                    >
                        <span className="patient-sidebar-icon">
                            ⚙
                        </span>

                        <span>Profile</span>
                    </NavLink>


                    {/* Notifications */}
                    <NavLink
                        to="/notifications"
                        className={({ isActive }) =>
                            `patient-sidebar-link ${isActive ? "active" : ""
                            }`
                        }
                    >
                        <span className="patient-sidebar-icon">
                            🔔
                        </span>

                        <span>Notifications</span>
                    </NavLink>

                </div>

            </div>

            <div className="patient-sidebar-footer">

                <button
                    type="button"
                    className="patient-sidebar-logout"
                    onClick={handleLogout}
                >
                    <span className="patient-sidebar-icon">
                        ↪
                    </span>

                    <span>Logout</span>
                </button>

            </div>

        </aside>
    );
}

export default PatientSidebar;