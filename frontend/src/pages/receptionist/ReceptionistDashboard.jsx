import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "./ReceptionistDashboard.css";

const API_BASE_URL =
    "https://hospital-management-system-nvjt.onrender.com/api";

const DOCTORS_URL = `${API_BASE_URL}/doctors`;
const PATIENTS_URL = `${API_BASE_URL}/patients`;
const APPOINTMENTS_URL = `${API_BASE_URL}/appointments`;

const EMPTY_APPOINTMENT = {
    patient: "",
    doctor: "",
    department: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    notes: "",
    status: "Pending",
};

function ReceptionistDashboard() {
    const [user, setUser] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [savingAppointment, setSavingAppointment] =
        useState(false);
    const [updatingAppointment, setUpdatingAppointment] =
        useState(false);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [formMessage, setFormMessage] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedAppointment, setSelectedAppointment] =
        useState(null);

    const [editingAppointment, setEditingAppointment] =
        useState(null);
    const [appointmentForm, setAppointmentForm] = useState({
        ...EMPTY_APPOINTMENT,
    });
    useEffect(() => {
        loadUser();
        loadDashboardData();
    }, []);
    function loadUser() {
        try {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                return;
            }

            const parsedUser = JSON.parse(storedUser);

            setUser(parsedUser);
        } catch (error) {
            console.error(
                "Unable to load receptionist user:",
                error
            );
        }
    }
    async function loadDashboardData() {
        setError("");

        try {
            setLoading(true);

            await Promise.all([
                fetchDoctors(),
                fetchPatients(),
                fetchAppointments(),
            ]);
        } catch (error) {
            console.error(
                "Receptionist dashboard loading error:",
                error
            );
        } finally {
            setLoading(false);
        }
    }
    async function fetchDoctors() {
        try {
            const response = await axios.get(DOCTORS_URL);

            console.log(
                "Receptionist doctors:",
                response.data
            );

            if (Array.isArray(response.data)) {
                setDoctors(response.data);
                return;
            }

            if (Array.isArray(response.data?.doctors)) {
                setDoctors(response.data.doctors);
                return;
            }

            if (Array.isArray(response.data?.data)) {
                setDoctors(response.data.data);
                return;
            }

            setDoctors([]);
        } catch (error) {
            console.error(
                "Unable to fetch doctors:",
                error
            );

            setDoctors([]);
            setError(
                error.response?.data?.message ||
                    "Unable to load doctor information."
            );
        }
    }

    async function fetchPatients() {
        try {
            const response = await axios.get(PATIENTS_URL);

            console.log(
                "Receptionist patients:",
                response.data
            );

            if (Array.isArray(response.data)) {
                setPatients(response.data);
                return;
            }

            if (Array.isArray(response.data?.patients)) {
                setPatients(response.data.patients);
                return;
            }

            if (Array.isArray(response.data?.data)) {
                setPatients(response.data.data);
                return;
            }

            setPatients([]);
        } catch (error) {
            console.error(
                "Unable to fetch patients:",
                error
            );

            setPatients([]);
        }
    }
    async function fetchAppointments() {
        try {
            const response =
                await axios.get(APPOINTMENTS_URL);

            console.log(
                "Receptionist appointments:",
                response.data
            );

            if (Array.isArray(response.data)) {
                setAppointments(response.data);
                return;
            }

            if (
                Array.isArray(
                    response.data?.appointments
                )
            ) {
                setAppointments(
                    response.data.appointments
                );
                return;
            }

            if (Array.isArray(response.data?.data)) {
                setAppointments(
                    response.data.data
                );
                return;
            }

            setAppointments([]);
        } catch (error) {
            console.error(
                "Unable to fetch appointments:",
                error
            );

            setAppointments([]);

            setError(
                error.response?.data?.message ||
                    "Unable to load appointment information."
            );
        }
    }
    async function handleRefresh() {
        try {
            setRefreshing(true);
            setError("");

            await Promise.all([
                fetchDoctors(),
                fetchPatients(),
                fetchAppointments(),
            ]);
        } catch (error) {
            console.error(
                "Refresh error:",
                error
            );
        } finally {
            setRefreshing(false);
        }
    }
    function getDoctorDisplayName(doctor) {
        if (!doctor) {
            return "Doctor unavailable";
        }

        const name =
            doctor.fullName ||
            doctor.name ||
            doctor.doctorName ||
            "";

        if (!name) {
            return "Doctor unavailable";
        }

        if (
            name
                .toLowerCase()
                .startsWith("dr.")
        ) {
            return name;
        }

        return `Dr. ${name}`;
    }

    function findDoctorById(doctorId) {
        return doctors.find(
            (doctor) =>
                String(doctor?._id) ===
                String(doctorId)
        );
    }
    function getPatientName(appointment) {
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

    function getAppointmentDoctorName(
        appointment
    ) {
        if (
            appointment?.doctor &&
            typeof appointment.doctor ===
                "object"
        ) {
            return getDoctorDisplayName(
                appointment.doctor
            );
        }

        const doctorName =
            appointment?.doctorName ||
            appointment?.doctorFullName ||
            "";

        if (!doctorName) {
            return "Doctor unavailable";
        }

        return doctorName
            .toLowerCase()
            .startsWith("dr.")
            ? doctorName
            : `Dr. ${doctorName}`;
    }

    function getAppointmentDepartment(
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

    function getStatusClass(status) {
        return String(status)
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );
    }
    function formatDate(value) {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

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

        const date = new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function isToday(value) {
        if (!value) {
            return false;
        }

        const date = new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return false;
        }

        const today = new Date();

        return (
            date.getFullYear() ===
                today.getFullYear() &&
            date.getMonth() ===
                today.getMonth() &&
            date.getDate() ===
                today.getDate()
        );
    }
    const availableDoctors =
        useMemo(() => {
            return doctors.filter(
                (doctor) =>
                    String(
                        doctor?.status ||
                            ""
                    )
                        .toLowerCase()
                        .trim() ===
                    "available"
            );
        }, [doctors]);
    const doctorsOnLeave =
        useMemo(() => {
            return doctors.filter(
                (doctor) =>
                    String(
                        doctor?.status ||
                            ""
                    )
                        .toLowerCase()
                        .trim() ===
                    "on leave"
            );
        }, [doctors]);
    const todaysAppointments =
        useMemo(() => {
            return appointments
                .filter(
                    (appointment) =>
                        isToday(
                            getAppointmentDate(
                                appointment
                            )
                        )
                )
                .sort((a, b) =>
                    String(
                        getAppointmentTime(a)
                    ).localeCompare(
                        String(
                            getAppointmentTime(b)
                        )
                    )
                );
        }, [appointments]);
    const pendingAppointments =
        useMemo(() => {
            return appointments.filter(
                (appointment) =>
                    getAppointmentStatus(
                        appointment
                    ).toLowerCase() ===
                    "pending"
            );
        }, [appointments]);
    const confirmedAppointments =
        useMemo(() => {
            return appointments.filter(
                (appointment) =>
                    getAppointmentStatus(
                        appointment
                    ).toLowerCase() ===
                    "confirmed"
            );
        }, [appointments]);
    const completedAppointments =
        useMemo(() => {
            return appointments.filter(
                (appointment) =>
                    getAppointmentStatus(
                        appointment
                    ).toLowerCase() ===
                    "completed"
            );
        }, [appointments]);
    function doctorHasAppointmentToday(
        doctorId
    ) {
        return todaysAppointments.some(
            (appointment) => {
                const appointmentDoctor =
                    appointment?.doctor;

                if (
                    appointmentDoctor &&
                    typeof appointmentDoctor ===
                        "object"
                ) {
                    return (
                        String(
                            appointmentDoctor._id
                        ) ===
                        String(doctorId)
                    );
                }

                return (
                    String(
                        appointmentDoctor ||
                            ""
                    ) ===
                        String(doctorId) ||
                    String(
                        appointment?.doctorId ||
                            ""
                    ) ===
                        String(doctorId)
                );
            }
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
                        getAppointmentDoctorName(
                            appointment
                        ).toLowerCase();

                    const department =
                        getAppointmentDepartment(
                            appointment
                        ).toLowerCase();

                    const currentStatus =
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
                        statusFilter === "all" ||
                        currentStatus ===
                            statusFilter;

                    const matchesDate =
                        !dateFilter ||
                        formatDateForInput(
                            getAppointmentDate(
                                appointment
                            )
                        ) ===
                            dateFilter;

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
            statusFilter,
            dateFilter,
        ]);
    function openAddAppointment() {
        setAppointmentForm({
            ...EMPTY_APPOINTMENT,
        });

        setFormError("");
        setFormMessage("");

        setShowAddModal(true);
    }

    function closeAddAppointment() {
        if (savingAppointment) {
            return;
        }

        setShowAddModal(false);

        setAppointmentForm({
            ...EMPTY_APPOINTMENT,
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

        if (name === "doctor") {
            const selectedDoctor =
                findDoctorById(value);

            setAppointmentForm(
                (previous) => ({
                    ...previous,
                    doctor: value,
                    department:
                        selectedDoctor?.department ||
                        "",
                })
            );

            return;
        }

        setAppointmentForm(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
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
                    ...EMPTY_APPOINTMENT,
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
    function openViewAppointment(
        appointment
    ) {
        setSelectedAppointment(
            appointment
        );

        setShowViewModal(true);
    }

    function closeViewAppointment() {
        setSelectedAppointment(null);
        setShowViewModal(false);
    }
    function openEditAppointment(
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
                getAppointmentStatus(
                    appointment
                ),
        });

        setShowEditModal(true);
    }

    function closeEditAppointment() {
        if (updatingAppointment) {
            return;
        }

        setEditingAppointment(null);
        setShowEditModal(false);

        setFormError("");
        setFormMessage("");
    }

    function handleEditChange(event) {
        const {
            name,
            value,
        } = event.target;

        if (name === "doctor") {
            const selectedDoctor =
                findDoctorById(value);

            setEditingAppointment(
                (previous) => ({
                    ...previous,
                    doctor: value,
                    department:
                        selectedDoctor?.department ||
                        "",
                })
            );

            return;
        }

        setEditingAppointment(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
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
            setUpdatingAppointment(
                true
            );

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
            setUpdatingAppointment(
                false
            );
        }
    }

    if (loading) {
        return (
            <div className="receptionist-dashboard-page">

                <div className="receptionist-loading">

                    <div className="receptionist-spinner"></div>

                    <p>
                        Loading receptionist dashboard...
                    </p>

                </div>

            </div>
        );
    }
    return (
        <div className="receptionist-dashboard-page">

            <div className="receptionist-header">

                <div>

                    <h2>
                        Welcome back,{" "}
                        {user?.fullName ||
                            "Receptionist"}
                    </h2>

                    <p>
                        Manage patients,
                        doctors and
                        appointments from
                        one place.
                    </p>

                </div>


                <div className="receptionist-header-actions">

                    <button
                        type="button"
                        className="receptionist-refresh-button"
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            refreshing
                        }
                    >
                        {refreshing
                            ? "Refreshing..."
                            : "↻ Refresh"}
                    </button>


                    <button
                        type="button"
                        className="receptionist-add-button"
                        onClick={
                            openAddAppointment
                        }
                    >
                        + Create Appointment
                    </button>

                </div>

            </div>

            {error && (
                <div className="receptionist-error">
                    {error}
                </div>
            )}
            <div className="receptionist-summary-grid">

                <div className="receptionist-summary-card">

                    <span>
                        Total Patients
                    </span>

                    <strong>
                        {patients.length}
                    </strong>

                    <p>
                        Registered patients
                    </p>

                </div>


                <div className="receptionist-summary-card">

                    <span>
                        Total Doctors
                    </span>

                    <strong>
                        {doctors.length}
                    </strong>

                    <p>
                        Registered doctors
                    </p>

                </div>


                <div className="receptionist-summary-card">

                    <span>
                        Available Doctors
                    </span>

                    <strong>
                        {
                            availableDoctors.length
                        }
                    </strong>

                    <p>
                        Currently available
                    </p>

                </div>


                <div className="receptionist-summary-card">

                    <span>
                        Today's Appointments
                    </span>

                    <strong>
                        {
                            todaysAppointments.length
                        }
                    </strong>

                    <p>
                        Scheduled today
                    </p>

                </div>


                <div className="receptionist-summary-card">

                    <span>
                        Waiting Confirmation
                    </span>

                    <strong>
                        {
                            pendingAppointments.length
                        }
                    </strong>

                    <p>
                        Pending appointments
                    </p>

                </div>


                <div className="receptionist-summary-card">

                    <span>
                        Completed
                    </span>

                    <strong>
                        {
                            completedAppointments.length
                        }
                    </strong>

                    <p>
                        Completed visits
                    </p>

                </div>

            </div>

            <div className="receptionist-section">

                <div className="receptionist-section-header">

                    <div>

                        <h3>
                            Doctor Availability
                        </h3>

                        <p>
                            Check doctor status
                            before scheduling
                            an appointment.
                        </p>

                    </div>

                </div>


                {doctors.length === 0 ? (

                    <div className="receptionist-empty-state">

                        <h4>
                            No doctors found
                        </h4>

                        <p>
                            Doctor records are
                            currently unavailable.
                        </p>

                    </div>

                ) : (

                    <div className="doctor-status-grid">

                        {doctors.map(
                            (doctor) => {

                                const status =
                                    String(
                                        doctor?.status ||
                                            ""
                                    )
                                        .toLowerCase()
                                        .trim();

                                const isAvailable =
                                    status ===
                                    "available";

                                const isOnLeave =
                                    status ===
                                    "on leave";

                                const bookedToday =
                                    doctorHasAppointmentToday(
                                        doctor._id
                                    );

                                return (

                                    <div
                                        className="receptionist-doctor-card"
                                        key={
                                            doctor._id
                                        }
                                    >

                                        <div className="receptionist-doctor-top">

                                            <div className="receptionist-doctor-avatar">

                                                {
                                                    doctor.fullName
                                                        ?.charAt(
                                                            0
                                                        )
                                                        .toUpperCase()
                                                }

                                            </div>


                                            <div>

                                                <h4>
                                                    {
                                                        getDoctorDisplayName(
                                                            doctor
                                                        )
                                                    }
                                                </h4>

                                                <p>
                                                    {
                                                        doctor.specialization ||
                                                        "Specialization unavailable"
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        <div className="receptionist-doctor-details">

                                            <span>
                                                {
                                                    doctor.department ||
                                                    "Department unavailable"
                                                }
                                            </span>

                                            <span>
                                                {
                                                    doctor.experience ??
                                                    0
                                                }{" "}
                                                years
                                            </span>

                                        </div>


                                        <div className="receptionist-doctor-status-row">

                                            <span
                                                className={`receptionist-doctor-status ${
                                                    isAvailable
                                                        ? "available"
                                                        : isOnLeave
                                                        ? "on-leave"
                                                        : "unavailable"
                                                }`}
                                            >

                                                <span className="status-dot"></span>

                                                {
                                                    doctor.status ||
                                                    "Unavailable"
                                                }

                                            </span>


                                            {isAvailable && (
                                                <span
                                                    className={`today-work-status ${
                                                        bookedToday
                                                            ? "busy"
                                                            : "free"
                                                    }`}
                                                >
                                                    {bookedToday
                                                        ? "Booked today"
                                                        : "Free today"}
                                                </span>
                                            )}

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

            </div>
            <div className="receptionist-two-column">

                {/* WAITING */}

                <div className="receptionist-section">

                    <div className="receptionist-section-header">

                        <div>

                            <h3>
                                Appointment Queue
                            </h3>

                            <p>
                                Patients waiting for
                                confirmation.
                            </p>

                        </div>

                        <span className="section-count">
                            {
                                pendingAppointments.length
                            }
                        </span>

                    </div>


                    {pendingAppointments.length ===
                    0 ? (

                        <div className="receptionist-empty-state">

                            <h4>
                                No pending appointments
                            </h4>

                            <p>
                                There are no patients
                                waiting for confirmation.
                            </p>

                        </div>

                    ) : (

                        <div className="waiting-list">

                            {pendingAppointments
                                .slice(0, 6)
                                .map(
                                    (appointment) => (

                                        <div
                                            className="waiting-item"
                                            key={
                                                appointment._id
                                            }
                                        >

                                            <div className="waiting-avatar">

                                                {getPatientName(
                                                    appointment
                                                )
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}

                                            </div>


                                            <div className="waiting-info">

                                                <strong>
                                                    {
                                                        getPatientName(
                                                            appointment
                                                        )
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        getAppointmentDoctorName(
                                                            appointment
                                                        )
                                                    }
                                                </span>

                                                <small>
                                                    {formatDate(
                                                        getAppointmentDate(
                                                            appointment
                                                        )
                                                    )}{" "}
                                                    •{" "}
                                                    {
                                                        getAppointmentTime(
                                                            appointment
                                                        )
                                                    }
                                                </small>

                                            </div>


                                            <button
                                                type="button"
                                                className="small-edit-button"
                                                onClick={() =>
                                                    openEditAppointment(
                                                        appointment
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                        </div>

                                    )
                                )}

                        </div>

                    )}

                </div>


                {/* DOCTORS ON LEAVE */}

                <div className="receptionist-section">

                    <div className="receptionist-section-header">

                        <div>

                            <h3>
                                Doctors on Leave
                            </h3>

                            <p>
                                Doctors unavailable
                                for new appointments.
                            </p>

                        </div>

                        <span className="section-count leave-count">
                            {
                                doctorsOnLeave.length
                            }
                        </span>

                    </div>


                    {doctorsOnLeave.length ===
                    0 ? (

                        <div className="receptionist-empty-state">

                            <h4>
                                No doctors on leave
                            </h4>

                            <p>
                                There are no doctors
                                currently marked on leave.
                            </p>

                        </div>

                    ) : (

                        <div className="leave-list">

                            {doctorsOnLeave.map(
                                (doctor) => (

                                    <div
                                        className="leave-item"
                                        key={
                                            doctor._id
                                        }
                                    >

                                        <div className="waiting-avatar leave-avatar">

                                            {
                                                doctor.fullName
                                                    ?.charAt(
                                                        0
                                                    )
                                                    .toUpperCase()
                                            }

                                        </div>


                                        <div className="waiting-info">

                                            <strong>
                                                {
                                                    getDoctorDisplayName(
                                                        doctor
                                                    )
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    doctor.specialization
                                                }
                                            </span>

                                            <small>
                                                {
                                                    doctor.department
                                                }
                                            </small>

                                        </div>


                                        <span className="leave-badge">
                                            On Leave
                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>

            </div>
            <div className="receptionist-section">

                <div className="receptionist-section-header">

                    <div>

                        <h3>
                            Today's Schedule
                        </h3>

                        <p>
                            Appointments scheduled
                            for today.
                        </p>

                    </div>

                </div>


                {todaysAppointments.length ===
                0 ? (

                    <div className="receptionist-empty-state">

                        <h4>
                            No appointments today
                        </h4>

                        <p>
                            There are no appointments
                            scheduled for today.
                        </p>

                    </div>

                ) : (

                    <div className="today-appointments-list">

                        {todaysAppointments
                            .slice(0, 10)
                            .map(
                                (
                                    appointment
                                ) => (

                                    <div
                                        className="today-appointment-item"
                                        key={
                                            appointment._id
                                        }
                                    >

                                        <div className="today-appointment-time">

                                            {
                                                getAppointmentTime(
                                                    appointment
                                                )
                                            }

                                        </div>


                                        <div className="today-appointment-info">

                                            <strong>
                                                {
                                                    getPatientName(
                                                        appointment
                                                    )
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    getAppointmentDoctorName(
                                                        appointment
                                                    )
                                                }
                                            </span>

                                            <small>
                                                {
                                                    getAppointmentDepartment(
                                                        appointment
                                                    )
                                                }
                                            </small>

                                        </div>


                                        <span
                                            className={`receptionist-status-badge ${getStatusClass(
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


                                        <div className="today-appointment-actions">

                                            <button
                                                type="button"
                                                className="receptionist-view-button"
                                                onClick={() =>
                                                    openViewAppointment(
                                                        appointment
                                                    )
                                                }
                                            >
                                                View
                                            </button>


                                            <button
                                                type="button"
                                                className="receptionist-edit-button"
                                                onClick={() =>
                                                    openEditAppointment(
                                                        appointment
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                    </div>

                )}

            </div>
            <div className="receptionist-section">

                <div className="receptionist-section-header">

                    <div>

                        <h3>
                            Appointment Management
                        </h3>

                        <p>
                            View and manage all
                            patient appointments.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="section-add-button"
                        onClick={
                            openAddAppointment
                        }
                    >
                        + Create Appointment
                    </button>

                </div>


                {/* FILTERS */}

                <div className="receptionist-filter-bar">

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search patient, doctor, department..."
                    />


                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
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
                        value={dateFilter}
                        onChange={(event) =>
                            setDateFilter(
                                event.target.value
                            )
                        }
                    />


                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setStatusFilter(
                                "all"
                            );
                            setDateFilter("");
                        }}
                    >
                        Clear
                    </button>

                </div>


                {/* APPOINTMENT TABLE */}

                {filteredAppointments.length ===
                0 ? (

                    <div className="receptionist-empty-state">

                        <h4>
                            No appointments found
                        </h4>

                        <p>
                            No appointments match
                            your current filters.
                        </p>

                    </div>

                ) : (

                    <div className="receptionist-table-wrapper">

                        <table className="receptionist-table">

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

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredAppointments.map(
                                    (
                                        appointment
                                    ) => (

                                        <tr
                                            key={
                                                appointment._id
                                            }
                                        >

                                            <td>

                                                <strong>
                                                    {
                                                        getPatientName(
                                                            appointment
                                                        )
                                                    }
                                                </strong>

                                            </td>


                                            <td>

                                                {
                                                    getAppointmentDoctorName(
                                                        appointment
                                                    )
                                                }

                                            </td>


                                            <td>

                                                {
                                                    getAppointmentDepartment(
                                                        appointment
                                                    )
                                                }

                                            </td>


                                            <td>

                                                {formatDate(
                                                    getAppointmentDate(
                                                        appointment
                                                    )
                                                )}

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
                                                    className={`receptionist-status-badge ${getStatusClass(
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


                                            <td>

                                                <div className="receptionist-action-buttons">

                                                    <button
                                                        type="button"
                                                        className="receptionist-view-button"
                                                        onClick={() =>
                                                            openViewAppointment(
                                                                appointment
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="receptionist-edit-button"
                                                        onClick={() =>
                                                            openEditAppointment(
                                                                appointment
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                ADD APPOINTMENT MODAL
            ================================================= */}

            {showAddModal && (

                <div
                    className="receptionist-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeAddAppointment();
                        }

                    }}
                >

                    <div className="receptionist-modal">

                        <div className="receptionist-modal-header">

                            <div>

                                <h3>
                                    Create Appointment
                                </h3>

                                <p>
                                    Schedule an
                                    appointment for a
                                    patient.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="receptionist-modal-close"
                                onClick={
                                    closeAddAppointment
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

                            <div className="receptionist-modal-body">

                                {formError && (
                                    <div className="receptionist-form-error">
                                        {formError}
                                    </div>
                                )}


                                {formMessage && (
                                    <div className="receptionist-form-success">
                                        {
                                            formMessage
                                        }
                                    </div>
                                )}


                                <div className="receptionist-form-grid">

                                    <div className="receptionist-form-group">

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
                                                            patient.fullName
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="receptionist-form-group">

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
                                                Select available doctor
                                            </option>

                                            {availableDoctors.map(
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
                                                            getDoctorDisplayName(
                                                                doctor
                                                            )
                                                        }{" "}
                                                        —{" "}
                                                        {
                                                            doctor.specialization
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="receptionist-form-group">

                                        <label>
                                            Department *
                                        </label>

                                        <input
                                            type="text"
                                            name="department"
                                            value={
                                                appointmentForm.department
                                            }
                                            readOnly
                                            required
                                            placeholder="Select doctor first"
                                        />

                                    </div>


                                    <div className="receptionist-form-group">

                                        <label>
                                            Appointment Date *
                                        </label>

                                        <input
                                            type="date"
                                            name="appointmentDate"
                                            value={
                                                appointmentForm.appointmentDate
                                            }
                                            min={formatDateForInput(
                                                new Date()
                                            )}
                                            onChange={
                                                handleAppointmentChange
                                            }
                                            required
                                        />

                                    </div>


                                    <div className="receptionist-form-group">

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


                                    <div className="receptionist-form-group">

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


                                    <div className="receptionist-form-group full-width">

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


                                    <div className="receptionist-form-group full-width">

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


                            <div className="receptionist-modal-footer">

                                <button
                                    type="button"
                                    className="receptionist-cancel-button"
                                    onClick={
                                        closeAddAppointment
                                    }
                                    disabled={
                                        savingAppointment
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="receptionist-save-button"
                                    disabled={
                                        savingAppointment
                                    }
                                >
                                    {savingAppointment
                                        ? "Creating..."
                                        : "Create Appointment"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}
            {showViewModal &&
                selectedAppointment && (

                    <div
                        className="receptionist-modal-overlay"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeViewAppointment();
                            }

                        }}
                    >

                        <div className="receptionist-modal">

                            <div className="receptionist-modal-header">

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
                                    className="receptionist-modal-close"
                                    onClick={
                                        closeViewAppointment
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="receptionist-modal-body">

                                <div className="receptionist-details-grid">

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
                                                getAppointmentDoctorName(
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
                                                getAppointmentDepartment(
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
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <label>
                                            Status
                                        </label>

                                        <span
                                            className={`receptionist-status-badge ${getStatusClass(
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


                                    <div className="full-width">

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


                                    <div className="full-width">

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


                            <div className="receptionist-modal-footer">

                                <button
                                    type="button"
                                    className="receptionist-cancel-button"
                                    onClick={
                                        closeViewAppointment
                                    }
                                >
                                    Close
                                </button>


                                <button
                                    type="button"
                                    className="receptionist-save-button"
                                    onClick={() => {

                                        closeViewAppointment();

                                        openEditAppointment(
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
                        className="receptionist-modal-overlay"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeEditAppointment();
                            }

                        }}
                    >

                        <div className="receptionist-modal">

                            <div className="receptionist-modal-header">

                                <div>

                                    <h3>
                                        Edit Appointment
                                    </h3>

                                    <p>
                                        Change the
                                        appointment schedule
                                        or status.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="receptionist-modal-close"
                                    onClick={
                                        closeEditAppointment
                                    }
                                    disabled={
                                        updatingAppointment
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <form
                                onSubmit={
                                    handleUpdateAppointment
                                }
                            >

                                <div className="receptionist-modal-body">

                                    {formError && (
                                        <div className="receptionist-form-error">
                                            {formError}
                                        </div>
                                    )}


                                    {formMessage && (
                                        <div className="receptionist-form-success">
                                            {
                                                formMessage
                                            }
                                        </div>
                                    )}


                                    <div className="receptionist-form-grid">

                                        <div className="receptionist-form-group">

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
                                                                patient.fullName
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        <div className="receptionist-form-group">

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
                                                                getDoctorDisplayName(
                                                                    doctor
                                                                )
                                                            }{" "}
                                                            —{" "}
                                                            {
                                                                doctor.status
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        <div className="receptionist-form-group">

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
                                                readOnly
                                                required
                                            />

                                        </div>


                                        <div className="receptionist-form-group">

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


                                        <div className="receptionist-form-group">

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


                                        <div className="receptionist-form-group">

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


                                        <div className="receptionist-form-group full-width">

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
                                                placeholder="Reason for visit"
                                            />

                                        </div>


                                        <div className="receptionist-form-group full-width">

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


                                <div className="receptionist-modal-footer">

                                    <button
                                        type="button"
                                        className="receptionist-cancel-button"
                                        onClick={
                                            closeEditAppointment
                                        }
                                        disabled={
                                            updatingAppointment
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="receptionist-save-button"
                                        disabled={
                                            updatingAppointment
                                        }
                                    >
                                        {updatingAppointment
                                            ? "Saving..."
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

export default ReceptionistDashboard;