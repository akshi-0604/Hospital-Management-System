import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "./Appointments.css";

const API_BASE_URL =
    "https://hospital-management-system-nvjt.onrender.com/api";

const APPOINTMENTS_API_URL =
    `${API_BASE_URL}/appointments`;

const PATIENTS_API_URL =
    `${API_BASE_URL}/patients`;

const DOCTORS_API_URL =
    `${API_BASE_URL}/doctors`;


function getPatientName(patient) {
    return (
        patient?.fullName ||
        patient?.name ||
        patient?.username ||
        "Unknown Patient"
    );
}


function getDoctorName(doctor) {
    const name =
        doctor?.fullName ||
        doctor?.name ||
        doctor?.username ||
        doctor?.user?.fullName ||
        "Unknown Doctor";

    if (name === "Unknown Doctor") {
        return name;
    }

    return name.startsWith("Dr.")
        ? name
        : `Dr. ${name}`;
}


function getDoctorId(doctor) {
    return (
        doctor?.user?._id ||
        doctor?.userId ||
        doctor?._id ||
        ""
    );
}


function getPatientId(patient) {
    return patient?._id || "";
}


function getDepartmentFromDoctor(doctor) {
    return (
        doctor?.department ||
        doctor?.specialization ||
        doctor?.user?.department ||
        ""
    );
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


function getPatientNameFromAppointment(appointment) {
    return (
        appointment.patient?.fullName ||
        appointment.patient?.name ||
        appointment.patientName ||
        appointment.patient?.username ||
        "Unknown Patient"
    );
}


function getDoctorNameFromAppointment(appointment) {
    const doctorName =
        appointment.doctor?.fullName ||
        appointment.doctor?.name ||
        appointment.doctorName ||
        appointment.doctor?.user?.fullName;

    if (!doctorName) {
        return "Unknown Doctor";
    }

    return doctorName.startsWith("Dr.")
        ? doctorName
        : `Dr. ${doctorName}`;
}


function getDepartmentFromAppointment(appointment) {
    return (
        appointment.department ||
        appointment.doctor?.department ||
        appointment.doctor?.specialization ||
        "Not assigned"
    );
}


function getAppointmentDate(appointment) {
    return (
        appointment.appointmentDate ||
        appointment.date ||
        appointment.scheduledDate ||
        ""
    );
}


function getAppointmentTime(appointment) {
    return (
        appointment.appointmentTime ||
        appointment.time ||
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


function Appointments() {

    // --------------------------------------------------
    // APPOINTMENT DATA
    // --------------------------------------------------

    const [appointments, setAppointments] = useState([]);

    // --------------------------------------------------
    // PATIENT AND DOCTOR DATA
    // --------------------------------------------------

    const [patients, setPatients] = useState([]);

    const [doctors, setDoctors] = useState([]);


    // --------------------------------------------------
    // SEARCH / FILTER STATE
    // --------------------------------------------------

    const [search, setSearch] = useState("");

    const [status, setStatus] = useState("all");

    const [date, setDate] = useState("");


    // --------------------------------------------------
    // LOADING AND ERROR STATE
    // --------------------------------------------------

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [formLoading, setFormLoading] = useState(false);

    const [formError, setFormError] = useState("");


    // --------------------------------------------------
    // MODAL STATE
    // --------------------------------------------------

    const [showAddModal, setShowAddModal] = useState(false);

    const [selectedAppointment, setSelectedAppointment] =
        useState(null);

    const [showViewModal, setShowViewModal] =
        useState(false);


    // --------------------------------------------------
    // FORM STATE
    // --------------------------------------------------

    const [formData, setFormData] = useState({
        patient: "",
        doctor: "",
        department: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
        status: "Pending",
        notes: "",
    });


    // --------------------------------------------------
    // LOAD DATA WHEN PAGE OPENS
    // --------------------------------------------------

    useEffect(() => {
        fetchAppointments();
        fetchPatients();
        fetchDoctors();
    }, []);


    // --------------------------------------------------
    // GET APPOINTMENTS
    // --------------------------------------------------

    async function fetchAppointments() {

        try {

            setLoading(true);

            setError("");

            const response =
                await axios.get(APPOINTMENTS_API_URL);

            console.log(
                "Appointments API response:",
                response.data
            );


            if (Array.isArray(response.data)) {

                setAppointments(response.data);

            } else if (
                Array.isArray(
                    response.data.appointments
                )
            ) {

                setAppointments(
                    response.data.appointments
                );

            } else if (
                Array.isArray(response.data.data)
            ) {

                setAppointments(
                    response.data.data
                );

            } else {

                setAppointments([]);

                setError(
                    "Appointment data format is invalid."
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


    // --------------------------------------------------
    // GET PATIENTS
    // --------------------------------------------------

    async function fetchPatients() {

        try {

            const response =
                await axios.get(PATIENTS_API_URL);

            console.log(
                "Patients API response:",
                response.data
            );


            let patientData = [];

            if (Array.isArray(response.data)) {

                patientData = response.data;

            } else if (
                Array.isArray(response.data.patients)
            ) {

                patientData =
                    response.data.patients;

            } else if (
                Array.isArray(response.data.data)
            ) {

                patientData =
                    response.data.data;
            }


            // Only show users whose role is patient.
            const onlyPatients =
                patientData.filter(
                    (patient) =>
                        !patient.role ||
                        patient.role.toLowerCase() ===
                            "patient"
                );


            setPatients(onlyPatients);

        } catch (error) {

            console.error(
                "Error while getting patients:",
                error
            );

        }
    }


    // --------------------------------------------------
    // GET DOCTORS
    // --------------------------------------------------

    async function fetchDoctors() {

        try {

            const response =
                await axios.get(DOCTORS_API_URL);

            console.log(
                "Doctors API response:",
                response.data
            );


            let doctorData = [];

            if (Array.isArray(response.data)) {

                doctorData = response.data;

            } else if (
                Array.isArray(response.data.doctors)
            ) {

                doctorData =
                    response.data.doctors;

            } else if (
                Array.isArray(response.data.data)
            ) {

                doctorData =
                    response.data.data;
            }


            setDoctors(doctorData);

        } catch (error) {

            console.error(
                "Error while getting doctors:",
                error
            );

        }
    }


    // --------------------------------------------------
    // FORM INPUT CHANGE
    // --------------------------------------------------

    function handleFormChange(event) {

        const {
            name,
            value,
        } = event.target;


        setFormData(
            (previousData) => ({
                ...previousData,
                [name]: value,
            })
        );


        // When doctor changes,
        // automatically get the department.
        if (name === "doctor") {

            const selectedDoctor =
                doctors.find(
                    (doctor) =>
                        getDoctorId(doctor) === value
                );


            if (selectedDoctor) {

                setFormData(
                    (previousData) => ({
                        ...previousData,
                        doctor: value,
                        department:
                            getDepartmentFromDoctor(
                                selectedDoctor
                            ),
                    })
                );
            }
        }
    }


    // --------------------------------------------------
    // OPEN ADD APPOINTMENT MODAL
    // --------------------------------------------------

    function openAddModal() {

        setFormError("");

        setFormData({
            patient: "",
            doctor: "",
            department: "",
            appointmentDate: "",
            appointmentTime: "",
            reason: "",
            status: "Pending",
            notes: "",
        });

        setShowAddModal(true);
    }


    // --------------------------------------------------
    // CLOSE ADD APPOINTMENT MODAL
    // --------------------------------------------------

    function closeAddModal() {

        if (formLoading) {
            return;
        }

        setShowAddModal(false);

        setFormError("");
    }


    // --------------------------------------------------
    // CREATE NEW APPOINTMENT
    // --------------------------------------------------

    async function handleCreateAppointment(event) {

        event.preventDefault();

        setFormError("");


        // Basic frontend validation

        if (!formData.patient) {

            setFormError(
                "Please select a patient."
            );

            return;
        }


        if (!formData.doctor) {

            setFormError(
                "Please select a doctor."
            );

            return;
        }


        if (!formData.department) {

            setFormError(
                "Please enter or select a department."
            );

            return;
        }


        if (!formData.appointmentDate) {

            setFormError(
                "Please select an appointment date."
            );

            return;
        }


        if (!formData.appointmentTime) {

            setFormError(
                "Please select an appointment time."
            );

            return;
        }


        try {

            setFormLoading(true);


            // Data sent to backend

            const appointmentData = {
                patient: formData.patient,
                doctor: formData.doctor,
                department: formData.department,
                appointmentDate:
                    formData.appointmentDate,
                appointmentTime:
                    formData.appointmentTime,
                reason: formData.reason,
                status: formData.status,
                notes: formData.notes,
            };


            console.log(
                "Creating appointment:",
                appointmentData
            );


            const response =
                await axios.post(
                    APPOINTMENTS_API_URL,
                    appointmentData
                );


            console.log(
                "Create appointment response:",
                response.data
            );


            // Close modal after successful creation

            setShowAddModal(false);


            // Clear form

            setFormData({
                patient: "",
                doctor: "",
                department: "",
                appointmentDate: "",
                appointmentTime: "",
                reason: "",
                status: "Pending",
                notes: "",
            });


            // Get latest appointments from database

            await fetchAppointments();


        } catch (error) {

            console.error(
                "Error while creating appointment:",
                error
            );


            setFormError(
                error.response?.data?.message ||
                "Unable to create appointment."
            );

        } finally {

            setFormLoading(false);

        }
    }


    // --------------------------------------------------
    // FILTER APPOINTMENTS
    // --------------------------------------------------

    const filteredAppointments = useMemo(() => {

        const searchText =
            search.trim().toLowerCase();


        return appointments.filter(
            (appointment) => {

                const patientName =
                    getPatientNameFromAppointment(
                        appointment
                    ).toLowerCase();


                const doctorName =
                    getDoctorNameFromAppointment(
                        appointment
                    ).toLowerCase();


                const department =
                    getDepartmentFromAppointment(
                        appointment
                    ).toLowerCase();


                const appointmentStatus =
                    getAppointmentStatus(
                        appointment
                    ).toLowerCase();


                const matchesSearch =
                    !searchText ||
                    patientName.includes(
                        searchText
                    ) ||
                    doctorName.includes(
                        searchText
                    ) ||
                    department.includes(
                        searchText
                    ) ||
                    appointmentStatus.includes(
                        searchText
                    );


                const matchesStatus =
                    status === "all" ||
                    appointmentStatus ===
                        status.toLowerCase();


                const appointmentDate =
                    getAppointmentDate(
                        appointment
                    );


                const matchesDate =
                    !date ||
                    formatDateForInput(
                        appointmentDate
                    ) === date;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesDate
                );
            }
        );

    }, [
        appointments,
        search,
        status,
        date,
    ]);


    // --------------------------------------------------
    // CLEAR FILTERS
    // --------------------------------------------------

    function clearFilters() {

        setSearch("");

        setStatus("all");

        setDate("");
    }


    // --------------------------------------------------
    // VIEW APPOINTMENT
    // --------------------------------------------------

    function handleView(appointment) {

        setSelectedAppointment(
            appointment
        );

        setShowViewModal(true);
    }


    // --------------------------------------------------
    // CLOSE VIEW MODAL
    // --------------------------------------------------

    function closeViewModal() {

        setSelectedAppointment(null);

        setShowViewModal(false);
    }


    // --------------------------------------------------
    // TOTAL APPOINTMENTS
    // --------------------------------------------------

    const totalAppointments =
        filteredAppointments.length;


    // --------------------------------------------------
    // LOADING SCREEN
    // --------------------------------------------------

    if (loading) {

        return (

            <div className="appointments-page">

                <div className="appointments-header">

                    <div>

                        <h2>
                            Appointments
                        </h2>

                        <p>
                            Schedule and manage
                            patient appointments.
                        </p>

                    </div>

                    <button
                        className="add-appointment-button"
                        onClick={openAddModal}
                    >
                        + New Appointment
                    </button>

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


    // --------------------------------------------------
    // MAIN RETURN
    // --------------------------------------------------

    return (

        <div className="appointments-page">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="appointments-header">

                <div>

                    <h2>
                        Appointments
                    </h2>

                    <p>
                        Schedule and manage
                        patient appointments.
                    </p>

                </div>


                <button
                    className="add-appointment-button"
                    onClick={openAddModal}
                >
                    + New Appointment
                </button>

            </div>


            {/* ==========================================
                SUMMARY
            ========================================== */}

            <div className="appointment-summary">

                <div className="appointment-summary-card">

                    <span>
                        Total Appointments
                    </span>

                    <strong>
                        {totalAppointments}
                    </strong>

                </div>

            </div>


            {/* ==========================================
                FILTERS
            ========================================== */}

            <div className="appointment-filters">

                <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                    placeholder="Search by patient, doctor, department..."
                />


                <select
                    value={status}
                    onChange={(event) =>
                        setStatus(
                            event.target.value
                        )
                    }
                >

                    <option value="all">
                        All Status
                    </option>

                    <option value="Pending">
                        Pending
                    </option>

                    <option value="Confirmed">
                        Confirmed
                    </option>

                    <option value="Completed">
                        Completed
                    </option>

                    <option value="Cancelled">
                        Cancelled
                    </option>

                </select>


                <input
                    type="date"
                    value={date}
                    onChange={(event) =>
                        setDate(
                            event.target.value
                        )
                    }
                />


                <button
                    className="clear-filter-button"
                    onClick={clearFilters}
                >
                    Clear
                </button>

            </div>


            {/* ==========================================
                RESULT INFORMATION
            ========================================== */}

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
                    className="refresh-button"
                    onClick={fetchAppointments}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (

                <div className="appointments-error">

                    {error}

                </div>
            )}


            {/* ==========================================
                APPOINTMENT TABLE
            ========================================== */}

            {filteredAppointments.length > 0 ? (

                <div className="appointments-table-card">

                    <div className="appointments-table">

                        {/* TABLE HEADER */}

                        <div className="appointment-table-header">

                            <span>
                                Patient
                            </span>

                            <span>
                                Doctor
                            </span>

                            <span>
                                Department
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

                            <span>
                                Action
                            </span>

                        </div>


                        {/* TABLE ROWS */}

                        {filteredAppointments.map(
                            (appointment) => (

                                <div
                                    className="appointment-table-row"
                                    key={
                                        appointment._id ||
                                        appointment.id
                                    }
                                >

                                    <strong>
                                        {
                                            getPatientNameFromAppointment(
                                                appointment
                                            )
                                        }
                                    </strong>


                                    <span>
                                        {
                                            getDoctorNameFromAppointment(
                                                appointment
                                            )
                                        }
                                    </span>


                                    <span>
                                        {
                                            getDepartmentFromAppointment(
                                                appointment
                                            )
                                        }
                                    </span>


                                    <span>
                                        {
                                            formatDate(
                                                getAppointmentDate(
                                                    appointment
                                                )
                                            )
                                        }
                                    </span>


                                    <span>
                                        {
                                            getAppointmentTime(
                                                appointment
                                            )
                                        }
                                    </span>


                                    <span
                                        className={
                                            `appointment-status ${
                                                getAppointmentStatus(
                                                    appointment
                                                ).toLowerCase()
                                            }`
                                        }
                                    >
                                        {
                                            getAppointmentStatus(
                                                appointment
                                            )
                                        }
                                    </span>


                                    <button
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
                            )
                        )}

                    </div>

                </div>

            ) : (

                /* ==========================================
                   EMPTY STATE
                ========================================== */

                <div className="appointments-empty-card">

                    <div className="appointments-empty-icon">
                        📅
                    </div>

                    <h3>
                        No appointments found
                    </h3>

                    <p>
                        There are no appointments
                        matching the current filters.
                    </p>


                    <button
                        className="empty-add-button"
                        onClick={openAddModal}
                    >
                        + Create First Appointment
                    </button>

                </div>
            )}


            {/* =================================================
                ADD APPOINTMENT MODAL
            ================================================= */}

            {showAddModal && (

                <div className="appointment-modal-overlay">

                    <div className="appointment-modal">

                        <div className="appointment-modal-header">

                            <div>

                                <h3>
                                    New Appointment
                                </h3>

                                <p>
                                    Create a new patient
                                    appointment.
                                </p>

                            </div>


                            <button
                                className="modal-close-button"
                                onClick={closeAddModal}
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleCreateAppointment
                            }
                        >

                            {/* PATIENT */}

                            <div className="form-group">

                                <label>
                                    Patient
                                </label>

                                <select
                                    name="patient"
                                    value={
                                        formData.patient
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Patient
                                    </option>


                                    {patients.map(
                                        (patient) => (

                                            <option
                                                key={
                                                    getPatientId(
                                                        patient
                                                    )
                                                }
                                                value={
                                                    getPatientId(
                                                        patient
                                                    )
                                                }
                                            >
                                                {
                                                    getPatientName(
                                                        patient
                                                    )
                                                }

                                                {patient.email
                                                    ? ` - ${patient.email}`
                                                    : ""}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* DOCTOR */}

                            <div className="form-group">

                                <label>
                                    Doctor
                                </label>

                                <select
                                    name="doctor"
                                    value={
                                        formData.doctor
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Doctor
                                    </option>


                                    {doctors.map(
                                        (doctor) => (

                                            <option
                                                key={
                                                    getDoctorId(
                                                        doctor
                                                    )
                                                }
                                                value={
                                                    getDoctorId(
                                                        doctor
                                                    )
                                                }
                                            >
                                                {
                                                    getDoctorName(
                                                        doctor
                                                    )
                                                }

                                                {getDepartmentFromDoctor(
                                                    doctor
                                                )
                                                    ? ` - ${getDepartmentFromDoctor(
                                                          doctor
                                                      )}`
                                                    : ""}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* DEPARTMENT */}

                            <div className="form-group">

                                <label>
                                    Department
                                </label>

                                <input
                                    type="text"
                                    name="department"
                                    value={
                                        formData.department
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="Department"
                                    required
                                />

                            </div>


                            {/* DATE + TIME */}

                            <div className="form-row">

                                <div className="form-group">

                                    <label>
                                        Appointment Date
                                    </label>

                                    <input
                                        type="date"
                                        name="appointmentDate"
                                        value={
                                            formData.appointmentDate
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Appointment Time
                                    </label>

                                    <input
                                        type="time"
                                        name="appointmentTime"
                                        value={
                                            formData.appointmentTime
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            {/* REASON */}

                            <div className="form-group">

                                <label>
                                    Reason
                                </label>

                                <input
                                    type="text"
                                    name="reason"
                                    value={
                                        formData.reason
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="Reason for appointment"
                                />

                            </div>


                            {/* STATUS */}

                            <div className="form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={
                                        formData.status
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                >

                                    <option value="Pending">
                                        Pending
                                    </option>

                                    <option value="Confirmed">
                                        Confirmed
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="Cancelled">
                                        Cancelled
                                    </option>

                                </select>

                            </div>


                            {/* NOTES */}

                            <div className="form-group">

                                <label>
                                    Notes
                                </label>

                                <textarea
                                    name="notes"
                                    value={
                                        formData.notes
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="Additional notes..."
                                    rows="3"
                                ></textarea>

                            </div>


                            {/* FORM ERROR */}

                            {formError && (

                                <div className="appointment-form-error">

                                    {formError}

                                </div>
                            )}


                            {/* MODAL BUTTONS */}

                            <div className="appointment-modal-actions">

                                <button
                                    type="button"
                                    className="modal-cancel-button"
                                    onClick={
                                        closeAddModal
                                    }
                                    disabled={
                                        formLoading
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="modal-submit-button"
                                    disabled={
                                        formLoading
                                    }
                                >

                                    {formLoading
                                        ? "Creating..."
                                        : "Create Appointment"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {/* =================================================
                VIEW APPOINTMENT MODAL
            ================================================= */}

            {showViewModal &&
                selectedAppointment && (

                    <div className="appointment-modal-overlay">

                        <div className="appointment-modal view-appointment-modal">

                            <div className="appointment-modal-header">

                                <div>

                                    <h3>
                                        Appointment Details
                                    </h3>

                                    <p>
                                        View appointment
                                        information.
                                    </p>

                                </div>


                                <button
                                    className="modal-close-button"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="appointment-details">

                                <div className="appointment-detail-item">

                                    <span>
                                        Patient
                                    </span>

                                    <strong>
                                        {
                                            getPatientNameFromAppointment(
                                                selectedAppointment
                                            )
                                        }
                                    </strong>

                                </div>


                                <div className="appointment-detail-item">

                                    <span>
                                        Doctor
                                    </span>

                                    <strong>
                                        {
                                            getDoctorNameFromAppointment(
                                                selectedAppointment
                                            )
                                        }
                                    </strong>

                                </div>


                                <div className="appointment-detail-item">

                                    <span>
                                        Department
                                    </span>

                                    <strong>
                                        {
                                            getDepartmentFromAppointment(
                                                selectedAppointment
                                            )
                                        }
                                    </strong>

                                </div>


                                <div className="appointment-detail-item">

                                    <span>
                                        Date
                                    </span>

                                    <strong>
                                        {
                                            formatDate(
                                                getAppointmentDate(
                                                    selectedAppointment
                                                )
                                            )
                                        }
                                    </strong>

                                </div>


                                <div className="appointment-detail-item">

                                    <span>
                                        Time
                                    </span>

                                    <strong>
                                        {
                                            getAppointmentTime(
                                                selectedAppointment
                                            )
                                        }
                                    </strong>

                                </div>


                                <div className="appointment-detail-item">

                                    <span>
                                        Status
                                    </span>

                                    <strong
                                        className={
                                            `appointment-status ${
                                                getAppointmentStatus(
                                                    selectedAppointment
                                                ).toLowerCase()
                                            }`
                                        }
                                    >
                                        {
                                            getAppointmentStatus(
                                                selectedAppointment
                                            )
                                        }
                                    </strong>

                                </div>


                                {selectedAppointment.reason && (

                                    <div className="appointment-detail-item full-width">

                                        <span>
                                            Reason
                                        </span>

                                        <strong>
                                            {
                                                selectedAppointment.reason
                                            }
                                        </strong>

                                    </div>

                                )}


                                {selectedAppointment.notes && (

                                    <div className="appointment-detail-item full-width">

                                        <span>
                                            Notes
                                        </span>

                                        <strong>
                                            {
                                                selectedAppointment.notes
                                            }
                                        </strong>

                                    </div>

                                )}

                            </div>


                            <div className="appointment-modal-actions">

                                <button
                                    type="button"
                                    className="modal-cancel-button"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
}

export default Appointments;