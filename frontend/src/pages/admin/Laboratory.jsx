import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Laboratory.css";

const API_BASE_URL =
  "https://hospital-management-system-nvjt.onrender.com/api";

const LABORATORY_URL =
  `${API_BASE_URL}/laboratory`;

const PATIENTS_URL =
  `${API_BASE_URL}/patients`;

const DOCTORS_URL =
  `${API_BASE_URL}/doctors`;

const APPOINTMENTS_URL =
  `${API_BASE_URL}/appointments`;

const emptyForm = {
  patient: "",
  doctor: "",
  appointment: "",
  testName: "",
  category: "",
  testDate: "",
  result: "",
  unit: "",
  referenceRange: "",
  notes: "",
  status: "Ordered",
};

function Laboratory() {
  const [laboratories, setLaboratories] =
    useState([]);

  const [patients, setPatients] =
    useState([]);

  const [doctors, setDoctors] =
    useState([]);

  const [appointments, setAppointments] =
    useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [selectedLaboratory, setSelectedLaboratory] =
    useState(null);

  const [formData, setFormData] =
    useState(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      axios.get(LABORATORY_URL),
      axios.get(PATIENTS_URL),
      axios.get(DOCTORS_URL),
      axios.get(APPOINTMENTS_URL),
    ]);

    if (results[0].status === "fulfilled") {
      setLaboratories(
        results[0].value.data?.laboratories || []
      );
    } else {
      setLaboratories([]);
      setError(
        results[0].reason?.response?.data?.message ||
          "Unable to load laboratory records."
      );
    }

    if (results[1].status === "fulfilled") {
      setPatients(
        results[1].value.data?.patients || []
      );
    }

    if (results[2].status === "fulfilled") {
      setDoctors(
        results[2].value.data?.doctors || []
      );
    }

    if (results[3].status === "fulfilled") {
      setAppointments(
        results[3].value.data?.appointments || []
      );
    }

    setLoading(false);
  }

  const filteredLaboratories = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return laboratories.filter((item) => {
      const patientName =
        item.patient?.fullName || "";

      const doctorName =
        item.doctor?.fullName || "";

      const testName =
        item.testName || "";

      const category =
        item.category || "";

      const matchesSearch =
        !searchText ||
        patientName.toLowerCase().includes(searchText) ||
        doctorName.toLowerCase().includes(searchText) ||
        testName.toLowerCase().includes(searchText) ||
        category.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    laboratories,
    search,
    statusFilter,
  ]);

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getToday() {
    return new Date()
      .toISOString()
      .split("T")[0];
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleDoctorChange(event) {
    setFormData((previous) => ({
      ...previous,
      doctor: event.target.value,
      appointment: "",
    }));
  }

  function openAddModal() {
    setFormData({
      ...emptyForm,
      testDate: getToday(),
    });

    setShowAddModal(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setShowAddModal(false);
    setFormData(emptyForm);
  }

  function openViewModal(laboratory) {
    setSelectedLaboratory(laboratory);
    setShowViewModal(true);
  }

  function closeViewModal() {
    setSelectedLaboratory(null);
    setShowViewModal(false);
  }

  const availableAppointments = useMemo(() => {
    if (
      !formData.patient ||
      !formData.doctor
    ) {
      return [];
    }

    return appointments.filter(
      (appointment) => {
        const patientId =
          appointment.patient?._id ||
          appointment.patient;

        const doctorId =
          appointment.doctor?._id ||
          appointment.doctor;

        return (
          patientId === formData.patient &&
          doctorId === formData.doctor
        );
      }
    );
  }, [
    appointments,
    formData.patient,
    formData.doctor,
  ]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !formData.patient ||
      !formData.doctor ||
      !formData.testName.trim() ||
      !formData.category.trim() ||
      !formData.testDate
    ) {
      alert(
        "Patient, doctor, test name, category and test date are required."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        patient: formData.patient,
        doctor: formData.doctor,
        appointment:
          formData.appointment || null,
        testName:
          formData.testName.trim(),
        category:
          formData.category.trim(),
        testDate: formData.testDate,
        result:
          formData.result.trim(),
        unit:
          formData.unit.trim(),
        referenceRange:
          formData.referenceRange.trim(),
        notes:
          formData.notes.trim(),
        status: formData.status,
      };

      await axios.post(
        LABORATORY_URL,
        payload
      );

      alert(
        "Laboratory record added successfully."
      );

      closeModal();
      await loadData();
    } catch (error) {
      console.error(
        "Add laboratory record error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to add laboratory record."
      );
    } finally {
      setSaving(false);
    }
  }

  const totalTests =
    laboratories.length;

  const completedTests =
    laboratories.filter(
      (item) => item.status === "Completed"
    ).length;

  const processingTests =
    laboratories.filter(
      (item) =>
        item.status === "Processing" ||
        item.status === "Sample Collected"
    ).length;

  return (
    <div className="laboratory-page">
      <div className="laboratory-header">
        <div>
          <h1>Laboratory</h1>
          <p>
            Manage patient laboratory tests and
            results.
          </p>
        </div>

        <button
          type="button"
          className="add-lab-button"
          onClick={openAddModal}
        >
          + Add Laboratory Record
        </button>
      </div>

      <div className="lab-summary">
        <div className="lab-summary-card">
          <span>Total Tests</span>
          <strong>{totalTests}</strong>
        </div>

        <div className="lab-summary-card">
          <span>Completed</span>
          <strong>
            {completedTests}
          </strong>
        </div>

        <div className="lab-summary-card">
          <span>Processing</span>
          <strong>
            {processingTests}
          </strong>
        </div>
      </div>

      <div className="lab-toolbar">
        <input
          type="text"
          placeholder="Search patient, test or category..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">
            All Status
          </option>
          <option value="Ordered">
            Ordered
          </option>
          <option value="Sample Collected">
            Sample Collected
          </option>
          <option value="Processing">
            Processing
          </option>
          <option value="Completed">
            Completed
          </option>
          <option value="Cancelled">
            Cancelled
          </option>
        </select>

        <button
          type="button"
          onClick={loadData}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="lab-error">
          {error}
        </div>
      )}

      <div className="laboratory-table-card">
        {loading ? (
          <div className="lab-empty">
            Loading laboratory records...
          </div>
        ) : filteredLaboratories.length ===
          0 ? (
          <div className="lab-empty">
            <strong>
              No laboratory records found
            </strong>
            <span>
              Add a laboratory record to see
              real data here.
            </span>
          </div>
        ) : (
          <div className="laboratory-table-wrapper">
            <table className="laboratory-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Test</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Result</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredLaboratories.map(
                  (item) => (
                    <tr key={item._id}>
                      <td>
                        <strong>
                          {item.patient
                            ?.fullName ||
                            "Unknown Patient"}
                        </strong>
                      </td>

                      <td>
                        {item.doctor
                          ?.fullName ||
                          "Unknown Doctor"}
                      </td>

                      <td>
                        {item.testName}
                      </td>

                      <td>
                        {item.category}
                      </td>

                      <td>
                        {formatDate(
                          item.testDate
                        )}
                      </td>

                      <td>
                        {item.result || "-"}
                        {item.unit
                          ? ` ${item.unit}`
                          : ""}
                      </td>

                      <td>
                        <span
                          className={`lab-status ${item.status?.toLowerCase().replaceAll(" ", "-")}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="view-lab-button"
                          onClick={() =>
                            openViewModal(item)
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD MODAL */}

      {showAddModal && (
        <div className="lab-modal-overlay">
          <div className="lab-modal">
            <div className="lab-modal-header">
              <div>
                <h2>
                  Add Laboratory Record
                </h2>

                <p>
                  Add a patient laboratory test
                  and result.
                </p>
              </div>

              <button
                type="button"
                className="lab-close-button"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form
              className="lab-form"
              onSubmit={handleSubmit}
            >
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Patient *
                  </label>

                  <select
                    name="patient"
                    value={formData.patient}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select patient
                    </option>

                    {patients.map(
                      (patient) => (
                        <option
                          key={patient._id}
                          value={patient._id}
                        >
                          {patient.fullName}
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
                    value={formData.doctor}
                    onChange={handleDoctorChange}
                    required
                  >
                    <option value="">
                      Select doctor
                    </option>

                    {doctors.map(
                      (doctor) => (
                        <option
                          key={doctor._id}
                          value={doctor._id}
                        >
                          {doctor.fullName} -{" "}
                          {
                            doctor.specialization
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Appointment
                  </label>

                  <select
                    name="appointment"
                    value={
                      formData.appointment
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      No appointment linked
                    </option>

                    {availableAppointments.map(
                      (appointment) => (
                        <option
                          key={appointment._id}
                          value={appointment._id}
                        >
                          {formatDate(
                            appointment.appointmentDate
                          )}{" "}
                          -{" "}
                          {
                            appointment.appointmentTime
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Test Date *
                  </label>

                  <input
                    type="date"
                    name="testDate"
                    value={formData.testDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Test Name *
                  </label>

                  <input
                    name="testName"
                    value={formData.testName}
                    onChange={handleChange}
                    placeholder="Complete Blood Count"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Category *
                  </label>

                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Hematology"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Result
                  </label>

                  <input
                    name="result"
                    value={formData.result}
                    onChange={handleChange}
                    placeholder="13.2"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Unit
                  </label>

                  <input
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="g/dL"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Reference Range
                </label>

                <input
                  name="referenceRange"
                  value={
                    formData.referenceRange
                  }
                  onChange={handleChange}
                  placeholder="12 - 16 g/dL"
                />
              </div>

              <div className="form-group">
                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Laboratory observations..."
                />
              </div>

              <div className="form-group">
                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Ordered">
                    Ordered
                  </option>

                  <option value="Sample Collected">
                    Sample Collected
                  </option>

                  <option value="Processing">
                    Processing
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>
              </div>

              <div className="lab-modal-footer">
                <button
                  type="button"
                  className="cancel-lab-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-lab-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Laboratory Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}

      {showViewModal &&
        selectedLaboratory && (
          <div className="lab-modal-overlay">
            <div className="lab-modal view-lab-modal">
              <div className="lab-modal-header">
                <div>
                  <h2>
                    Laboratory Result
                  </h2>

                  <p>
                    Patient laboratory test
                    details.
                  </p>
                </div>

                <button
                  type="button"
                  className="lab-close-button"
                  onClick={
                    closeViewModal
                  }
                >
                  ×
                </button>
              </div>

              <div className="lab-details">
                <div className="lab-detail-grid">
                  <div>
                    <span>
                      Patient
                    </span>

                    <strong>
                      {selectedLaboratory
                        .patient?.fullName ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Doctor
                    </span>

                    <strong>
                      {selectedLaboratory
                        .doctor?.fullName ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Department
                    </span>

                    <strong>
                      {selectedLaboratory
                        .doctor
                        ?.department ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Test
                    </span>

                    <strong>
                      {
                        selectedLaboratory.testName
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Category
                    </span>

                    <strong>
                      {
                        selectedLaboratory.category
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Date
                    </span>

                    <strong>
                      {formatDate(
                        selectedLaboratory.testDate
                      )}
                    </strong>
                  </div>
                </div>

                <div className="lab-result-card">
                  <span>
                    Result
                  </span>

                  <strong>
                    {selectedLaboratory.result ||
                      "Pending"}
                  </strong>

                  {selectedLaboratory.unit && (
                    <small>
                      {
                        selectedLaboratory.unit
                      }
                    </small>
                  )}
                </div>

                <div className="lab-info-section">
                  <h3>
                    Reference Range
                  </h3>

                  <p>
                    {
                      selectedLaboratory.referenceRange ||
                      "-"
                    }
                  </p>
                </div>

                <div className="lab-info-section">
                  <h3>
                    Notes
                  </h3>

                  <p>
                    {selectedLaboratory.notes ||
                      "-"}
                  </p>
                </div>
              </div>

              <div className="lab-modal-footer">
                <button
                  type="button"
                  className="cancel-lab-button"
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

export default Laboratory;