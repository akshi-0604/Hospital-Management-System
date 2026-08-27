import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "./Dashboard.css";

const API_BASE_URL =
    "https://hospital-management-system-nvjt.onrender.com/api";

function Dashboard() {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            setLoading(true);
            setError("");

            const results = await Promise.allSettled([
                axios.get(`${API_BASE_URL}/patients`),
                axios.get(`${API_BASE_URL}/doctors`),
                axios.get(`${API_BASE_URL}/appointments`),
            ]);

            if (results[0].status === "fulfilled") {
                const patientResponse =
                    results[0].value.data;

                if (Array.isArray(patientResponse)) {
                    setPatients(patientResponse);
                } else if (
                    Array.isArray(
                        patientResponse?.patients
                    )
                ) {
                    setPatients(
                        patientResponse.patients
                    );
                } else if (
                    Array.isArray(
                        patientResponse?.data
                    )
                ) {
                    setPatients(
                        patientResponse.data
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
            if (results[1].status === "fulfilled") {
                const doctorResponse =
                    results[1].value.data;

                if (Array.isArray(doctorResponse)) {
                    setDoctors(doctorResponse);
                } else if (
                    Array.isArray(
                        doctorResponse?.doctors
                    )
                ) {
                    setDoctors(
                        doctorResponse.doctors
                    );
                } else if (
                    Array.isArray(
                        doctorResponse?.data
                    )
                ) {
                    setDoctors(
                        doctorResponse.data
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
            if (results[2].status === "fulfilled") {
                const appointmentResponse =
                    results[2].value.data;

                if (
                    Array.isArray(
                        appointmentResponse
                    )
                ) {
                    setAppointments(
                        appointmentResponse
                    );
                } else if (
                    Array.isArray(
                        appointmentResponse?.appointments
                    )
                ) {
                    setAppointments(
                        appointmentResponse.appointments
                    );
                } else if (
                    Array.isArray(
                        appointmentResponse?.data
                    )
                ) {
                    setAppointments(
                        appointmentResponse.data
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
            const allFailed = results.every(
                (result) =>
                    result.status === "rejected"
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

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return false;
        }

        const today = new Date();

        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() ===
                today.getFullYear()
        );
    }

    const totalDepartments = useMemo(() => {
        const departmentNames = doctors
            .map((doctor) =>
                String(
                    doctor.department || ""
                )
                    .trim()
                    .toLowerCase()
            )
            .filter(Boolean);

        return new Set(departmentNames).size;
    }, [doctors]);

    const todaysAppointments = useMemo(() => {
        return appointments.filter((appointment) => {
            return (
                isToday(
                    appointment.appointmentDate
                ) ||
                isToday(appointment.date) ||
                isToday(
                    appointment.scheduledDate
                ) ||
                isToday(
                    appointment.createdAt
                )
            );
        });
    }, [appointments]);
    const todaysRevenue = useMemo(() => {
        return todaysAppointments.reduce(
            (total, appointment) => {
                const amount =
                    appointment.amount ??
                    appointment.fee ??
                    appointment.consultationFee ??
                    appointment.paymentAmount ??
                    0;

                const numericAmount =
                    Number(amount);

                if (
                    Number.isNaN(
                        numericAmount
                    )
                ) {
                    return total;
                }

                return total + numericAmount;
            },
            0
        );
    }, [todaysAppointments]);

    const recentAppointments = useMemo(() => {
        const sorted = [...appointments].sort(
            (a, b) => {
                const dateA = new Date(
                    a.appointmentDate ||
                        a.date ||
                        a.scheduledDate ||
                        a.createdAt ||
                        0
                ).getTime();

                const dateB = new Date(
                    b.appointmentDate ||
                        b.date ||
                        b.scheduledDate ||
                        b.createdAt ||
                        0
                ).getTime();

                return dateB - dateA;
            }
        );

        return sorted.slice(0, 5);
    }, [appointments]);

    function formatDate(dateValue) {
        if (!dateValue) {
            return "-";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
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

    function formatTime(timeValue, dateValue) {
        if (timeValue) {
            return timeValue;
        }

        if (!dateValue) {
            return "-";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    }
    function getPatientName(appointment) {
        if (
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
            appointment.patientName ||
            appointment.patientFullName ||
            appointment.patient ||
            "-"
        );
    }

    function getDoctorName(appointment) {
        if (
            typeof appointment.doctor ===
            "object"
        ) {
            return (
                appointment.doctor.fullName ||
                appointment.doctor.name ||
                "-"
            );
        }

        return (
            appointment.doctorName ||
            appointment.doctorFullName ||
            appointment.doctor ||
            "-"
        );
    }
    function getAppointmentDate(appointment) {
        return (
            appointment.appointmentDate ||
            appointment.date ||
            appointment.scheduledDate ||
            appointment.createdAt
        );
    }

    function getAppointmentTime(appointment) {
        return (
            appointment.appointmentTime ||
            appointment.time ||
            appointment.scheduledTime ||
            formatTime(
                null,
                getAppointmentDate(
                    appointment
                )
            )
        );
    }

    function getAppointmentStatus(appointment) {
        return (
            appointment.status ||
            "Pending"
        );
    }

    function getStatusClass(status) {
        return String(status)
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    function formatCurrency(amount) {
        return `₹${Number(amount || 0).toLocaleString(
            "en-IN"
        )}`;
    }

    function handleRefresh() {
        loadDashboardData();
    }
    return (
        <div className="dashboard-page">

            <div className="dashboard-header">

                <div>
                    <h2>
                        Hospital Overview
                    </h2>

                    <p>
                        Here is what's happening
                        in your hospital today.
                    </p>
                </div>

                <button
                    type="button"
                    className="dashboard-refresh-button"
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    {loading
                        ? "Refreshing..."
                        : "Refresh"}
                </button>

            </div>

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}
            <div className="dashboard-cards">

                <div className="dashboard-card">

                    <div className="dashboard-card-top">

                        <span>
                            Total Patients
                        </span>

                        <div className="dashboard-card-icon">
                            P
                        </div>

                    </div>

                    <strong>
                        {loading
                            ? "..."
                            : patients.length.toLocaleString(
                                  "en-IN"
                              )}
                    </strong>

                    <p>
                        Registered patients
                    </p>

                </div>

                <div className="dashboard-card">

                    <div className="dashboard-card-top">

                        <span>
                            Total Doctors
                        </span>

                        <div className="dashboard-card-icon">
                            D
                        </div>

                    </div>

                    <strong>
                        {loading
                            ? "..."
                            : doctors.length.toLocaleString(
                                  "en-IN"
                              )}
                    </strong>

                    <p>
                        Registered doctors
                    </p>

                </div>
                <div className="dashboard-card">

                    <div className="dashboard-card-top">

                        <span>
                            Departments
                        </span>

                        <div className="dashboard-card-icon">
                            +
                        </div>

                    </div>

                    <strong>
                        {loading
                            ? "..."
                            : totalDepartments}
                    </strong>

                    <p>
                        Active departments
                    </p>

                </div>

                <div className="dashboard-card">

                    <div className="dashboard-card-top">

                        <span>
                            Today's Appointments
                        </span>

                        <div className="dashboard-card-icon">
                            A
                        </div>

                    </div>

                    <strong>
                        {loading
                            ? "..."
                            : todaysAppointments.length}
                    </strong>

                    <p>
                        Scheduled for today
                    </p>

                </div>

                <div className="dashboard-card">

                    <div className="dashboard-card-top">

                        <span>
                            Today's Revenue
                        </span>

                        <div className="dashboard-card-icon">
                            ₹
                        </div>

                    </div>

                    <strong>
                        {loading
                            ? "..."
                            : formatCurrency(
                                  todaysRevenue
                              )}
                    </strong>

                    <p>
                        Based on today's appointments
                    </p>

                </div>

            </div>

            <div className="dashboard-section">

                <div className="dashboard-section-header">

                    <div>
                        <h3>
                            Recent Appointments
                        </h3>

                        <p>
                            Latest appointment
                            records from the system.
                        </p>
                    </div>

                    <span className="appointment-count">
                        {appointments.length} total
                    </span>

                </div>


                <div className="appointment-table">

                    <div className="table-header">

                        <span>
                            Patient
                        </span>

                        <span>
                            Doctor
                        </span>

                        <span>
                            Date
                        </span>

                        <span>
                            Time
                        </span>

                        <span>
                            Status
                        </span>

                    </div>

                    {loading && (
                        <div className="dashboard-table-message">
                            Loading appointments...
                        </div>
                    )}

                    {!loading &&
                        recentAppointments.length ===
                            0 && (
                            <div className="dashboard-table-message">
                                No appointment records
                                found.
                            </div>
                        )}
                    {!loading &&
                        recentAppointments.length >
                            0 &&
                        recentAppointments.map(
                            (appointment) => {

                                const status =
                                    getAppointmentStatus(
                                        appointment
                                    );

                                const appointmentDate =
                                    getAppointmentDate(
                                        appointment
                                    );

                                return (
                                    <div
                                        className="table-row"
                                        key={
                                            appointment._id ||
                                            appointment.id
                                        }
                                    >

                                        <span className="patient-cell">
                                            {getPatientName(
                                                appointment
                                            )}
                                        </span>

                                        <span>
                                            {getDoctorName(
                                                appointment
                                            )}
                                        </span>

                                        <span>
                                            {formatDate(
                                                appointmentDate
                                            )}
                                        </span>

                                        <span>
                                            {getAppointmentTime(
                                                appointment
                                            )}
                                        </span>

                                        <span>
                                            <span
                                                className={`status ${getStatusClass(
                                                    status
                                                )}`}
                                            >
                                                {status}
                                            </span>
                                        </span>

                                    </div>
                                );
                            }
                        )}

                </div>

            </div>

            <div className="dashboard-bottom-grid">

                <div className="dashboard-summary-card">

                    <h3>
                        Hospital Summary
                    </h3>

                    <div className="summary-item">
                        <span>
                            Registered Patients
                        </span>

                        <strong>
                            {patients.length}
                        </strong>
                    </div>

                    <div className="summary-item">
                        <span>
                            Registered Doctors
                        </span>

                        <strong>
                            {doctors.length}
                        </strong>
                    </div>

                    <div className="summary-item">
                        <span>
                            Departments
                        </span>

                        <strong>
                            {totalDepartments}
                        </strong>
                    </div>

                    <div className="summary-item">
                        <span>
                            Total Appointments
                        </span>

                        <strong>
                            {appointments.length}
                        </strong>
                    </div>

                </div>


                <div className="dashboard-summary-card">

                    <h3>
                        Today's Activity
                    </h3>

                    <div className="summary-item">
                        <span>
                            Today's Appointments
                        </span>

                        <strong>
                            {
                                todaysAppointments.length
                            }
                        </strong>
                    </div>

                    <div className="summary-item">
                        <span>
                            Today's Revenue
                        </span>

                        <strong>
                            {formatCurrency(
                                todaysRevenue
                            )}
                        </strong>
                    </div>

                    <div className="summary-item">
                        <span>
                            Available Doctors
                        </span>

                        <strong>
                            {
                                doctors.filter(
                                    (doctor) =>
                                        String(
                                            doctor.status ||
                                                ""
                                        )
                                            .toLowerCase() ===
                                        "available"
                                ).length
                            }
                        </strong>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;