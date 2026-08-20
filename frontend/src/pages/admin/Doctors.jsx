import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Doctors.css";

function Doctors() {
    const [doctors, setDoctors] = useState([]);

    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("all");
    const [specialization, setSpecialization] = useState("all");
    const [status, setStatus] = useState("all");
    const [joiningDate, setJoiningDate] = useState("");

    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Add Doctor Modal
    const [showAddDoctor, setShowAddDoctor] = useState(false);
    const [savingDoctor, setSavingDoctor] = useState(false);

    // View Doctor Modal
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    // Edit Doctor Modal
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [updatingDoctor, setUpdatingDoctor] = useState(false);

    // Delete Modal
    const [deletingDoctor, setDeletingDoctor] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Messages
    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");

    // --------------------------------------------------
    // ADD DOCTOR FORM
    // --------------------------------------------------

    const emptyDoctorForm = {
        fullName: "",
        doctorId: "",
        email: "",
        phone: "",
        password: "",
        specialization: "",
        department: "",
        experience: "",
        qualification: "",
        consultationFee: "",
        gender: "",
        dob: "",
        joiningDate: "",
        status: "Available",
    };

    const [doctorForm, setDoctorForm] = useState(emptyDoctorForm);

    // --------------------------------------------------
    // GET DOCTORS
    // --------------------------------------------------

    useEffect(() => {
        fetchDoctors();
    }, []);

    async function fetchDoctors() {
        try {
            setLoading(true);

            const response = await axios.get(
                "http://https://hospital-management-system-nvjt.onrender.com/api/doctors"
            );

            console.log("Doctors API response:", response.data);

            if (Array.isArray(response.data)) {
                setDoctors(response.data);
            } else if (Array.isArray(response.data.doctors)) {
                setDoctors(response.data.doctors);
            } else if (Array.isArray(response.data.data)) {
                setDoctors(response.data.data);
            } else {
                setDoctors([]);
                console.error(
                    "Doctors data is not an array:",
                    response.data
                );
            }
        } catch (error) {
            console.error(
                "Error while getting doctors:",
                error
            );

            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }

    // --------------------------------------------------
    // UNIQUE FILTER VALUES
    // --------------------------------------------------

    const departments = useMemo(() => {
        return [
            ...new Set(
                doctors
                    .map((doctor) => doctor.department)
                    .filter(Boolean)
            ),
        ].sort();
    }, [doctors]);

    const specializations = useMemo(() => {
        return [
            ...new Set(
                doctors
                    .map((doctor) => doctor.specialization)
                    .filter(Boolean)
            ),
        ].sort();
    }, [doctors]);

    const statuses = useMemo(() => {
        return [
            ...new Set(
                doctors
                    .map((doctor) => doctor.status)
                    .filter(Boolean)
            ),
        ].sort();
    }, [doctors]);

    // --------------------------------------------------
    // SEARCH + FILTER
    // --------------------------------------------------

    const filteredDoctors = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        const filtered = doctors.filter((doctor) => {
            const matchesSearch =
                !searchText ||
                doctor.fullName
                    ?.toLowerCase()
                    .includes(searchText) ||
                doctor.doctorId
                    ?.toLowerCase()
                    .includes(searchText) ||
                doctor.email
                    ?.toLowerCase()
                    .includes(searchText) ||
                doctor.phone
                    ?.toLowerCase()
                    .includes(searchText) ||
                doctor.specialization
                    ?.toLowerCase()
                    .includes(searchText) ||
                doctor.department
                    ?.toLowerCase()
                    .includes(searchText) ||
                doctor.qualification
                    ?.toLowerCase()
                    .includes(searchText);

            const matchesDepartment =
                department === "all" ||
                doctor.department?.toLowerCase() ===
                    department.toLowerCase();

            const matchesSpecialization =
                specialization === "all" ||
                doctor.specialization?.toLowerCase() ===
                    specialization.toLowerCase();

            const matchesStatus =
                status === "all" ||
                doctor.status?.toLowerCase() ===
                    status.toLowerCase();

            const matchesJoiningDate =
                !joiningDate ||
                formatDateForInput(doctor.joiningDate) ===
                    joiningDate;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesSpecialization &&
                matchesStatus &&
                matchesJoiningDate
            );
        });

        if (searchText) {
            filtered.sort((a, b) => {
                const aScore = getSearchScore(
                    a,
                    searchText
                );

                const bScore = getSearchScore(
                    b,
                    searchText
                );

                return bScore - aScore;
            });
        }

        return filtered;
    }, [
        doctors,
        search,
        department,
        specialization,
        status,
        joiningDate,
    ]);

    // --------------------------------------------------
    // PAGINATION
    // --------------------------------------------------

    const totalDoctors = filteredDoctors.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalDoctors / rowsPerPage)
    );

    const startIndex =
        (currentPage - 1) * rowsPerPage;

    const endIndex = Math.min(
        startIndex + rowsPerPage,
        totalDoctors
    );

    const paginatedDoctors =
        filteredDoctors.slice(
            startIndex,
            endIndex
        );

    useEffect(() => {
        setCurrentPage(1);
    }, [
        search,
        department,
        specialization,
        status,
        joiningDate,
        rowsPerPage,
    ]);

    // --------------------------------------------------
    // DATE FORMAT
    // --------------------------------------------------

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("en-IN");
    }

    function formatDateForInput(date) {
        if (!date) {
            return "";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        const year = parsedDate.getFullYear();

        const month = String(
            parsedDate.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            parsedDate.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    // --------------------------------------------------
    // FEE
    // --------------------------------------------------

    function formatFee(fee) {
        if (
            fee === undefined ||
            fee === null ||
            fee === ""
        ) {
            return "-";
        }

        return `₹${fee}`;
    }

    // --------------------------------------------------
    // SEARCH SCORE
    // --------------------------------------------------

    function getSearchScore(doctor, searchText) {
        const name =
            doctor.fullName?.toLowerCase() || "";

        const doctorId =
            doctor.doctorId?.toLowerCase() || "";

        const email =
            doctor.email?.toLowerCase() || "";

        const specialization =
            doctor.specialization?.toLowerCase() || "";

        const department =
            doctor.department?.toLowerCase() || "";

        const qualification =
            doctor.qualification?.toLowerCase() || "";

        let score = 0;

        if (name === searchText) score += 100;
        if (doctorId === searchText) score += 100;
        if (specialization === searchText) score += 90;
        if (department === searchText) score += 80;

        if (name.startsWith(searchText)) score += 70;
        if (specialization.startsWith(searchText)) score += 60;
        if (department.startsWith(searchText)) score += 50;

        if (name.includes(searchText)) score += 40;
        if (email.includes(searchText)) score += 30;
        if (qualification.includes(searchText)) score += 20;

        return score;
    }

    // --------------------------------------------------
    // ADD DOCTOR
    // --------------------------------------------------

    function openAddDoctor() {
        setDoctorForm(emptyDoctorForm);
        setFormMessage("");
        setFormError("");
        setShowAddDoctor(true);
    }

    function closeAddDoctor() {
        if (savingDoctor) {
            return;
        }

        setShowAddDoctor(false);
        setDoctorForm(emptyDoctorForm);
        setFormMessage("");
        setFormError("");
    }

    function handleFormChange(event) {
        const { name, value } = event.target;

        setDoctorForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleAddDoctor(event) {
        event.preventDefault();

        setFormMessage("");
        setFormError("");

        // Basic frontend validation
        const requiredFields = [
            "fullName",
            "doctorId",
            "email",
            "phone",
            "password",
            "specialization",
            "department",
            "experience",
            "qualification",
            "consultationFee",
            "gender",
            "dob",
            "joiningDate",
        ];

        const missingField = requiredFields.find(
            (field) =>
                doctorForm[field] === undefined ||
                doctorForm[field] === null ||
                String(doctorForm[field]).trim() === ""
        );

        if (missingField) {
            setFormError(
                "Please fill in all required doctor details."
            );
            return;
        }

        try {
            setSavingDoctor(true);

            const response = await axios.post(
                "http://https://hospital-management-system-nvjt.onrender.com/api/doctors",
                {

                    ...doctorForm,
                    experience: Number(
                        doctorForm.experience
                    ),
                    consultationFee: Number(
                        doctorForm.consultationFee
                    ),
                }
            );

            console.log(
                "Add doctor response:",
                response.data
            );

            setFormMessage(
                "Doctor added successfully."
            );

            // Refresh table from MongoDB
            await fetchDoctors();

            // Close after successful save
            setTimeout(() => {
                setShowAddDoctor(false);
                setDoctorForm(emptyDoctorForm);
                setFormMessage("");
            }, 700);
        } catch (error) {
            console.error(
                "Add doctor error:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                    "Unable to add doctor. Please try again."
            );
        } finally {
            setSavingDoctor(false);
        }
    }

    // --------------------------------------------------
    // VIEW DOCTOR
    // --------------------------------------------------

    function handleView(doctor) {
        setSelectedDoctor(doctor);
        setShowViewModal(true);
    }

    function closeViewModal() {
        setSelectedDoctor(null);
        setShowViewModal(false);
    }

    // --------------------------------------------------
    // EDIT DOCTOR
    // --------------------------------------------------

    function openEditDoctor(doctor) {
        setFormMessage("");
        setFormError("");

        setEditingDoctor({
            ...doctor,
            experience:
                doctor.experience ?? "",
            consultationFee:
                doctor.consultationFee ?? "",
            dob: formatDateForInput(doctor.dob),
            joiningDate:
                formatDateForInput(
                    doctor.joiningDate
                ),
            password: "",
        });

        setShowEditModal(true);
    }

    function closeEditDoctor() {
        if (updatingDoctor) {
            return;
        }

        setEditingDoctor(null);
        setShowEditModal(false);
        setFormMessage("");
        setFormError("");
    }

    function handleEditChange(event) {
        const { name, value } = event.target;

        setEditingDoctor((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleUpdateDoctor(event) {
        event.preventDefault();

        if (!editingDoctor?._id) {
            return;
        }

        setFormMessage("");
        setFormError("");

        try {
            setUpdatingDoctor(true);

            const updateData = {
                fullName: editingDoctor.fullName,
                email: editingDoctor.email,
                phone: editingDoctor.phone,
                specialization:
                    editingDoctor.specialization,
                department:
                    editingDoctor.department,
                experience:
                    Number(editingDoctor.experience),
                qualification:
                    editingDoctor.qualification,
                consultationFee:
                    Number(
                        editingDoctor.consultationFee
                    ),
                gender: editingDoctor.gender,
                dob: editingDoctor.dob,
                joiningDate:
                    editingDoctor.joiningDate,
                status: editingDoctor.status,
            };

            if (
                editingDoctor.password &&
                editingDoctor.password.trim() !== ""
            ) {
                updateData.password =
                    editingDoctor.password;
            }

            const response = await axios.put(
                `http://https://hospital-management-system-nvjt.onrender.com/api/doctors/${editingDoctor._id}`,
                updateData
            );

            console.log(
                "Update doctor response:",
                response.data
            );

            setFormMessage(
                "Doctor updated successfully."
            );

            await fetchDoctors();

            setTimeout(() => {
                setShowEditModal(false);
                setEditingDoctor(null);
                setFormMessage("");
            }, 700);
        } catch (error) {
            console.error(
                "Update doctor error:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                    "Unable to update doctor."
            );
        } finally {
            setUpdatingDoctor(false);
        }
    }

    // --------------------------------------------------
    // DELETE DOCTOR
    // --------------------------------------------------

    function openDeleteDoctor(doctor) {
        setDeletingDoctor(doctor);
    }

    function closeDeleteDoctor() {
        if (deleting) {
            return;
        }

        setDeletingDoctor(null);
    }

    async function confirmDeleteDoctor() {
        if (!deletingDoctor?._id) {
            return;
        }

        try {
            setDeleting(true);

            await axios.delete(
                `http://https://hospital-management-system-nvjt.onrender.com/api/doctors/${deletingDoctor._id}`
            );

            await fetchDoctors();

            setDeletingDoctor(null);
        } catch (error) {
            console.error(
                "Delete doctor error:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                    "Unable to delete doctor."
            );

            setDeletingDoctor(null);
        } finally {
            setDeleting(false);
        }
    }

    // --------------------------------------------------
    // CLEAR FILTERS
    // --------------------------------------------------

    function clearFilters() {
        setSearch("");
        setDepartment("all");
        setSpecialization("all");
        setStatus("all");
        setJoiningDate("");
        setCurrentPage(1);
    }

    // --------------------------------------------------
    // PAGINATION NUMBERS
    // --------------------------------------------------

    function getPageNumbers() {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(
            1,
            currentPage - 2
        );

        let endPage = Math.min(
            totalPages,
            startPage + maxVisiblePages - 1
        );

        if (
            endPage - startPage <
            maxVisiblePages - 1
        ) {
            startPage = Math.max(
                1,
                endPage - maxVisiblePages + 1
            );
        }

        for (
            let page = startPage;
            page <= endPage;
            page++
        ) {
            pages.push(page);
        }

        return pages;
    }

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <div className="doctors-page">

            {/* HEADER */}

            <div className="doctors-header">

                <div>
                    <h2>Doctors</h2>

                    <p>
                        Manage doctors and their professional
                        information.
                    </p>
                </div>

                <button
                    type="button"
                    className="add-doctor-button"
                    onClick={openAddDoctor}
                >
                    + Add Doctor
                </button>

            </div>

            {/* SEARCH + FILTERS */}

            <div className="doctor-filters">

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name, doctor ID, email, specialization..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>

                <select
                    value={department}
                    onChange={(event) =>
                        setDepartment(
                            event.target.value
                        )
                    }
                >
                    <option value="all">
                        All Departments
                    </option>

                    {departments.map((item) => (
                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>
                    ))}
                </select>

                <select
                    value={specialization}
                    onChange={(event) =>
                        setSpecialization(
                            event.target.value
                        )
                    }
                >
                    <option value="all">
                        All Specializations
                    </option>

                    {specializations.map(
                        (item) => (
                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>
                        )
                    )}
                </select>

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

                    {statuses.map((item) => (
                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    value={joiningDate}
                    onChange={(event) =>
                        setJoiningDate(
                            event.target.value
                        )
                    }
                    title="Joining date"
                />

                <button
                    type="button"
                    className="clear-filter-button"
                    onClick={clearFilters}
                >
                    Clear
                </button>

            </div>

            {/* PAGINATION */}

            <div className="doctors-pagination">

                <div className="pagination-left">

                    <span className="pagination-result">

                        Showing{" "}

                        <strong>
                            {totalDoctors === 0
                                ? 0
                                : startIndex + 1}
                        </strong>

                        {" "}to{" "}

                        <strong>
                            {endIndex}
                        </strong>

                        {" "}of{" "}

                        <strong>
                            {totalDoctors}
                        </strong>

                        {" "}doctors

                    </span>

                </div>

                <div className="pagination-right">

                    <div className="rows-per-page">

                        <span>
                            Show
                        </span>

                        <select
                            value={rowsPerPage}
                            onChange={(event) =>
                                setRowsPerPage(
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                        >
                            <option value="5">
                                5
                            </option>

                            <option value="10">
                                10
                            </option>

                            <option value="20">
                                20
                            </option>

                            <option value="50">
                                50
                            </option>
                        </select>

                    </div>

                    <button
                        type="button"
                        className="pagination-button"
                        disabled={
                            currentPage === 1
                        }
                        onClick={() =>
                            setCurrentPage(
                                (page) =>
                                    page - 1
                            )
                        }
                    >
                        ‹ Prev
                    </button>

                    <div className="pagination-pages">

                        {getPageNumbers().map(
                            (page) => (
                                <button
                                    type="button"
                                    key={page}
                                    className={`pagination-page ${
                                        currentPage ===
                                        page
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setCurrentPage(
                                            page
                                        )
                                    }
                                >
                                    {page}
                                </button>
                            )
                        )}

                    </div>

                    <button
                        type="button"
                        className="pagination-button"
                        disabled={
                            currentPage ===
                            totalPages
                        }
                        onClick={() =>
                            setCurrentPage(
                                (page) =>
                                    page + 1
                            )
                        }
                    >
                        Next ›
                    </button>

                </div>

            </div>

            {/* TABLE */}

            <div className="doctors-table-card">

                <div className="doctors-table-wrapper">

                    <table className="doctors-table">

                        <thead>

                            <tr>

                                <th>Full Name</th>
                                <th>Doctor ID</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Specialization</th>
                                <th>Department</th>
                                <th>Experience</th>
                                <th>Qualification</th>
                                <th>Consultation Fee</th>
                                <th>Gender</th>
                                <th>Date of Birth</th>
                                <th>Joining Date</th>
                                <th>Status</th>
                                <th>Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="14"
                                        className="table-message"
                                    >
                                        Loading doctors...
                                    </td>

                                </tr>

                            ) : paginatedDoctors.length ===
                              0 ? (

                                <tr>

                                    <td
                                        colSpan="14"
                                        className="table-message"
                                    >
                                        No doctors found.
                                    </td>

                                </tr>

                            ) : (

                                paginatedDoctors.map(
                                    (doctor) => (

                                        <tr
                                            key={
                                                doctor._id
                                            }
                                        >

                                            <td>

                                                <div className="doctor-name-cell">

                                                    <div className="doctor-avatar">

                                                        {doctor.fullName
                                                            ?.charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}

                                                    </div>

                                                    <strong>
                                                        {
                                                            doctor.fullName
                                                        }
                                                    </strong>

                                                </div>

                                            </td>

                                            <td>
                                                {
                                                    doctor.doctorId ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    doctor.email ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    doctor.phone ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    doctor.specialization ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    doctor.department ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {doctor.experience !==
                                                undefined
                                                    ? `${doctor.experience} years`
                                                    : "-"}
                                            </td>

                                            <td>
                                                {
                                                    doctor.qualification ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {formatFee(
                                                    doctor.consultationFee
                                                )}
                                            </td>

                                            <td>
                                                {
                                                    doctor.gender ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {formatDate(
                                                    doctor.dob
                                                )}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    doctor.joiningDate
                                                )}
                                            </td>

                                            <td>

                                                <span
                                                    className={`doctor-status ${doctor.status
                                                        ?.toLowerCase()
                                                        .replace(
                                                            /\s+/g,
                                                            "-"
                                                        )}`}
                                                >
                                                    {
                                                        doctor.status
                                                    }
                                                </span>

                                            </td>

                                            <td className="action-cell">

                                                <div className="doctor-actions">

                                                    <button
                                                        type="button"
                                                        className="view-button"
                                                        onClick={() =>
                                                            handleView(
                                                                doctor
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="edit-button"
                                                        onClick={() =>
                                                            openEditDoctor(
                                                                doctor
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete-button"
                                                        onClick={() =>
                                                            openDeleteDoctor(
                                                                doctor
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* ==================================================
                ADD DOCTOR MODAL
            ================================================== */}

            {showAddDoctor && (

                <div
                    className="doctor-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeAddDoctor();
                        }
                    }}
                >

                    <div className="doctor-modal">

                        <div className="doctor-modal-header">

                            <div>
                                <h3>
                                    Add New Doctor
                                </h3>

                                <p>
                                    Enter the doctor's professional
                                    and account information.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={
                                    closeAddDoctor
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            className="doctor-form"
                            onSubmit={
                                handleAddDoctor
                            }
                        >

                            <div className="doctor-modal-body">

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

                                <div className="form-section">

                                    <div className="form-section-title">
                                        Personal Information
                                    </div>

                                    <div className="form-grid">

                                        <div className="form-group">
                                            <label>
                                                Full Name *
                                            </label>

                                            <input
                                                name="fullName"
                                                value={
                                                    doctorForm.fullName
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Gender *
                                            </label>

                                            <select
                                                name="gender"
                                                value={
                                                    doctorForm.gender
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select gender
                                                </option>

                                                <option value="Male">
                                                    Male
                                                </option>

                                                <option value="Female">
                                                    Female
                                                </option>

                                                <option value="Other">
                                                    Other
                                                </option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Date of Birth *
                                            </label>

                                            <input
                                                type="date"
                                                name="dob"
                                                value={
                                                    doctorForm.dob
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Phone *
                                            </label>

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={
                                                    doctorForm.phone
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                placeholder="Enter phone number"
                                                required
                                            />
                                        </div>

                                    </div>

                                </div>

                                <div className="form-section">

                                    <div className="form-section-title">
                                        Account Information
                                    </div>

                                    <div className="form-grid">

                                        <div className="form-group">
                                            <label>
                                                Doctor ID *
                                            </label>

                                            <input
                                                name="doctorId"
                                                value={
                                                    doctorForm.doctorId
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                placeholder="Example: DOC001"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Email *
                                            </label>

                                            <input
                                                type="email"
                                                name="email"
                                                value={
                                                    doctorForm.email
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                placeholder="doctor@example.com"
                                                required
                                            />
                                        </div>

                                        <div className="form-group form-group-full">
                                            <label>
                                                Temporary Password *
                                            </label>

                                            <input
                                                type="password"
                                                name="password"
                                                value={
                                                    doctorForm.password
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                placeholder="Enter temporary login password"
                                                required
                                            />

                                            <small>
                                                This password will be sent to the doctor's email.
                                            </small>
                                        </div>

                                    </div>

                                </div>

                                <div className="form-section">

                                    <div className="form-section-title">
                                        Professional Information
                                    </div>

                                    <div className="form-grid">

                                        <div className="form-group">
                                            <label>
                                                Specialization *
                                            </label>

                                            <input
                                                name="specialization"
                                                value={
                                                    doctorForm.specialization
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                placeholder="Example: Cardiologist"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Department *
                                            </label>

                                            <input
                                                name="department"
                                                value={
                                                    doctorForm.department
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                placeholder="Example: Cardiology"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Qualification *
                                            </label>

                                            <input
                                                name="qualification"
                                                value={
                                                    doctorForm.qualification
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                placeholder="Example: MBBS, MD"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Experience *
                                            </label>

                                            <input
                                                type="number"
                                                name="experience"
                                                value={
                                                    doctorForm.experience
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                placeholder="Years of experience"
                                                min="0"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Consultation Fee *
                                            </label>

                                            <input
                                                type="number"
                                                name="consultationFee"
                                                value={
                                                    doctorForm.consultationFee
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                placeholder="Enter consultation fee"
                                                min="0"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Joining Date *
                                            </label>

                                            <input
                                                type="date"
                                                name="joiningDate"
                                                value={
                                                    doctorForm.joiningDate
                                                }
                                                onChange={
                                                    handleFormChange
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
                                                    doctorForm.status
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                            >
                                                <option value="Available">
                                                    Available
                                                </option>

                                                <option value="On Leave">
                                                    On Leave
                                                </option>

                                                <option value="Unavailable">
                                                    Unavailable
                                                </option>
                                            </select>
                                        </div>

                                    </div>

                                </div>

                            </div>

                            <div className="doctor-modal-footer">

                                <button
                                    type="button"
                                    className="modal-cancel-button"
                                    onClick={
                                        closeAddDoctor
                                    }
                                    disabled={
                                        savingDoctor
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="modal-save-button"
                                    disabled={
                                        savingDoctor
                                    }
                                >
                                    {savingDoctor
                                        ? "Saving..."
                                        : "Save Doctor"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* ==================================================
                VIEW DOCTOR MODAL
            ================================================== */}

            {showViewModal &&
                selectedDoctor && (

                    <div
                        className="doctor-modal-overlay"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeViewModal();
                            }
                        }}
                    >

                        <div className="doctor-modal view-modal">

                            <div className="doctor-modal-header">

                                <div>
                                    <h3>
                                        Doctor Details
                                    </h3>

                                    <p>
                                        Complete professional information.
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

                            <div className="doctor-modal-body">

                                <div className="doctor-profile-header">

                                    <div className="large-doctor-avatar">
                                        {selectedDoctor.fullName
                                            ?.charAt(
                                                0
                                            )
                                            .toUpperCase()}
                                    </div>

                                    <div>
                                        <h3>
                                            {
                                                selectedDoctor.fullName
                                            }
                                        </h3>

                                        <p>
                                            {
                                                selectedDoctor.specialization
                                            }
                                        </p>

                                        <span
                                            className={`doctor-status ${selectedDoctor.status
                                                ?.toLowerCase()
                                                .replace(
                                                    /\s+/g,
                                                    "-"
                                                )}`}
                                        >
                                            {
                                                selectedDoctor.status
                                            }
                                        </span>
                                    </div>

                                </div>

                                <div className="details-grid">

                                    <div className="detail-item">
                                        <span>
                                            Doctor ID
                                        </span>
                                        <strong>
                                            {
                                                selectedDoctor.doctorId
                                            }
                                        </strong>
                                    </div>

                                    <div className="detail-item">
                                        <span>
                                            Email
                                        </span>
                                        <strong>
                                            {
                                                selectedDoctor.email
                                            }
                                        </strong>
                                    </div>

                                    <div className="detail-item">
                                        <span>
                                            Phone
                                        </span>
                                        <strong>
                                            {
                                                selectedDoctor.phone
                                            }
                                        </strong>
                                    </div>

                                    <div className="detail-item">
                                        <span>
                                            Department
                                        </span>
                                        <strong>
                                            {
                                                selectedDoctor.department
                                            }
                                        </strong>
                                    </div>

                                    <div className="detail-item">
                                        <span>
                                            Specialization
                                        </span>
                                        <strong>
                                            {
                                                selectedDoctor.specialization
                                            }
                                        </strong>
                                    </div>

                                    <div className="detail-item">
                                        <span>
                                            Qualification
                                        </span>
                                        <strong>
                                            {
                                                selectedDoctor.qualification
                                            }
                                        </strong>
                                    </div>

                                    <div className="detail-item">
                                        <span>
                                            Experience
                                        </span>
                                        <strong>
                                            {
                                                selectedDoctor.experience
                                            }{" "}
                                            years
                                        </strong>
                                    </div>

                                    <div className="detail-item">
                                        <span>
                                            Consultation Fee
                                        </span>
                                        <strong>
                                            {formatFee(
                                                selectedDoctor.consultationFee
                                            )}
                                        </strong>
                                    </div>

                                    <div className="detail-item">
                                        <span>
                                            Gender
                                        </span>
                                        <strong>
                                            {
                                                selectedDoctor.gender
                                            }
                                        </strong>
                                    </div>

                                    <div className="detail-item">
                                        <span>
                                            Date of Birth
                                        </span>
                                        <strong>
                                            {formatDate(
                                                selectedDoctor.dob
                                            )}
                                        </strong>
                                    </div>

                                    <div className="detail-item">
                                        <span>
                                            Joining Date
                                        </span>
                                        <strong>
                                            {formatDate(
                                                selectedDoctor.joiningDate
                                            )}
                                        </strong>
                                    </div>

                                    <div className="detail-item">
                                        <span>
                                            Status
                                        </span>

                                        <strong>
                                            {
                                                selectedDoctor.status
                                            }
                                        </strong>
                                    </div>

                                </div>

                            </div>

                            <div className="doctor-modal-footer">

                                <button
                                    type="button"
                                    className="modal-cancel-button"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    Close
                                </button>

                                <button
                                    type="button"
                                    className="modal-save-button"
                                    onClick={() => {
                                        closeViewModal();
                                        openEditDoctor(
                                            selectedDoctor
                                        );
                                    }}
                                >
                                    Edit Doctor
                                </button>

                            </div>

                        </div>

                    </div>
                )}

            {/* ==================================================
                EDIT DOCTOR MODAL
            ================================================== */}

            {showEditModal &&
                editingDoctor && (

                    <div
                        className="doctor-modal-overlay"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeEditDoctor();
                            }
                        }}
                    >

                        <div className="doctor-modal">

                            <div className="doctor-modal-header">

                                <div>
                                    <h3>
                                        Edit Doctor
                                    </h3>

                                    <p>
                                        Update doctor information.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="modal-close-button"
                                    onClick={
                                        closeEditDoctor
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            <form
                                className="doctor-form"
                                onSubmit={
                                    handleUpdateDoctor
                                }
                            >

                                <div className="doctor-modal-body">

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

                                    <div className="form-section">

                                        <div className="form-section-title">
                                            Personal Information
                                        </div>

                                        <div className="form-grid">

                                            <div className="form-group">
                                                <label>
                                                    Full Name *
                                                </label>

                                                <input
                                                    name="fullName"
                                                    value={
                                                        editingDoctor.fullName ||
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    Gender *
                                                </label>

                                                <select
                                                    name="gender"
                                                    value={
                                                        editingDoctor.gender ||
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    required
                                                >
                                                    <option value="">
                                                        Select gender
                                                    </option>

                                                    <option value="Male">
                                                        Male
                                                    </option>

                                                    <option value="Female">
                                                        Female
                                                    </option>

                                                    <option value="Other">
                                                        Other
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    Date of Birth *
                                                </label>

                                                <input
                                                    type="date"
                                                    name="dob"
                                                    value={
                                                        editingDoctor.dob ||
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    Phone *
                                                </label>

                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={
                                                        editingDoctor.phone ||
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    required
                                                />
                                            </div>

                                        </div>

                                    </div>

                                    <div className="form-section">

                                        <div className="form-section-title">
                                            Account Information
                                        </div>

                                        <div className="form-grid">

                                            <div className="form-group">
                                                <label>
                                                    Doctor ID
                                                </label>

                                                <input
                                                    value={
                                                        editingDoctor.doctorId ||
                                                        ""
                                                    }
                                                    disabled
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    Email *
                                                </label>

                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={
                                                        editingDoctor.email ||
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="form-group form-group-full">
                                                <label>
                                                    New Password
                                                </label>

                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={
                                                        editingDoctor.password ||
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    placeholder="Leave blank to keep current password"
                                                />

                                                <small>
                                                    Leave blank if you do not want to change the password.
                                                </small>
                                            </div>

                                        </div>

                                    </div>

                                    <div className="form-section">

                                        <div className="form-section-title">
                                            Professional Information
                                        </div>

                                        <div className="form-grid">

                                            <div className="form-group">
                                                <label>
                                                    Specialization *
                                                </label>

                                                <input
                                                    name="specialization"
                                                    value={
                                                        editingDoctor.specialization ||
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    Department *
                                                </label>

                                                <input
                                                    name="department"
                                                    value={
                                                        editingDoctor.department ||
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    Qualification *
                                                </label>

                                                <input
                                                    name="qualification"
                                                    value={
                                                        editingDoctor.qualification ||
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    Experience *
                                                </label>

                                                <input
                                                    type="number"
                                                    name="experience"
                                                    value={
                                                        editingDoctor.experience ??
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    Consultation Fee *
                                                </label>

                                                <input
                                                    type="number"
                                                    name="consultationFee"
                                                    value={
                                                        editingDoctor.consultationFee ??
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    Joining Date *
                                                </label>

                                                <input
                                                    type="date"
                                                    name="joiningDate"
                                                    value={
                                                        editingDoctor.joiningDate ||
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditChange
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
                                                        editingDoctor.status ||
                                                        "Available"
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                >
                                                    <option value="Available">
                                                        Available
                                                    </option>

                                                    <option value="On Leave">
                                                        On Leave
                                                    </option>

                                                    <option value="Unavailable">
                                                        Unavailable
                                                    </option>
                                                </select>
                                            </div>

                                        </div>

                                    </div>

                                </div>

                                <div className="doctor-modal-footer">

                                    <button
                                        type="button"
                                        className="modal-cancel-button"
                                        onClick={
                                            closeEditDoctor
                                        }
                                        disabled={
                                            updatingDoctor
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="modal-save-button"
                                        disabled={
                                            updatingDoctor
                                        }
                                    >
                                        {updatingDoctor
                                            ? "Updating..."
                                            : "Save Changes"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}

            {/* ==================================================
                DELETE CONFIRMATION MODAL
            ================================================== */}

            {deletingDoctor && (

                <div
                    className="doctor-modal-overlay delete-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDeleteDoctor();
                        }
                    }}
                >

                    <div className="delete-modal">

                        <div className="delete-icon">
                            !
                        </div>

                        <h3>
                            Delete Doctor?
                        </h3>

                        <p>
                            Are you sure you want to delete{" "}
                            <strong>
                                {
                                    deletingDoctor.fullName
                                }
                            </strong>
                            ?
                        </p>

                        <span>
                            This action cannot be undone.
                        </span>

                        <div className="delete-modal-actions">

                            <button
                                type="button"
                                className="modal-cancel-button"
                                onClick={
                                    closeDeleteDoctor
                                }
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="confirm-delete-button"
                                onClick={
                                    confirmDeleteDoctor
                                }
                                disabled={deleting}
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete Doctor"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Doctors;