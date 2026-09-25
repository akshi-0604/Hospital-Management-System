import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

import "./Dashboard.css";

function Dashboard() {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [bills, setBills] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            setLoading(true);
            setError("");

            const results =
                await Promise.allSettled([
                    api.get("/patients"),

                    api.get("/doctors"),

                    api.get("/appointments"),

                    api.get("/billing"),
                ]);

            if (
                results[0].status ===
                "fulfilled"
            ) {
                const response =
                    results[0].value
                        .data;

                if (
                    Array.isArray(
                        response
                    )
                ) {
                    setPatients(
                        response
                    );
                } else if (
                    Array.isArray(
                        response?.patients
                    )
                ) {
                    setPatients(
                        response.patients
                    );
                } else if (
                    Array.isArray(
                        response?.data
                    )
                ) {
                    setPatients(
                        response.data
                    );
                } else {
                    setPatients([]);
                }
            } else {
                console.error(
                    "Patients API error:",
                    results[0].reason
                );

                setPatients([]);
            }
            if (
                results[1].status ===
                "fulfilled"
            ) {
                const response =
                    results[1].value
                        .data;

                if (
                    Array.isArray(
                        response
                    )
                ) {
                    setDoctors(
                        response
                    );
                } else if (
                    Array.isArray(
                        response?.doctors
                    )
                ) {
                    setDoctors(
                        response.doctors
                    );
                } else if (
                    Array.isArray(
                        response?.data
                    )
                ) {
                    setDoctors(
                        response.data
                    );
                } else {
                    setDoctors([]);
                }
            } else {
                console.error(
                    "Doctors API error:",
                    results[1].reason
                );

                setDoctors([]);
            }
            if (
                results[2].status ===
                "fulfilled"
            ) {
                const response =
                    results[2].value
                        .data;

                if (
                    Array.isArray(
                        response
                    )
                ) {
                    setAppointments(
                        response
                    );
                } else if (
                    Array.isArray(
                        response?.appointments
                    )
                ) {
                    setAppointments(
                        response.appointments
                    );
                } else if (
                    Array.isArray(
                        response?.data
                    )
                ) {
                    setAppointments(
                        response.data
                    );
                } else {
                    setAppointments([]);
                }
            } else {
                console.error(
                    "Appointments API error:",
                    results[2].reason
                );

                setAppointments([]);
            }

            if (
                results[3].status ===
                "fulfilled"
            ) {
                const response =
                    results[3].value
                        .data;

                console.log(
                    "Billing API response:",
                    response
                );

                if (
                    Array.isArray(
                        response
                    )
                ) {
                    setBills(response);
                } else if (
                    Array.isArray(
                        response?.bills
                    )
                ) {
                    setBills(
                        response.bills
                    );
                } else if (
                    Array.isArray(
                        response?.billing
                    )
                ) {
                    setBills(
                        response.billing
                    );
                } else if (
                    Array.isArray(
                        response?.data
                    )
                ) {
                    setBills(
                        response.data
                    );
                } else {
                    setBills([]);
                }
            } else {
                console.error(
                    "Billing API error:",
                    results[3].reason
                );

                setBills([]);
            }

            const allFailed =
                results.every(
                    (result) =>
                        result.status ===
                        "rejected"
                );

            if (allFailed) {
                setError(
                    "Unable to load dashboard data. Please check the backend."
                );
            }
        } catch (error) {
            console.error(
                "Dashboard loading error:",
                error
            );

            setError(
                "Unable to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    }
    function isToday(dateValue) {
        if (!dateValue) {
            return false;
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return false;
        }

        const today =
            new Date();

        return (
            date.getDate() ===
            today.getDate() &&
            date.getMonth() ===
            today.getMonth() &&
            date.getFullYear() ===
            today.getFullYear()
        );
    }
    const totalDepartments =
        useMemo(() => {
            const departmentNames =
                doctors
                    .map((doctor) =>
                        String(
                            doctor?.department ||
                            ""
                        )
                            .trim()
                            .toLowerCase()
                    )
                    .filter(Boolean);

            return new Set(
                departmentNames
            ).size;
        }, [doctors]);

    const todaysAppointments =
        useMemo(() => {
            return appointments.filter(
                (appointment) => {
                    return (
                        isToday(
                            appointment?.appointmentDate
                        ) ||
                        isToday(
                            appointment?.date
                        ) ||
                        isToday(
                            appointment?.scheduledDate
                        )
                    );
                }
            );
        }, [appointments]);

    const totalPaidRevenue =
        useMemo(() => {
            return bills.reduce(
                (total, bill) => {
                    const paymentStatus =
                        String(
                            bill?.paymentStatus ||
                            ""
                        )
                            .trim()
                            .toLowerCase();

                    let amount =
                        Number(
                            bill?.amountPaid
                        );

                    if (
                        (!Number.isFinite(amount) ||
                            amount <= 0) &&
                        paymentStatus === "paid"
                    ) {
                        amount =
                            Number(
                                bill?.totalAmount ||
                                0
                            );
                    }

                    if (
                        !Number.isFinite(amount) ||
                        amount <= 0
                    ) {
                        return total;
                    }

                    return total + amount;
                },
                0
            );
        }, [bills]);

    const todaysPaidRevenue =
        useMemo(() => {
            return bills.reduce(
                (total, bill) => {
                    const paymentStatus =
                        String(
                            bill?.paymentStatus ||
                            bill?.status ||
                            ""
                        )
                            .trim()
                            .toLowerCase();

                    if (
                        paymentStatus !==
                        "paid"
                    ) {
                        return total;
                    }

                    const billDate =
                        bill?.invoiceDate ||
                        bill?.createdAt;

                    if (
                        !isToday(
                            billDate
                        )
                    ) {
                        return total;
                    }

                    const amount =
                        Number(
                            bill?.totalAmount ??
                            bill?.amount ??
                            bill?.total ??
                            0
                        );

                    if (
                        Number.isNaN(
                            amount
                        )
                    ) {
                        return total;
                    }

                    return (
                        total + amount
                    );
                },
                0
            );
        }, [bills]);
    const recentAppointments =
        useMemo(() => {
            const sorted =
                [...appointments].sort(
                    (a, b) => {
                        const dateA =
                            new Date(
                                a?.appointmentDate ||
                                a?.date ||
                                a?.scheduledDate ||
                                a?.createdAt ||
                                0
                            ).getTime();

                        const dateB =
                            new Date(
                                b?.appointmentDate ||
                                b?.date ||
                                b?.scheduledDate ||
                                b?.createdAt ||
                                0
                            ).getTime();

                        return (
                            dateB - dateA
                        );
                    }
                );

            return sorted.slice(
                0,
                5
            );
        }, [appointments]);
    function formatDate(
        dateValue
    ) {
        if (!dateValue) {
            return "-";
        }

        const date =
            new Date(
                dateValue
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    }
    function getPatientName(
        appointment
    ) {
        if (
            appointment?.patient &&
            typeof appointment.patient ===
            "object"
        ) {
            return (
                appointment.patient.fullName ||
                appointment.patient.name ||
                "-"
            );
        }

        return (
            appointment?.patientName ||
            appointment?.patientFullName ||
            appointment?.patient ||
            "-"
        );
    }
    function getDoctorName(
        appointment
    ) {
        if (
            appointment?.doctor &&
            typeof appointment.doctor ===
            "object"
        ) {
            const name =
                appointment.doctor.fullName ||
                appointment.doctor.name ||
                "-";

            if (
                String(name)
                    .toLowerCase()
                    .startsWith("dr.")
            ) {
                return name;
            }

            return `Dr. ${name}`;
        }

        const name =
            appointment?.doctorName ||
            appointment?.doctorFullName ||
            appointment?.doctor ||
            "-";

        if (
            String(name)
                .toLowerCase()
                .startsWith("dr.")
        ) {
            return name;
        }

        return `Dr. ${name}`;
    }
    function getDepartment(
        appointment
    ) {
        return (
            appointment?.department ||
            appointment?.doctor
                ?.department ||
            "-"
        );
    }

    function getAppointmentDate(
        appointment
    ) {
        return (
            appointment?.appointmentDate ||
            appointment?.date ||
            appointment?.scheduledDate ||
            appointment?.createdAt
        );
    }

    function getAppointmentTime(
        appointment
    ) {
        return (
            appointment?.appointmentTime ||
            appointment?.time ||
            appointment?.scheduledTime ||
            "-"
        );
    }
    function getAppointmentStatus(
        appointment
    ) {
        return (
            appointment?.status ||
            "Pending"
        );
    }

    function getStatusClass(
        status
    ) {
        return String(
            status || ""
        )
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );
    }
    function formatCurrency(
        amount
    ) {
        return `₹${Number(
            amount || 0
        ).toLocaleString(
            "en-IN"
        )}`;
    }
    function handleRefresh() {
        loadDashboardData();
    }

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-loading">
                    Loading dashboard...
                </div>
            </div>
        );
    }
    return (
        <div className="dashboard-page">

            {/* HEADER */}
            <div className="dashboard-header">

                <div>
                    <h1>
                        Hospital Overview
                    </h1>

                    <p>
                        Here is what's
                        happening in your
                        hospital today.
                    </p>
                </div>

                <button
                    type="button"
                    className="dashboard-refresh-button"
                    onClick={
                        handleRefresh
                    }
                >
                    ↻ Refresh
                </button>

            </div>

            {/* ERROR */}
            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            {/* SUMMARY CARDS */}
            <div className="dashboard-summary-grid">

                {/* PATIENTS */}
                <div className="dashboard-summary-card">
                    <span>
                        Total Patients
                    </span>

                    <strong>
                        {patients.length}
                    </strong>

                    <p>
                        Registered
                        patients
                    </p>
                </div>

                {/* DOCTORS */}
                <div className="dashboard-summary-card">
                    <span>
                        Total Doctors
                    </span>

                    <strong>
                        {doctors.length}
                    </strong>

                    <p>
                        Registered
                        doctors
                    </p>
                </div>

                {/* DEPARTMENTS */}
                <div className="dashboard-summary-card">
                    <span>
                        Total Departments
                    </span>

                    <strong>
                        {totalDepartments}
                    </strong>

                    <p>
                        Hospital
                        departments
                    </p>
                </div>

                {/* APPOINTMENTS */}
                <div className="dashboard-summary-card">
                    <span>
                        Total Appointments
                    </span>

                    <strong>
                        {appointments.length}
                    </strong>

                    <p>
                        All scheduled
                        appointments
                    </p>
                </div>

                {/* PAID REVENUE */}
                <div className="dashboard-summary-card">
                    <span>
                        Paid Revenue
                    </span>

                    <strong>
                        {formatCurrency(
                            totalPaidRevenue
                        )}
                    </strong>

                    <p>
                        Total collected
                        from paid bills
                    </p>
                </div>

            </div>

            {/* TODAY'S REVENUE */}
            <div className="dashboard-revenue-row">

                <div className="dashboard-summary-card dashboard-today-revenue-card">

                    <span>
                        Today's Revenue
                    </span>

                    <strong>
                        {formatCurrency(
                            todaysPaidRevenue
                        )}
                    </strong>

                    <p>
                        Paid bills issued
                        today
                    </p>

                </div>

                <div className="dashboard-summary-card">

                    <span>
                        Today's Appointments
                    </span>

                    <strong>
                        {
                            todaysAppointments.length
                        }
                    </strong>

                    <p>
                        Appointments scheduled
                        today
                    </p>

                </div>

            </div>

            {/* RECENT APPOINTMENTS */}
            <div className="dashboard-section">

                <div className="dashboard-section-header">

                    <div>
                        <h2>
                            Recent Appointments
                        </h2>

                        <p>
                            Latest appointment
                            records from the
                            database.
                        </p>
                    </div>

                </div>

                {recentAppointments.length ===
                    0 ? (
                    <div className="dashboard-empty">
                        No appointments
                        available.
                    </div>
                ) : (
                    <div className="dashboard-table-wrapper">

                        <table className="dashboard-table">

                            <thead>
                                <tr>

                                    <th>
                                        Patient
                                    </th>

                                    <th>
                                        Doctor
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Time
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {recentAppointments.map(
                                    (
                                        appointment
                                    ) => (
                                        <tr
                                            key={
                                                appointment._id
                                            }
                                        >

                                            <td>
                                                {
                                                    getPatientName(
                                                        appointment
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    getDoctorName(
                                                        appointment
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    getDepartment(
                                                        appointment
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    formatDate(
                                                        getAppointmentDate(
                                                            appointment
                                                        )
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    getAppointmentTime(
                                                        appointment
                                                    )
                                                }
                                            </td>

                                            <td>

                                                <span
                                                    className={`status-badge status-${getStatusClass(
                                                        getAppointmentStatus(
                                                            appointment
                                                        )
                                                    )}`}
                                                >
                                                    {
                                                        getAppointmentStatus(
                                                            appointment
                                                        )
                                                    }
                                                </span>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}

export default Dashboard;