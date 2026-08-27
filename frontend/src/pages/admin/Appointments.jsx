import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "./Appointments.css";

const API_URL =
    "https://hospital-management-system-nvjt.onrender.com/api/appointments";

function Appointments() {
    const [appointments, setAppointments] = useState([]);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [date, setDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        fetchAppointments();
    }, []);

    async function fetchAppointments() {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(API_URL);

            console.log("Appointments API response:", response.data);

            if (Array.isArray(response.data)) {
                setAppointments(response.data);
            } else if (Array.isArray(response.data.appointments)) {
                setAppointments(response.data.appointments);
            } else if (Array.isArray(response.data.data)) {
                setAppointments(response.data.data);
            } else {
                setAppointments([]);

                console.error(
                    "Appointments data is not an array:",
                    response.data
                );
            }
        } catch (error) {
            console.error(
                "Error while getting appointments:",
                error
            );

            setAppointments([]);

            setError(
                error.response?.data?.message ||
                "Unable to load appointment records."
            );
        } finally {
            setLoading(false);
        }
    }
    function formatDate(value) {
        if (!value) {
            return "N/A";
        }

        const formattedDate = new Date(value);

        if (Number.isNaN(formattedDate.getTime())) {
            return value;
        }

        return formattedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    function formatDateForInput(value) {
        if (!value) {
            return "";
        }

        const formattedDate = new Date(value);

        if (Number.isNaN(formattedDate.getTime())) {
            return "";
        }

        const year = formattedDate.getFullYear();

        const month = String(
            formattedDate.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            formattedDate.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function getPatientName(appointment) {
        return (
            appointment.patient?.fullName ||
            appointment.patient?.name ||
            appointment.patientName ||
            appointment.patient?.username ||
            "Unknown Patient"
        );
    }

    function getDoctorName(appointment) {
        const doctorName =
            appointment.doctor?.fullName ||
            appointment.doctor?.name ||
            appointment.doctorName;

        if (!doctorName) {
            return "Unknown Doctor";
        }

        return doctorName.startsWith("Dr.")
            ? doctorName
            : `Dr. ${doctorName}`;
    }

    function getDepartment(appointment) {
        return (
            appointment.department ||
            appointment.doctor?.department ||
            "Not assigned"
        );
    }

    function getAppointmentDate(appointment) {
        return (
            appointment.date ||
            appointment.appointmentDate ||
            appointment.scheduledDate ||
            ""
        );
    }

    function getAppointmentTime(appointment) {
        return (
            appointment.time ||
            appointment.appointmentTime ||
            appointment.scheduledTime ||
            "Not specified"
        );
    }

    function getAppointmentStatus(appointment) {
        return (
            appointment.status ||
            appointment.appointmentStatus ||
            "Pending"
        );
    }
    const filteredAppointments = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return appointments.filter((appointment) => {
            const patientName =
                getPatientName(appointment).toLowerCase();

            const doctorName =
                getDoctorName(appointment).toLowerCase();

            const department =
                getDepartment(appointment).toLowerCase();

            const appointmentStatus =
                getAppointmentStatus(appointment).toLowerCase();

            const matchesSearch =
                !searchText ||
                patientName.includes(searchText) ||
                doctorName.includes(searchText) ||
                department.includes(searchText) ||
                appointmentStatus.includes(searchText);

            const matchesStatus =
                status === "all" ||
                appointmentStatus === status.toLowerCase();

            const appointmentDate =
                getAppointmentDate(appointment);

            const matchesDate =
                !date ||
                formatDateForInput(appointmentDate) === date;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesDate
            );
        });
    }, [appointments, search, status, date]);

    function clearFilters() {
        setSearch("");
        setStatus("all");
        setDate("");
    }

    function handleView(appointment) {
        console.log("View appointment:", appointment);

        alert(
            `Appointment Details\n\nPatient: ${getPatientName(
                appointment
            )}\nDoctor: ${getDoctorName(
                appointment
            )}\nDepartment: ${getDepartment(
                appointment
            )}\nDate: ${formatDate(
                getAppointmentDate(appointment)
            )}\nTime: ${getAppointmentTime(
                appointment
            )}\nStatus: ${getAppointmentStatus(
                appointment
            )}`
        );
    }

    if (loading) {
        return (
            <div className="appointments-page">
                <div className="appointments-header">
                    <div>
                        <h2>Appointments</h2>

                        <p>
                            Schedule and manage patient
                            appointments.
                        </p>
                    </div>
                </div>

                <div className="appointments-message-card">
                    <div className="appointments-loader"></div>

                    <p>
                        Loading appointment records...
                    </p>
                </div>
            </div>
        );
    }


    return (
        <div className="appointments-page">

            <div className="appointments-header">

                <div>
                    <h2>Appointments</h2>

                    <p>
                        Schedule and manage patient
                        appointments.
                    </p>
                </div>

                <div className="appointment-count">
                    Total Appointments:{" "}
                    <strong>{appointments.length}</strong>
                </div>

            </div>

            <div className="appointment-filters">

                <div className="appointment-search">
                    <input
                        type="text"
                        placeholder="Search by patient, doctor, department..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                </div>


                <select
                    value={status}
                    onChange={(event) =>
                        setStatus(event.target.value)
                    }
                >
                    <option value="all">
                        All Status
                    </option>

                    <option value="confirmed">
                        Confirmed
                    </option>

                    <option value="pending">
                        Pending
                    </option>

                    <option value="completed">
                        Completed
                    </option>

                    <option value="cancelled">
                        Cancelled
                    </option>
                </select>


                <input
                    type="date"
                    value={date}
                    onChange={(event) =>
                        setDate(event.target.value)
                    }
                />


                <button
                    type="button"
                    className="clear-filter-button"
                    onClick={clearFilters}
                >
                    Clear
                </button>

            </div>

            <div className="appointment-result-bar">

                <span>
                    Showing{" "}
                    <strong>
                        {filteredAppointments.length}
                    </strong>{" "}
                    of{" "}
                    <strong>
                        {appointments.length}
                    </strong>{" "}
                    appointments
                </span>

                <button
                    type="button"
                    className="refresh-button"
                    onClick={fetchAppointments}
                >
                    ↻ Refresh
                </button>

            </div>

            {error && (
                <div className="appointments-error">
                    <strong>Unable to load appointments.</strong>

                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={fetchAppointments}
                    >
                        Try Again
                    </button>
                </div>
            )}


            {!error &&
                filteredAppointments.length === 0 && (
                    <div className="appointments-message-card">

                        <div className="empty-icon">
                            📅
                        </div>

                        <h3>
                            No appointments found
                        </h3>

                        <p>
                            There are no appointments
                            matching the current filters.
                        </p>

                    </div>
                )}

            {!error &&
                filteredAppointments.length > 0 && (
                    <div className="appointments-table-card">

                        <div className="appointments-table">

                            <div className="appointment-table-header">

                                <span>Patient</span>

                                <span>Doctor</span>

                                <span>Department</span>

                                <span>Date</span>

                                <span>Time</span>

                                <span>Status</span>

                                <span>Action</span>

                            </div>

                            {filteredAppointments.map(
                                (appointment) => {

                                    const appointmentStatus =
                                        getAppointmentStatus(
                                            appointment
                                        );

                                    return (
                                        <div
                                            className="appointment-table-row"
                                            key={
                                                appointment._id ||
                                                appointment.id
                                            }
                                        >

                                            <div className="patient-cell">

                                                <div className="patient-avatar">
                                                    {getPatientName(
                                                        appointment
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <strong>
                                                    {getPatientName(
                                                        appointment
                                                    )}
                                                </strong>

                                            </div>


                                            <span>
                                                {getDoctorName(
                                                    appointment
                                                )}
                                            </span>


                                            <span>
                                                {getDepartment(
                                                    appointment
                                                )}
                                            </span>


                                            <span>
                                                {formatDate(
                                                    getAppointmentDate(
                                                        appointment
                                                    )
                                                )}
                                            </span>


                                            <span>
                                                {getAppointmentTime(
                                                    appointment
                                                )}
                                            </span>


                                            <span
                                                className={`appointment-status ${appointmentStatus
                                                    .toLowerCase()
                                                    .replace(
                                                        /\s+/g,
                                                        "-"
                                                    )}`}
                                            >
                                                {appointmentStatus}
                                            </span>


                                            <button
                                                type="button"
                                                className="appointment-view-button"
                                                onClick={() =>
                                                    handleView(
                                                        appointment
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>
                )}

        </div>
    );
}

export default Appointments;
