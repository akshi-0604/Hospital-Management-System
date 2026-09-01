import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "./Appointments.css";

const API_BASE_URL =
    "https://hospital-management-system-nvjt.onrender.com/api";

const APPOINTMENTS_URL =
    `${API_BASE_URL}/appointments`;

const PATIENTS_URL =
    `${API_BASE_URL}/patients`;

const DOCTORS_URL =
    `${API_BASE_URL}/doctors`;

function Appointments() {
    const [appointments, setAppointments] =
        useState([]);

    const [patients, setPatients] =
        useState([]);

    const [doctors, setDoctors] =
        useState([]);
    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("all");

    const [date, setDate] =
        useState("");
    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");
    const [showAddModal, setShowAddModal] =
        useState(false);

    const [savingAppointment, setSavingAppointment] =
        useState(false);
    const [selectedAppointment, setSelectedAppointment] =
        useState(null);

    const [showViewModal, setShowViewModal] =
        useState(false);
    const [editingAppointment, setEditingAppointment] =
        useState(null);

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [updatingAppointment, setUpdatingAppointment] =
        useState(false);
    const [formError, setFormError] =
        useState("");

    const [formMessage, setFormMessage] =
        useState("");
    const emptyAppointmentForm = {
        patient: "",
        doctor: "",
        department: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
        notes: "",
        status: "Pending",
    };

    const [appointmentForm, setAppointmentForm] =
        useState(
            emptyAppointmentForm
        );
    useEffect(() => {
        loadPageData();
    }, []);
    async function loadPageData() {
        await Promise.all([
            fetchAppointments(),
            fetchPatients(),
            fetchDoctors(),
        ]);
    }
    async function fetchAppointments() {
        try {
            setLoading(true);
            setError("");

            const response =
                await axios.get(
                    APPOINTMENTS_URL
                );

            console.log(
                "Appointments API response:",
                response.data
            );

            let appointmentData = [];

            if (
                Array.isArray(response.data)
            ) {
                appointmentData =
                    response.data;
            } else if (
                Array.isArray(
                    response.data?.appointments
                )
            ) {
                appointmentData =
                    response.data.appointments;
            } else if (
                Array.isArray(
                    response.data?.data
                )
            ) {
                appointmentData =
                    response.data.data;
            }

            setAppointments(
                appointmentData
            );
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
    async function fetchPatients() {
        try {
            const response =
                await axios.get(
                    PATIENTS_URL
                );

            console.log(
                "Patients API response:",
                response.data
            );

            let patientData = [];

            if (
                Array.isArray(response.data)
            ) {
                patientData =
                    response.data;
            } else if (
                Array.isArray(
                    response.data?.patients
                )
            ) {
                patientData =
                    response.data.patients;
            } else if (
                Array.isArray(
                    response.data?.data
                )
            ) {
                patientData =
                    response.data.data;
            }

            setPatients(
                patientData
            );
        } catch (error) {
            console.error(
                "Error while getting patients:",
                error
            );

            setPatients([]);
        }
    }
    async function fetchDoctors() {
        try {
            const response =
                await axios.get(
                    DOCTORS_URL
                );

            console.log(
                "Doctors API response:",
                response.data
            );

            let doctorData = [];

            if (
                Array.isArray(response.data)
            ) {
                doctorData =
                    response.data;
            } else if (
                Array.isArray(
                    response.data?.doctors
                )
            ) {
                doctorData =
                    response.data.doctors;
            } else if (
                Array.isArray(
                    response.data?.data
                )
            ) {
                doctorData =
                    response.data.data;
            }

            setDoctors(
                doctorData
            );
        } catch (error) {
            console.error(
                "Error while getting doctors:",
                error
            );

            setDoctors([]);
        }
      }
    function formatDate(value) {
        if (!value) {
            return "N/A";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "N/A";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }


    function formatDateForInput(value) {
        if (!value) {
            return "";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
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
                "Patient unavailable"
            );
        }

        return (
            appointment?.patientName ||
            "Patient unavailable"
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
                "";

            if (!name) {
                return "Doctor unavailable";
            }

            return name
                .toLowerCase()
                .startsWith("dr.")
                ? name
                : `Dr. ${name}`;
        }

        const name =
            appointment?.doctorName ||
            appointment?.doctorFullName ||
            "";

        if (!name) {
            return "Doctor unavailable";
        }

        return name
            .toLowerCase()
            .startsWith("dr.")
            ? name
            : `Dr. ${name}`;
    }
    function getDepartment(
        appointment
    ) {
        return (
            appointment?.department ||
            appointment?.doctor?.department ||
            "Department unavailable"
        );
    }
    function getAppointmentDate(
        appointment
    ) {
        return (
            appointment?.appointmentDate ||
            appointment?.date ||
            appointment?.scheduledDate ||
            ""
        );
    }
    function getAppointmentTime(
        appointment
    ) {
        return (
            appointment?.appointmentTime ||
            appointment?.time ||
            appointment?.scheduledTime ||
            ""
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
        value
    ) {
        return String(value)
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );
    }
    const filteredAppointments =
        useMemo(() => {
            const searchText =
                search
                    .trim()
                    .toLowerCase();

            return appointments.filter(
                (appointment) => {
                    const patientName =
                        getPatientName(
                            appointment
                        ).toLowerCase();

                    const doctorName =
                        getDoctorName(
                            appointment
                        ).toLowerCase();

                    const department =
                        getDepartment(
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
                        );

                    const matchesStatus =
                        status ===
                            "all" ||
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
    function clearFilters() {
        setSearch("");
        setStatus("all");
        setDate("");
    }
    function openAddModal() {
        setAppointmentForm({
            ...emptyAppointmentForm,
        });

        setFormError("");
        setFormMessage("");

        setShowAddModal(true);
    }


    function closeAddModal() {
        if (savingAppointment) {
            return;
        }

        setShowAddModal(false);

        setAppointmentForm({
            ...emptyAppointmentForm,
        });

        setFormError("");
        setFormMessage("");
    }


    function handleAppointmentChange(
        event
    ) {
        const {
            name,
            value,
        } = event.target;

        setAppointmentForm(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );

        if (
            name === "doctor"
        ) {
            const selectedDoctor =
                doctors.find(
                    (doctor) =>
                        String(
                            doctor._id
                        ) ===
                        String(value)
                );

            setAppointmentForm(
                (previous) => ({
                    ...previous,
                    doctor: value,
                    department:
                        selectedDoctor?.department ||
                        "",
                })
            );
        }
    }


    async function handleCreateAppointment(
        event
    ) {
        event.preventDefault();

        setFormError("");
        setFormMessage("");

        if (
            !appointmentForm.patient ||
            !appointmentForm.doctor ||
            !appointmentForm.department ||
            !appointmentForm.appointmentDate ||
            !appointmentForm.appointmentTime
        ) {
            setFormError(
                "Please fill in all required appointment details."
            );

            return;
        }

        try {
            setSavingAppointment(true);

            const response =
                await axios.post(
                    APPOINTMENTS_URL,
                    appointmentForm
                );

            console.log(
                "Appointment created:",
                response.data
            );

            setFormMessage(
                "Appointment created successfully."
            );

            await fetchAppointments();

            setTimeout(() => {
                setShowAddModal(false);

                setAppointmentForm({
                    ...emptyAppointmentForm,
                });

                setFormMessage("");
            }, 800);
        } catch (error) {
            console.error(
                "Create appointment error:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                    "Unable to create appointment."
            );
        } finally {
            setSavingAppointment(false);
        }
    }
    function handleView(
        appointment
    ) {
        setSelectedAppointment(
            appointment
        );

        setShowViewModal(true);
    }


    function closeViewModal() {
        setSelectedAppointment(null);
        setShowViewModal(false);
    }
    function openEditModal(
        appointment
    ) {
        setFormError("");
        setFormMessage("");

        setEditingAppointment({
            ...appointment,

            patient:
                typeof appointment.patient ===
                    "object"
                    ? appointment.patient?._id ||
                      ""
                    : appointment.patient ||
                      "",

            doctor:
                typeof appointment.doctor ===
                    "object"
                    ? appointment.doctor?._id ||
                      ""
                    : appointment.doctor ||
                      "",

            department:
                appointment.department ||
                appointment.doctor?.department ||
                "",

            appointmentDate:
                formatDateForInput(
                    getAppointmentDate(
                        appointment
                    )
                ),

            appointmentTime:
                getAppointmentTime(
                    appointment
                ),

            reason:
                appointment.reason ||
                "",

            notes:
                appointment.notes ||
                "",

            status:
                appointment.status ||
                "Pending",
        });

        setShowEditModal(true);
    }
    function closeEditModal() {
        if (updatingAppointment) {
            return;
        }

        setEditingAppointment(null);
        setShowEditModal(false);

        setFormError("");
        setFormMessage("");
    }
    function handleEditChange(
        event
    ) {
        const {
            name,
            value,
        } = event.target;

        setEditingAppointment(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );

        if (
            name === "doctor"
        ) {
            const selectedDoctor =
                doctors.find(
                    (doctor) =>
                        String(
                            doctor._id
                        ) ===
                        String(value)
                );

            setEditingAppointment(
                (previous) => ({
                    ...previous,
                    doctor: value,
                    department:
                        selectedDoctor?.department ||
                        "",
                })
            );
        }
    }
    async function handleUpdateAppointment(
        event
    ) {
        event.preventDefault();

        setFormError("");
        setFormMessage("");

        if (
            !editingAppointment?._id
        ) {
            setFormError(
                "Appointment ID is missing."
            );

            return;
        }

        if (
            !editingAppointment.patient ||
            !editingAppointment.doctor ||
            !editingAppointment.department ||
            !editingAppointment.appointmentDate ||
            !editingAppointment.appointmentTime
        ) {
            setFormError(
                "Please fill in all required appointment details."
            );

            return;
        }

        try {
            setUpdatingAppointment(true);

            const updateData = {
                patient:
                    editingAppointment.patient,

                doctor:
                    editingAppointment.doctor,

                department:
                    editingAppointment.department,

                appointmentDate:
                    editingAppointment.appointmentDate,

                appointmentTime:
                    editingAppointment.appointmentTime,

                reason:
                    editingAppointment.reason ||
                    "",

                notes:
                    editingAppointment.notes ||
                    "",

                status:
                    editingAppointment.status ||
                    "Pending",
            };

            const response =
                await axios.put(
                    `${APPOINTMENTS_URL}/${editingAppointment._id}`,
                    updateData
                );

            console.log(
                "Appointment updated:",
                response.data
            );

            setFormMessage(
                "Appointment updated successfully."
            );

            await fetchAppointments();

            setTimeout(() => {
                setShowEditModal(false);

                setEditingAppointment(null);

                setFormMessage("");
            }, 800);
        } catch (error) {
            console.error(
                "Update appointment error:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                    "Unable to update appointment."
            );
        } finally {
            setUpdatingAppointment(false);
        }
    }
    async function handleRefresh() {
        setError("");

        await loadPageData();
    }
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
                    type="button"
                    className="add-appointment-button"
                    onClick={
                        openAddModal
                    }
                >
                    + Add Appointment
                </button>

            </div>
            {error && (
                <div className="appointments-error">
                    {error}
                </div>
            )}
            <div className="appointments-filter-card">

                <div className="appointment-search-wrapper">

                    <input
                        type="text"
                        placeholder="Search by patient, doctor, department..."
                        value={search}
                        onChange={(
                            event
                        ) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={status}
                    onChange={(
                        event
                    ) =>
                        setStatus(
                            event.target.value
                        )
                    }
                >

                    <option value="all">
                        All Status
                    </option>

                    <option value="pending">
                        Pending
                    </option>

                    <option value="confirmed">
                        Confirmed
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
                    onChange={(
                        event
                    ) =>
                        setDate(
                            event.target.value
                        )
                    }
                />


                <button
                    type="button"
                    className="clear-button"
                    onClick={
                        clearFilters
                    }
                >
                    Clear
                </button>

            </div>
            <div className="appointments-list-header">

                <div>

                    Showing{" "}

                    <strong>
                        {filteredAppointments.length}
                    </strong>

                    {" "}of{" "}

                    <strong>
                        {appointments.length}
                    </strong>

                    {" "}appointments

                </div>


                <button
                    type="button"
                    className="refresh-button"
                    onClick={
                        handleRefresh
                    }
                >
                    ↻ Refresh
                </button>

            </div>

            {loading ? (

                <div className="appointments-message-card">

                    <div className="appointments-loader"></div>

                    <p>
                        Loading appointment records...
                    </p>

                </div>

            ) : filteredAppointments.length ===
              0 ? (

                <div className="appointments-empty-card">

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

                    <button
                        type="button"
                        className="empty-add-button"
                        onClick={
                            openAddModal
                        }
                    >
                        + Add Appointment
                    </button>

                </div>

            ) : (

                <div className="appointments-table-card">

                    <div className="appointments-table">

                        {/* TABLE HEADER */}

                        <div className="appointments-table-header">

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
                                    className="appointments-table-row"
                                    key={
                                        appointment._id
                                    }
                                >

                                    <span>
                                        {
                                            getPatientName(
                                                appointment
                                            )
                                        }
                                    </span>


                                    <span>
                                        {
                                            getDoctorName(
                                                appointment
                                            )
                                        }
                                    </span>


                                    <span>
                                        {
                                            getDepartment(
                                                appointment
                                            )
                                        }
                                    </span>


                                    <span>
                                        {formatDate(
                                            getAppointmentDate(
                                                appointment
                                            )
                                        )}
                                    </span>


                                    <span>
                                        {
                                            getAppointmentTime(
                                                appointment
                                            ) || "-"
                                        }
                                    </span>


                                    <span>

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

                                    </span>


                                    <span>

                                        <div className="appointment-action-buttons">

                                            <button
                                                type="button"
                                                className="view-button"
                                                onClick={() =>
                                                    handleView(
                                                        appointment
                                                    )
                                                }
                                            >
                                                View
                                            </button>


                                            <button
                                                type="button"
                                                className="edit-button"
                                                onClick={() =>
                                                    openEditModal(
                                                        appointment
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                        </div>

                                    </span>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}
            {showAddModal && (

                <div
                    className="modal-overlay"
                    onMouseDown={(
                        event
                    ) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeAddModal();
                        }

                    }}
                >

                    <div className="appointment-modal">

                        <div className="modal-header">

                            <div>

                                <h3>
                                    Add Appointment
                                </h3>

                                <p>
                                    Create a new patient
                                    appointment.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={
                                    closeAddModal
                                }
                                disabled={
                                    savingAppointment
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleCreateAppointment
                            }
                        >

                            <div className="modal-body">

                                {formError && (
                                    <div className="form-error">
                                        {formError}
                                    </div>
                                )}


                                {formMessage && (
                                    <div className="form-success">
                                        {formMessage}
                                    </div>
                                )}


                                <div className="form-grid">

                                    <div className="form-group">

                                        <label>
                                            Patient *
                                        </label>

                                        <select
                                            name="patient"
                                            value={
                                                appointmentForm.patient
                                            }
                                            onChange={
                                                handleAppointmentChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select patient
                                            </option>

                                            {patients.map(
                                                (
                                                    patient
                                                ) => (

                                                    <option
                                                        key={
                                                            patient._id
                                                        }
                                                        value={
                                                            patient._id
                                                        }
                                                    >
                                                        {
                                                            patient.fullName ||
                                                            patient.name ||
                                                            patient.email
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Doctor *
                                        </label>

                                        <select
                                            name="doctor"
                                            value={
                                                appointmentForm.doctor
                                            }
                                            onChange={
                                                handleAppointmentChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select doctor
                                            </option>

                                            {doctors.map(
                                                (
                                                    doctor
                                                ) => (

                                                    <option
                                                        key={
                                                            doctor._id
                                                        }
                                                        value={
                                                            doctor._id
                                                        }
                                                    >
                                                        {getDoctorName(
                                                            {
                                                                doctor,
                                                            }
                                                        )}
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Department *
                                        </label>

                                        <input
                                            type="text"
                                            name="department"
                                            value={
                                                appointmentForm.department
                                            }
                                            onChange={
                                                handleAppointmentChange
                                            }
                                            readOnly
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Appointment Date *
                                        </label>

                                        <input
                                            type="date"
                                            name="appointmentDate"
                                            value={
                                                appointmentForm.appointmentDate
                                            }
                                            onChange={
                                                handleAppointmentChange
                                            }
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split(
                                                        "T"
                                                    )[0]
                                            }
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Appointment Time *
                                        </label>

                                        <input
                                            type="time"
                                            name="appointmentTime"
                                            value={
                                                appointmentForm.appointmentTime
                                            }
                                            onChange={
                                                handleAppointmentChange
                                            }
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Status
                                        </label>

                                        <select
                                            name="status"
                                            value={
                                                appointmentForm.status
                                            }
                                            onChange={
                                                handleAppointmentChange
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


                                    <div className="form-group full-width">

                                        <label>
                                            Reason
                                        </label>

                                        <input
                                            type="text"
                                            name="reason"
                                            value={
                                                appointmentForm.reason
                                            }
                                            onChange={
                                                handleAppointmentChange
                                            }
                                            placeholder="Reason for visit"
                                        />

                                    </div>


                                    <div className="form-group full-width">

                                        <label>
                                            Notes
                                        </label>

                                        <textarea
                                            name="notes"
                                            value={
                                                appointmentForm.notes
                                            }
                                            onChange={
                                                handleAppointmentChange
                                            }
                                            rows="4"
                                            placeholder="Additional notes..."
                                        />

                                    </div>

                                </div>

                            </div>


                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={
                                        closeAddModal
                                    }
                                    disabled={
                                        savingAppointment
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="save-appointment-button"
                                    disabled={
                                        savingAppointment
                                    }
                                >
                                    {savingAppointment
                                        ? "Saving..."
                                        : "Save Appointment"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}
            {showViewModal &&
                selectedAppointment && (

                    <div
                        className="modal-overlay"
                        onMouseDown={(
                            event
                        ) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeViewModal();
                            }

                        }}
                    >

                        <div className="appointment-modal view-modal">

                            <div className="modal-header">

                                <div>

                                    <h3>
                                        Appointment Details
                                    </h3>

                                    <p>
                                        Complete appointment
                                        information.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="modal-close-button"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="modal-body">

                                <div className="appointment-details">

                                    <div>
                                        <label>
                                            Patient
                                        </label>

                                        <strong>
                                            {
                                                getPatientName(
                                                    selectedAppointment
                                                )
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <label>
                                            Doctor
                                        </label>

                                        <strong>
                                            {
                                                getDoctorName(
                                                    selectedAppointment
                                                )
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <label>
                                            Department
                                        </label>

                                        <strong>
                                            {
                                                getDepartment(
                                                    selectedAppointment
                                                )
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <label>
                                            Date
                                        </label>

                                        <strong>
                                            {formatDate(
                                                getAppointmentDate(
                                                    selectedAppointment
                                                )
                                            )}
                                        </strong>
                                    </div>


                                    <div>
                                        <label>
                                            Time
                                        </label>

                                        <strong>
                                            {
                                                getAppointmentTime(
                                                    selectedAppointment
                                                ) ||
                                                "-"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <label>
                                            Status
                                        </label>

                                        <span
                                            className={`status-badge status-${getStatusClass(
                                                getAppointmentStatus(
                                                    selectedAppointment
                                                )
                                            )}`}
                                        >
                                            {
                                                getAppointmentStatus(
                                                    selectedAppointment
                                                )
                                            }
                                        </span>
                                    </div>


                                    <div className="details-full">
                                        <label>
                                            Reason
                                        </label>

                                        <p>
                                            {
                                                selectedAppointment.reason ||
                                                "No reason provided."
                                            }
                                        </p>
                                    </div>


                                    <div className="details-full">
                                        <label>
                                            Notes
                                        </label>

                                        <p>
                                            {
                                                selectedAppointment.notes ||
                                                "No additional notes."
                                            }
                                        </p>
                                    </div>

                                </div>

                            </div>


                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    Close
                                </button>


                                <button
                                    type="button"
                                    className="save-appointment-button"
                                    onClick={() => {

                                        closeViewModal();

                                        openEditModal(
                                            selectedAppointment
                                        );

                                    }}
                                >
                                    Edit Appointment
                                </button>

                            </div>

                        </div>

                    </div>

                )}
            {showEditModal &&
                editingAppointment && (

                    <div
                        className="modal-overlay"
                        onMouseDown={(
                            event
                        ) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeEditModal();
                            }

                        }}
                    >

                        <div className="appointment-modal">

                            {/* FIXED HEADER */}

                            <div className="modal-header">

                                <div>

                                    <h3>
                                        Edit Appointment
                                    </h3>

                                    <p>
                                        Update appointment
                                        schedule and details.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="modal-close-button"
                                    onClick={
                                        closeEditModal
                                    }
                                    disabled={
                                        updatingAppointment
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            {/* SCROLLABLE BODY */}

                            <form
                                onSubmit={
                                    handleUpdateAppointment
                                }
                            >

                                <div className="modal-body">

                                    {formError && (
                                        <div className="form-error">
                                            {formError}
                                        </div>
                                    )}


                                    {formMessage && (
                                        <div className="form-success">
                                            {formMessage}
                                        </div>
                                    )}


                                    <div className="form-grid">

                                        {/* PATIENT */}

                                        <div className="form-group">

                                            <label>
                                                Patient *
                                            </label>

                                            <select
                                                name="patient"
                                                value={
                                                    editingAppointment.patient ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select patient
                                                </option>

                                                {patients.map(
                                                    (
                                                        patient
                                                    ) => (

                                                        <option
                                                            key={
                                                                patient._id
                                                            }
                                                            value={
                                                                patient._id
                                                            }
                                                        >
                                                            {
                                                                patient.fullName ||
                                                                patient.name ||
                                                                patient.email
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        {/* DOCTOR */}

                                        <div className="form-group">

                                            <label>
                                                Doctor *
                                            </label>

                                            <select
                                                name="doctor"
                                                value={
                                                    editingAppointment.doctor ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select doctor
                                                </option>

                                                {doctors.map(
                                                    (
                                                        doctor
                                                    ) => (

                                                        <option
                                                            key={
                                                                doctor._id
                                                            }
                                                            value={
                                                                doctor._id
                                                            }
                                                        >
                                                            {
                                                                getDoctorName(
                                                                    {
                                                                        doctor,
                                                                    }
                                                                )
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        {/* DEPARTMENT */}

                                        <div className="form-group">

                                            <label>
                                                Department *
                                            </label>

                                            <input
                                                type="text"
                                                name="department"
                                                value={
                                                    editingAppointment.department ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                readOnly
                                                required
                                            />

                                        </div>


                                        {/* DATE */}

                                        <div className="form-group">

                                            <label>
                                                Appointment Date *
                                            </label>

                                            <input
                                                type="date"
                                                name="appointmentDate"
                                                value={
                                                    editingAppointment.appointmentDate ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                            />

                                        </div>


                                        {/* TIME */}

                                        <div className="form-group">

                                            <label>
                                                Appointment Time *
                                            </label>

                                            <input
                                                type="time"
                                                name="appointmentTime"
                                                value={
                                                    editingAppointment.appointmentTime ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
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
                                                    editingAppointment.status ||
                                                    "Pending"
                                                }
                                                onChange={
                                                    handleEditChange
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


                                        {/* REASON */}

                                        <div className="form-group full-width">

                                            <label>
                                                Reason
                                            </label>

                                            <input
                                                type="text"
                                                name="reason"
                                                value={
                                                    editingAppointment.reason ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                placeholder="Reason for appointment"
                                            />

                                        </div>


                                        {/* NOTES */}

                                        <div className="form-group full-width">

                                            <label>
                                                Notes
                                            </label>

                                            <textarea
                                                name="notes"
                                                value={
                                                    editingAppointment.notes ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                rows="5"
                                                placeholder="Additional notes..."
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* FIXED FOOTER */}

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={
                                            closeEditModal
                                        }
                                        disabled={
                                            updatingAppointment
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="save-appointment-button"
                                        disabled={
                                            updatingAppointment
                                        }
                                    >
                                        {updatingAppointment
                                            ? "Saving Changes..."
                                            : "Save Changes"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

        </div>
    );
}

export default Appointments;