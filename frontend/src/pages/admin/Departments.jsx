import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "./Departments.css";

const API_URL =
    "https://hospital-management-system-nvjt.onrender.com/api/departments";

const DOCTORS_URL =
    "https://hospital-management-system-nvjt.onrender.com/api/doctors";

const EMPTY_FORM = {
    name: "",
    code: "",
    description: "",
    location: "",
    headDoctor: "",
    status: "Active",
};

function Departments() {
    const [departments, setDepartments] =
        useState([]);

    const [doctors, setDoctors] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [formError, setFormError] =
        useState("");

    const [formMessage, setFormMessage] =
        useState("");

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [showViewModal, setShowViewModal] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [updating, setUpdating] =
        useState(false);

    const [selectedDepartment, setSelectedDepartment] =
        useState(null);

    const [editingDepartment, setEditingDepartment] =
        useState(null);

    const [departmentForm, setDepartmentForm] =
        useState({
            ...EMPTY_FORM,
        });
    useEffect(() => {
        loadData();
    }, []);
    async function loadData() {
        try {
            setLoading(true);
            setError("");

            await Promise.all([
                fetchDepartments(),
                fetchDoctors(),
            ]);
        } catch (error) {
            console.error(
                "Department page loading error:",
                error
            );
        } finally {
            setLoading(false);
        }
    }
    async function fetchDepartments() {
        try {
            const response =
                await axios.get(API_URL);

            console.log(
                "Departments API response:",
                response.data
            );

            if (
                Array.isArray(
                    response.data?.departments
                )
            ) {
                setDepartments(
                    response.data.departments
                );
            } else if (
                Array.isArray(response.data)
            ) {
                setDepartments(
                    response.data
                );
            } else {
                setDepartments([]);
            }
        } catch (error) {
            console.error(
                "Unable to load departments:",
                error
            );

            setDepartments([]);

            setError(
                error.response?.data?.message ||
                    "Unable to load departments."
            );
        }
    }
    async function fetchDoctors() {
        try {
            const response =
                await axios.get(
                    DOCTORS_URL
                );

            if (
                Array.isArray(
                    response.data?.doctors
                )
            ) {
                setDoctors(
                    response.data.doctors
                );
            } else if (
                Array.isArray(response.data)
            ) {
                setDoctors(
                    response.data
                );
            } else {
                setDoctors([]);
            }
        } catch (error) {
            console.error(
                "Unable to load doctors:",
                error
            );

            setDoctors([]);
        }
    }
    const filteredDepartments =
        useMemo(() => {
            const searchText =
                search
                    .trim()
                    .toLowerCase();

            return departments.filter(
                (department) => {

                    const matchesSearch =
                        !searchText ||
                        department.name
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        department.code
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        department.location
                            ?.toLowerCase()
                            .includes(
                                searchText
                            );

                    const matchesStatus =
                        statusFilter ===
                            "all" ||
                        department.status
                            ?.toLowerCase() ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            departments,
            search,
            statusFilter,
        ]);
    const activeCount =
        departments.filter(
            (department) =>
                department.status ===
                "Active"
        ).length;
    const inactiveCount =
        departments.filter(
            (department) =>
                department.status ===
                "Inactive"
        ).length;
    const totalDoctors =
        departments.reduce(
            (
                total,
                department
            ) =>
                total +
                Number(
                    department.doctorCount ||
                    0
                ),
            0
        );
    function handleFormChange(
        event
    ) {
        const {
            name,
            value,
        } = event.target;

        setDepartmentForm(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
    }


    function handleEditChange(
        event
    ) {
        const {
            name,
            value,
        } = event.target;

        setEditingDepartment(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
    }
    function openAddDepartment() {
        setDepartmentForm({
            ...EMPTY_FORM,
        });

        setFormError("");
        setFormMessage("");

        setShowAddModal(true);
    }


    function closeAddDepartment() {
        if (saving) {
            return;
        }

        setShowAddModal(false);

        setFormError("");
        setFormMessage("");
    }


    async function handleAddDepartment(
        event
    ) {
        event.preventDefault();

        setFormError("");
        setFormMessage("");

        if (
            !departmentForm.name ||
            !departmentForm.code
        ) {
            setFormError(
                "Department name and code are required."
            );

            return;
        }

        try {
            setSaving(true);

            const response =
                await axios.post(
                    API_URL,
                    departmentForm
                );

            console.log(
                "Department created:",
                response.data
            );

            setFormMessage(
                "Department created successfully."
            );

            await fetchDepartments();

            setTimeout(() => {
                setShowAddModal(false);

                setDepartmentForm({
                    ...EMPTY_FORM,
                });

                setFormMessage("");
            }, 700);

        } catch (error) {
            console.error(
                "Create department error:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                    "Unable to create department."
            );
        } finally {
            setSaving(false);
        }
    }
    function openViewDepartment(
        department
    ) {
        setSelectedDepartment(
            department
        );

        setShowViewModal(true);
    }


    function closeViewDepartment() {
        setSelectedDepartment(null);
        setShowViewModal(false);
    }
    function openEditDepartment(
        department
    ) {
        setEditingDepartment({
            ...department,

            headDoctor:
                department.headDoctor
                    ?._id ||
                department.headDoctor ||
                "",
        });

        setFormError("");
        setFormMessage("");

        setShowEditModal(true);
    }


    function closeEditDepartment() {
        if (updating) {
            return;
        }

        setEditingDepartment(null);
        setShowEditModal(false);

        setFormError("");
        setFormMessage("");
    }


    async function handleUpdateDepartment(
        event
    ) {
        event.preventDefault();

        if (
            !editingDepartment?._id
        ) {
            return;
        }

        setFormError("");
        setFormMessage("");

        try {
            setUpdating(true);

            const updateData = {
                name:
                    editingDepartment.name,

                code:
                    editingDepartment.code,

                description:
                    editingDepartment.description ||
                    "",

                location:
                    editingDepartment.location ||
                    "",

                headDoctor:
                    editingDepartment.headDoctor ||
                    null,

                status:
                    editingDepartment.status ||
                    "Active",
            };

            const response =
                await axios.put(
                    `${API_URL}/${editingDepartment._id}`,
                    updateData
                );

            console.log(
                "Department updated:",
                response.data
            );

            setFormMessage(
                "Department updated successfully."
            );

            await fetchDepartments();

            setTimeout(() => {
                setShowEditModal(false);
                setEditingDepartment(null);
                setFormMessage("");
            }, 700);

        } catch (error) {
            console.error(
                "Update department error:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                    "Unable to update department."
            );
        } finally {
            setUpdating(false);
        }
    }
    async function handleRefresh() {
        setError("");

        await loadData();
    }
    if (loading) {
        return (
            <div className="departments-page">

                <div className="departments-loading">

                    <div className="departments-spinner"></div>

                    Loading departments...

                </div>

            </div>
        );
    }
    return (
        <div className="departments-page">

            {/* HEADER */}

            <div className="departments-header">

                <div>

                    <h2>
                        Departments
                    </h2>

                    <p>
                        Manage hospital
                        departments and
                        clinical services.
                    </p>

                </div>


                <div className="departments-header-actions">

                    <button
                        type="button"
                        className="departments-refresh-button"
                        onClick={
                            handleRefresh
                        }
                    >
                        ↻ Refresh
                    </button>


                    <button
                        type="button"
                        className="add-department-button"
                        onClick={
                            openAddDepartment
                        }
                    >
                        + Add Department
                    </button>

                </div>

            </div>


            {/* ERROR */}

            {error && (
                <div className="departments-error">
                    {error}
                </div>
            )}


            {/* SUMMARY */}

            <div className="department-summary-grid">

                <div className="department-summary-card">

                    <span>
                        Total Departments
                    </span>

                    <strong>
                        {departments.length}
                    </strong>

                    <p>
                        Registered departments
                    </p>

                </div>


                <div className="department-summary-card">

                    <span>
                        Active Departments
                    </span>

                    <strong>
                        {activeCount}
                    </strong>

                    <p>
                        Currently active
                    </p>

                </div>


                <div className="department-summary-card">

                    <span>
                        Inactive Departments
                    </span>

                    <strong>
                        {inactiveCount}
                    </strong>

                    <p>
                        Temporarily unavailable
                    </p>

                </div>


                <div className="department-summary-card">

                    <span>
                        Doctors Assigned
                    </span>

                    <strong>
                        {totalDoctors}
                    </strong>

                    <p>
                        Across departments
                    </p>

                </div>

            </div>


            {/* FILTERS */}

            <div className="departments-filter-card">

                <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                    placeholder="Search department, code or location..."
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

                    <option value="active">
                        Active
                    </option>

                    <option value="inactive">
                        Inactive
                    </option>

                </select>


                <button
                    type="button"
                    onClick={() => {
                        setSearch("");
                        setStatusFilter(
                            "all"
                        );
                    }}
                >
                    Clear
                </button>

            </div>


            {/* TABLE */}

            {filteredDepartments.length ===
            0 ? (

                <div className="departments-empty">

                    <div className="department-empty-icon">
                        ▦
                    </div>

                    <h3>
                        No departments found
                    </h3>

                    <p>
                        Create your first
                        hospital department.
                    </p>

                    <button
                        type="button"
                        onClick={
                            openAddDepartment
                        }
                    >
                        + Add Department
                    </button>

                </div>

            ) : (

                <div className="departments-table-card">

                    <div className="departments-table-wrapper">

                        <table className="departments-table">

                            <thead>

                                <tr>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Code
                                    </th>

                                    <th>
                                        Location
                                    </th>

                                    <th>
                                        Head Doctor
                                    </th>

                                    <th>
                                        Doctors
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

                                {filteredDepartments.map(
                                    (
                                        department
                                    ) => (

                                        <tr
                                            key={
                                                department._id
                                            }
                                        >

                                            <td>

                                                <div className="department-name-cell">

                                                    <div className="department-icon">
                                                        ▦
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                department.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                department.description ||
                                                                "No description"
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <span className="department-code">
                                                    {
                                                        department.code
                                                    }
                                                </span>

                                            </td>


                                            <td>

                                                {
                                                    department.location ||
                                                    "Not specified"
                                                }

                                            </td>


                                            <td>

                                                {
                                                    department
                                                        .headDoctor
                                                        ?.fullName
                                                    ||
                                                    "Not assigned"
                                                }

                                            </td>


                                            <td>

                                                <strong>
                                                    {
                                                        department.doctorCount ||
                                                        0
                                                    }
                                                </strong>

                                            </td>


                                            <td>

                                                <span
                                                    className={`department-status ${department.status?.toLowerCase()}`}
                                                >
                                                    {
                                                        department.status
                                                    }
                                                </span>

                                            </td>


                                            <td>

                                                <div className="department-action-buttons">

                                                    <button
                                                        type="button"
                                                        className="department-view-button"
                                                        onClick={() =>
                                                            openViewDepartment(
                                                                department
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="department-edit-button"
                                                        onClick={() =>
                                                            openEditDepartment(
                                                                department
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

                </div>

            )}
            {showAddModal && (

                <div
                    className="department-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeAddDepartment();
                        }

                    }}
                >

                    <div className="department-modal">

                        <div className="department-modal-header">

                            <div>

                                <h3>
                                    Add Department
                                </h3>

                                <p>
                                    Create a new
                                    hospital department.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="department-modal-close"
                                onClick={
                                    closeAddDepartment
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleAddDepartment
                            }
                        >

                            <div className="department-modal-body">

                                {formError && (
                                    <div className="department-form-error">
                                        {formError}
                                    </div>
                                )}


                                {formMessage && (
                                    <div className="department-form-success">
                                        {
                                            formMessage
                                        }
                                    </div>
                                )}


                                <div className="department-form-grid">

                                    <div className="department-form-group">

                                        <label>
                                            Department Name *
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={
                                                departmentForm.name
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Example: Cardiology"
                                            required
                                        />

                                    </div>


                                    <div className="department-form-group">

                                        <label>
                                            Department Code *
                                        </label>

                                        <input
                                            type="text"
                                            name="code"
                                            value={
                                                departmentForm.code
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Example: CARD"
                                            required
                                        />

                                    </div>


                                    <div className="department-form-group full-width">

                                        <label>
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                departmentForm.description
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Describe the department..."
                                            rows="3"
                                        />

                                    </div>


                                    <div className="department-form-group">

                                        <label>
                                            Location
                                        </label>

                                        <input
                                            type="text"
                                            name="location"
                                            value={
                                                departmentForm.location
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Example: Block A - 2nd Floor"
                                        />

                                    </div>


                                    <div className="department-form-group">

                                        <label>
                                            Department Head
                                        </label>

                                        <select
                                            name="headDoctor"
                                            value={
                                                departmentForm.headDoctor
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                        >

                                            <option value="">
                                                Not assigned
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
                                                        Dr.{" "}
                                                        {
                                                            doctor.fullName
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="department-form-group">

                                        <label>
                                            Status
                                        </label>

                                        <select
                                            name="status"
                                            value={
                                                departmentForm.status
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                        >

                                            <option value="Active">
                                                Active
                                            </option>

                                            <option value="Inactive">
                                                Inactive
                                            </option>

                                        </select>

                                    </div>

                                </div>

                            </div>


                            <div className="department-modal-footer">

                                <button
                                    type="button"
                                    className="department-cancel-button"
                                    onClick={
                                        closeAddDepartment
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="department-save-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Department"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {showViewModal &&
                selectedDepartment && (

                    <div
                        className="department-modal-overlay"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeViewDepartment();
                            }

                        }}
                    >

                        <div className="department-modal">

                            <div className="department-modal-header">

                                <div>

                                    <h3>
                                        Department Details
                                    </h3>

                                    <p>
                                        Complete department
                                        information.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="department-modal-close"
                                    onClick={
                                        closeViewDepartment
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="department-modal-body">

                                <div className="department-profile">

                                    <div className="department-large-icon">
                                        ▦
                                    </div>

                                    <div>

                                        <h3>
                                            {
                                                selectedDepartment.name
                                            }
                                        </h3>

                                        <span>
                                            {
                                                selectedDepartment.code
                                            }
                                        </span>

                                    </div>

                                </div>


                                <div className="department-details-grid">

                                    <div>

                                        <label>
                                            Location
                                        </label>

                                        <strong>
                                            {
                                                selectedDepartment.location ||
                                                "Not specified"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <label>
                                            Head Doctor
                                        </label>

                                        <strong>
                                            {
                                                selectedDepartment
                                                    .headDoctor
                                                    ?.fullName ||
                                                "Not assigned"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <label>
                                            Doctors
                                        </label>

                                        <strong>
                                            {
                                                selectedDepartment.doctorCount ||
                                                0
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <label>
                                            Status
                                        </label>

                                        <span
                                            className={`department-status ${selectedDepartment.status?.toLowerCase()}`}
                                        >
                                            {
                                                selectedDepartment.status
                                            }
                                        </span>

                                    </div>


                                    <div className="full-width">

                                        <label>
                                            Description
                                        </label>

                                        <p>
                                            {
                                                selectedDepartment.description ||
                                                "No description provided."
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="department-modal-footer">

                                <button
                                    type="button"
                                    className="department-cancel-button"
                                    onClick={
                                        closeViewDepartment
                                    }
                                >
                                    Close
                                </button>


                                <button
                                    type="button"
                                    className="department-save-button"
                                    onClick={() => {

                                        closeViewDepartment();

                                        openEditDepartment(
                                            selectedDepartment
                                        );

                                    }}
                                >
                                    Edit Department
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            {showEditModal &&
                editingDepartment && (

                    <div
                        className="department-modal-overlay"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeEditDepartment();
                            }

                        }}
                    >

                        <div className="department-modal">

                            <div className="department-modal-header">

                                <div>

                                    <h3>
                                        Edit Department
                                    </h3>

                                    <p>
                                        Update department
                                        information.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="department-modal-close"
                                    onClick={
                                        closeEditDepartment
                                    }
                                    disabled={
                                        updating
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <form
                                onSubmit={
                                    handleUpdateDepartment
                                }
                            >

                                <div className="department-modal-body">

                                    {formError && (
                                        <div className="department-form-error">
                                            {formError}
                                        </div>
                                    )}


                                    {formMessage && (
                                        <div className="department-form-success">
                                            {
                                                formMessage
                                            }
                                        </div>
                                    )}


                                    <div className="department-form-grid">

                                        <div className="department-form-group">

                                            <label>
                                                Department Name *
                                            </label>

                                            <input
                                                type="text"
                                                name="name"
                                                value={
                                                    editingDepartment.name ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                            />

                                        </div>


                                        <div className="department-form-group">

                                            <label>
                                                Department Code *
                                            </label>

                                            <input
                                                type="text"
                                                name="code"
                                                value={
                                                    editingDepartment.code ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                            />

                                        </div>


                                        <div className="department-form-group full-width">

                                            <label>
                                                Description
                                            </label>

                                            <textarea
                                                name="description"
                                                value={
                                                    editingDepartment.description ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                rows="3"
                                            />

                                        </div>


                                        <div className="department-form-group">

                                            <label>
                                                Location
                                            </label>

                                            <input
                                                type="text"
                                                name="location"
                                                value={
                                                    editingDepartment.location ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />

                                        </div>


                                        <div className="department-form-group">

                                            <label>
                                                Department Head
                                            </label>

                                            <select
                                                name="headDoctor"
                                                value={
                                                    editingDepartment.headDoctor ||
                                                    ""
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            >

                                                <option value="">
                                                    Not assigned
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
                                                            Dr.{" "}
                                                            {
                                                                doctor.fullName
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        <div className="department-form-group">

                                            <label>
                                                Status
                                            </label>

                                            <select
                                                name="status"
                                                value={
                                                    editingDepartment.status ||
                                                    "Active"
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            >

                                                <option value="Active">
                                                    Active
                                                </option>

                                                <option value="Inactive">
                                                    Inactive
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                </div>


                                <div className="department-modal-footer">

                                    <button
                                        type="button"
                                        className="department-cancel-button"
                                        onClick={
                                            closeEditDepartment
                                        }
                                        disabled={
                                            updating
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="department-save-button"
                                        disabled={
                                            updating
                                        }
                                    >
                                        {updating
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

export default Departments;