import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import "./PatientLayout.css";

import NotificationBell from "../../components/notifications/NotificationBell";

function PatientLayout() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    function loadUser() {
        try {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                setUser(null);
                return;
            }

            const parsedUser = JSON.parse(storedUser);

            setUser(parsedUser);
        } catch (error) {
            console.error("Unable to load patient user:", error);
            setUser(null);
        }
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    }

    function getInitial() {
        return (
            user?.fullName?.charAt(0)?.toUpperCase() ||
            "P"
        );
    }

    return (
        <div className="patient-layout">

            <aside className="patient-sidebar">

                <div className="patient-sidebar-logo">

                    <div className="patient-logo-icon">
                        +
                    </div>

                    <div className="patient-logo-text">
                        <h2>HMS</h2>
                        <span>Hospital Management</span>
                    </div>

                </div>

                <div className="patient-sidebar-profile">

                    <div className="patient-sidebar-avatar">
                        {getInitial()}
                    </div>

                    <div className="patient-sidebar-user">

                        <strong>
                            {user?.fullName || "Patient"}
                        </strong>

                        <span>
                            Patient
                        </span>

                    </div>

                </div>

                <div className="patient-menu-section">

                    <p className="patient-menu-title">
                        MAIN MENU
                    </p>


                    <nav className="patient-sidebar-menu">
                        <NavLink
                            to="/patient/dashboard"
                            className={({ isActive }) =>
                                `patient-menu-item ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <span className="patient-menu-icon">
                                ⌂
                            </span>

                            <span>
                                Overview
                            </span>
                        </NavLink>

                        <NavLink
                            to="/patient/appointments"
                            className={({ isActive }) =>
                                `patient-menu-item ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <span className="patient-menu-icon">
                                ◷
                            </span>

                            <span>
                                Appointments
                            </span>
                        </NavLink>
                        <NavLink
                            to="/patient/medical-records"
                            className={({ isActive }) =>
                                `patient-menu-item ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <span className="patient-menu-icon">
                                ▤
                            </span>

                            <span>
                                Medical Records
                            </span>
                        </NavLink>

                        <NavLink
                            to="/patient/prescriptions"
                            className={({ isActive }) =>
                                `patient-menu-item ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <span className="patient-menu-icon">
                                ✚
                            </span>

                            <span>
                                Prescriptions
                            </span>
                        </NavLink>

                        <NavLink
                            to="/patient/laboratory"
                            className={({ isActive }) =>
                                `patient-menu-item ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <span className="patient-menu-icon">
                                ⚗
                            </span>

                            <span>
                                Laboratory
                            </span>
                        </NavLink>

                        <NavLink
                            to="/patient/billing"
                            className={({ isActive }) =>
                                `patient-menu-item ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <span className="patient-menu-icon">
                                ₹
                            </span>

                            <span>
                                Billing
                            </span>
                        </NavLink>

                    </nav>

                    <p className="patient-menu-title patient-account-title">
                        ACCOUNT
                    </p>


                    <nav className="patient-sidebar-menu">

                        <NavLink
                            to="/patient/profile"
                            className={({ isActive }) =>
                                `patient-menu-item ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <span className="patient-menu-icon">
                                ◉
                            </span>

                            <span>
                                Profile
                            </span>
                        </NavLink>


                        <NavLink
                            to="/patient/notifications"
                            className={({ isActive }) =>
                                `patient-menu-item ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <span className="patient-menu-icon">
                                🔔
                            </span>

                            <span>
                                Notifications
                            </span>
                        </NavLink>

                    </nav>

                </div>

                <div className="patient-sidebar-bottom">

                    <button
                        type="button"
                        className="patient-logout-button"
                        onClick={handleLogout}
                    >
                        <span className="patient-menu-icon">
                            ⇥
                        </span>

                        <span>
                            Logout
                        </span>
                    </button>

                </div>

            </aside>

            <main className="patient-main-content">

                <header className="patient-top-header">

                    <div className="patient-page-title">

                        <h1>
                            Patient Portal
                        </h1>

                        <p>
                            Manage your hospital information
                        </p>

                    </div>


                    <div className="patient-top-actions">

                        <NotificationBell />

                        <div className="patient-top-user">

                            <div className="patient-top-avatar">
                                {getInitial()}
                            </div>

                            <div>

                                <strong>
                                    {user?.fullName || "Patient"}
                                </strong>

                                <span>
                                    Patient
                                </span>

                            </div>

                        </div>

                    </div>

                </header>

                <div className="patient-page-content">

                    <Outlet />

                </div>

            </main>

        </div>
    );
}

export default PatientLayout;