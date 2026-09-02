import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Departments.css";

const API_URL =
  "https://hospital-management-system-nvjt.onrender.com/api/departments";

const DOCTORS_URL =
  "https://hospital-management-system-nvjt.onrender.com/api/doctors";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  location: "",
  headDoctor: "",
  doctors: [],
  status: "Active",
};

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      setDepartments(response.data.departments || []);
    } catch (err) {
      console.error("Fetch departments error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load departments"
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchDoctors = async () => {
    try {
      const response = await axios.get(DOCTORS_URL);

      setDoctors(response.data.doctors || []);
    } catch (err) {
      console.error("Fetch doctors error:", err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, []);
  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const matchesSearch =
        department.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        department.code
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        department.location
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        department.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);
  const totalDepartments = departments.length;

  const activeDepartments = departments.filter(
    (department) => department.status === "Active"
  ).length;

  const inactiveDepartments = departments.filter(
    (department) => department.status === "Inactive"
  ).length;

  const totalAssignedDoctors = departments.reduce(
    (total, department) =>
      total + (department.doctors?.length || 0),
    0
  );
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleDoctorToggle = (doctorId) => {
    setFormData((prev) => {
      const alreadySelected =
        prev.doctors.includes(doctorId);

      let updatedDoctors;

      if (alreadySelected) {
        updatedDoctors = prev.doctors.filter(
          (id) => id !== doctorId
        );
      } else {
        updatedDoctors = [
          ...prev.doctors,
          doctorId,
        ];
      }

      // If the head doctor is removed,
      // clear the head doctor as well.
      const updatedHeadDoctor =
        prev.headDoctor &&
        !updatedDoctors.includes(prev.headDoctor)
          ? ""
          : prev.headDoctor;

      return {
        ...prev,
        doctors: updatedDoctors,
        headDoctor: updatedHeadDoctor,
      };
    });
  };
  const handleHeadDoctorChange = (event) => {
    const doctorId = event.target.value;

    setFormData((prev) => ({
      ...prev,
      headDoctor: doctorId,

      // Automatically add head doctor
      // to assigned doctors.
      doctors:
        doctorId && !prev.doctors.includes(doctorId)
          ? [...prev.doctors, doctorId]
          : prev.doctors,
    }));
  };
  const openAddModal = () => {
    setFormData(emptyForm);
    setShowAddModal(true);
  };
  const openEditModal = (department) => {
    setSelectedDepartment(department);

    setFormData({
      name: department.name || "",
      code: department.code || "",
      description: department.description || "",
      location: department.location || "",
      headDoctor: department.headDoctor?._id || "",
      doctors:
        department.doctors?.map((doctor) => doctor._id) || [],
      status: department.status || "Active",
    });

    setShowEditModal(true);
  };
  const openViewModal = (department) => {
    setSelectedDepartment(department);
    setShowViewModal(true);
  };
  const closeModals = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedDepartment(null);
    setFormData(emptyForm);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter department name");
      return;
    }

    if (!formData.code.trim()) {
      alert("Please enter department code");
      return;
    }

    if (formData.headDoctor && !formData.doctors.includes(formData.headDoctor)) {
      alert("Head doctor must also be selected as a department doctor");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        headDoctor: formData.headDoctor || null,
        doctors: formData.doctors,
        status: formData.status,
      };

      if (showEditModal && selectedDepartment) {
        await axios.put(
          `${API_URL}/${selectedDepartment._id}`,
          payload
        );

        alert("Department updated successfully");
      } else {
        await axios.post(API_URL, payload);

        alert("Department created successfully");
      }

      closeModals();
      fetchDepartments();
      fetchDoctors();
    } catch (err) {
      console.error("Save department error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to save department"
      );
    } finally {
      setSaving(false);
    }
  };
  const handleRefresh = () => {
    fetchDepartments();
    fetchDoctors();
  };

  return (
    <div className="departments-page">
      {/* Header */}
      <div className="departments-header">
        <div>
          <h1>Departments</h1>
          <p>
            Manage hospital departments, department heads
            and assigned doctors.
          </p>
        </div>

        <div className="departments-header-actions">
          <button
            type="button"
            className="refresh-button"
            onClick={handleRefresh}
          >
            ↻ Refresh
          </button>

          <button
            type="button"
            className="add-button"
            onClick={openAddModal}
          >
            + Add Department
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="department-summary">
        <div className="summary-card">
          <span>Total Departments</span>
          <strong>{totalDepartments}</strong>
          <small>Registered departments</small>
        </div>

        <div className="summary-card">
          <span>Active Departments</span>
          <strong>{activeDepartments}</strong>
          <small>Currently active</small>
        </div>

        <div className="summary-card">
          <span>Inactive Departments</span>
          <strong>{inactiveDepartments}</strong>
          <small>Temporarily unavailable</small>
        </div>

        <div className="summary-card">
          <span>Doctors Assigned</span>
          <strong>{totalAssignedDoctors}</strong>
          <small>Across departments</small>
        </div>
      </div>

      {/* Filters */}
      <div className="department-filters">
        <input
          type="text"
          placeholder="Search department, code or location..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setStatusFilter("All");
          }}
        >
          Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="department-error">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="department-table-card">
        {loading ? (
          <div className="department-loading">
            Loading departments...
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="department-empty">
            No departments found.
          </div>
        ) : (
          <div className="department-table-wrapper">
            <table className="department-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Code</th>
                  <th>Location</th>
                  <th>Head Doctor</th>
                  <th>Doctors</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredDepartments.map((department) => (
                  <tr key={department._id}>
                    <td>
                      <div className="department-name-cell">
                        <div className="department-icon">
                          ▦
                        </div>

                        <div>
                          <strong>{department.name}</strong>

                          <span>
                            {department.description ||
                              "No description"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="department-code">
                        {department.code}
                      </span>
                    </td>

                    <td>
                      {department.location || "-"}
                    </td>

                    <td>
                      {department.headDoctor?.fullName ||
                        "Not assigned"}
                    </td>

                    <td>
                      <span className="doctor-count">
                        {department.doctors?.length || 0}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`department-status ${department.status?.toLowerCase()}`}
                      >
                        {department.status}
                      </span>
                    </td>

                    <td>
                      <div className="department-actions">
                        <button
                          type="button"
                          onClick={() =>
                            openViewModal(department)
                          }
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(department)
                          }
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {(showAddModal || showEditModal) && (
        <div className="department-modal-overlay">
          <div className="department-modal">
            <div className="department-modal-header">
              <div>
                <h2>
                  {showEditModal
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p>
                  {showEditModal
                    ? "Update department information and assigned doctors."
                    : "Create a new hospital department."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModals}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="department-form"
            >
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Department Name *
                  </label>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Example: Cardiology"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Department Code *
                  </label>

                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Example: CARD"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the department..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location / Floor</label>

                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Example: Block A - 2nd Floor"
                  />
                </div>

                <div className="form-group">
                  <label>Department Head</label>

                  <select
                    value={formData.headDoctor}
                    onChange={handleHeadDoctorChange}
                  >
                    <option value="">
                      Not assigned
                    </option>

                    {doctors.map((doctor) => (
                      <option
                        key={doctor._id}
                        value={doctor._id}
                      >
                        {doctor.fullName} -{" "}
                        {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* MULTIPLE DOCTORS */}
              <div className="form-group">
                <label>
                  Doctors in Department
                  <span className="field-count">
                    {formData.doctors.length} selected
                  </span>
                </label>

                <div className="doctor-selection-box">
                  {doctors.length === 0 ? (
                    <p className="no-doctors-message">
                      No doctors available.
                    </p>
                  ) : (
                    doctors.map((doctor) => {
                      const isSelected =
                        formData.doctors.includes(
                          doctor._id
                        );

                      const isHead =
                        formData.headDoctor ===
                        doctor._id;

                      return (
                        <label
                          key={doctor._id}
                          className={`doctor-selection-item ${
                            isSelected
                              ? "selected"
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleDoctorToggle(
                                doctor._id
                              )
                            }
                          />

                          <div className="doctor-selection-info">
                            <strong>
                              {doctor.fullName}
                            </strong>

                            <span>
                              {doctor.specialization ||
                                "Specialist"}{" "}
                              •{" "}
                              {doctor.department ||
                                "No department"}
                            </span>
                          </div>

                          {isHead && (
                            <span className="head-badge">
                              Head
                            </span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="doctor-help-text">
                Select all doctors who belong to this
                department. The Department Head will
                automatically be included in this list.
              </div>

              <div className="form-group status-group">
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <div className="department-modal-footer">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModals}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : showEditModal
                    ? "Update Department"
                    : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showViewModal && selectedDepartment && (
        <div className="department-modal-overlay">
          <div className="department-modal view-modal">
            <div className="department-modal-header">
              <div>
                <h2>
                  {selectedDepartment.name}
                </h2>

                <p>
                  Department details and assigned doctors
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModals}
              >
                ×
              </button>
            </div>

            <div className="department-details">
              <div className="detail-grid">
                <div>
                  <span>Department Code</span>
                  <strong>
                    {selectedDepartment.code}
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    {selectedDepartment.location ||
                      "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {selectedDepartment.status}
                  </strong>
                </div>

                <div>
                  <span>Total Doctors</span>
                  <strong>
                    {selectedDepartment.doctors
                      ?.length || 0}
                  </strong>
                </div>
              </div>

              <div className="view-section">
                <h3>Department Head</h3>

                <div className="head-doctor-card">
                  <strong>
                    {selectedDepartment.headDoctor
                      ?.fullName ||
                      "Not assigned"}
                  </strong>

                  {selectedDepartment.headDoctor && (
                    <span>
                      {
                        selectedDepartment.headDoctor
                          .specialization
                      }
                    </span>
                  )}
                </div>
              </div>

              <div className="view-section">
                <h3>
                  Doctors in Department (
                  {selectedDepartment.doctors
                    ?.length || 0}
                  )
                </h3>

                {selectedDepartment.doctors?.length >
                0 ? (
                  <div className="assigned-doctors-list">
                    {selectedDepartment.doctors.map(
                      (doctor) => (
                        <div
                          className="assigned-doctor-card"
                          key={doctor._id}
                        >
                          <div>
                            <strong>
                              {doctor.fullName}
                            </strong>

                            <span>
                              {doctor.specialization ||
                                "Specialist"}
                            </span>
                          </div>

                          {selectedDepartment.headDoctor
                            ?._id === doctor._id && (
                            <span className="head-badge">
                              Head
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="no-assigned-doctors">
                    No doctors assigned to this
                    department.
                  </p>
                )}
              </div>

              {selectedDepartment.description && (
                <div className="view-section">
                  <h3>Description</h3>

                  <p className="description-text">
                    {selectedDepartment.description}
                  </p>
                </div>
              )}
            </div>

            <div className="department-modal-footer">
              <button
                type="button"
                className="cancel-button"
                onClick={closeModals}
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

export default Departments;