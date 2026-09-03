import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./MedicalRecords.css";

const API_BASE_URL =
  "https://hospital-management-system-nvjt.onrender.com/api";

const RECORDS_URL = `${API_BASE_URL}/medical-records`;
const PATIENTS_URL = `${API_BASE_URL}/patients`;
const DOCTORS_URL = `${API_BASE_URL}/doctors`;
const APPOINTMENTS_URL = `${API_BASE_URL}/appointments`;

const emptyForm = {
  patient: "",
  doctor: "",
  appointment: "",
  visitDate: "",
  symptoms: "",
  diagnosis: "",
  treatmentPlan: "",
  notes: "",
  bloodPressure: "",
  pulseRate: "",
  temperature: "",
  oxygenLevel: "",
  weight: "",
  followUpDate: "",
  status: "Open",
};

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      axios.get(RECORDS_URL),
      axios.get(PATIENTS_URL),
      axios.get(DOCTORS_URL),
      axios.get(APPOINTMENTS_URL),
    ]);

    const recordResult = results[0];
    const patientResult = results[1];
    const doctorResult = results[2];
    const appointmentResult = results[3];

    if (recordResult.status === "fulfilled") {
      setRecords(
        recordResult.value.data?.records || []
      );
    } else {
      setRecords([]);
      setError(
        recordResult.reason?.response?.data?.message ||
          "Unable to load medical records."
      );
    }

    if (patientResult.status === "fulfilled") {
      setPatients(
        patientResult.value.data?.patients || []
      );
    }

    if (doctorResult.status === "fulfilled") {
      setDoctors(
        doctorResult.value.data?.doctors || []
      );
    }

    if (appointmentResult.status === "fulfilled") {
      setAppointments(
        appointmentResult.value.data?.appointments || []
      );
    }

    setLoading(false);
  }

  const filteredRecords = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return records;
    }

    return records.filter((record) => {
      const patientName =
        record.patient?.fullName || "";

      const doctorName =
        record.doctor?.fullName || "";

      return (
        patientName.toLowerCase().includes(text) ||
        doctorName.toLowerCase().includes(text) ||
        record.diagnosis
          ?.toLowerCase()
          .includes(text) ||
        record.treatmentPlan
          ?.toLowerCase()
          .includes(text)
      );
    });
  }, [records, search]);

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

  function formatDateForInput(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().split("T")[0];
  }

  function openAddModal() {
    setFormData({
      ...emptyForm,
      visitDate: formatDateForInput(new Date()),
    });

    setSelectedRecord(null);
    setShowAddModal(true);
  }

  function closeAddModal() {
    if (saving) {
      return;
    }

    setShowAddModal(false);
    setFormData(emptyForm);
  }

  function openViewModal(record) {
    setSelectedRecord(record);
    setShowViewModal(true);
  }

  function closeViewModal() {
    setSelectedRecord(null);
    setShowViewModal(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleDoctorChange(event) {
    const doctorId = event.target.value;

    setFormData((previous) => ({
      ...previous,
      doctor: doctorId,
      appointment: "",
    }));
  }

  const availableAppointments = useMemo(() => {
    if (!formData.patient || !formData.doctor) {
      return [];
    }

    return appointments.filter((appointment) => {
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
    });
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
      !formData.visitDate ||
      !formData.diagnosis.trim()
    ) {
      alert(
        "Patient, doctor, visit date and diagnosis are required."
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
        visitDate: formData.visitDate,
        symptoms: formData.symptoms.trim(),
        diagnosis: formData.diagnosis.trim(),
        treatmentPlan:
          formData.treatmentPlan.trim(),
        notes: formData.notes.trim(),
        bloodPressure:
          formData.bloodPressure.trim(),
        pulseRate: formData.pulseRate,
        temperature: formData.temperature,
        oxygenLevel: formData.oxygenLevel,
        weight: formData.weight,
        followUpDate:
          formData.followUpDate || null,
        status: formData.status,
      };

      const response = await axios.post(
        RECORDS_URL,
        payload
      );

      console.log(
        "Medical record created:",
        response.data
      );

      alert("Medical record added successfully.");

      closeAddModal();
      await loadData();
    } catch (err) {
      console.error(
        "Add medical record error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to add medical record."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="medical-records-page">
      <div className="medical-records-header">
        <div>
          <h1>Medical Records</h1>
          <p>
            Manage patient medical history and treatment
            records.
          </p>
        </div>

        <button
          type="button"
          className="add-record-button"
          onClick={openAddModal}
        >
          + Add Record
        </button>
      </div>

      <div className="medical-records-toolbar">
        <input
          type="text"
          placeholder="Search patient or diagnosis..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <button
          type="button"
          className="refresh-records-button"
          onClick={loadData}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="medical-records-error">
          {error}
        </div>
      )}

      <div className="medical-records-table-card">
        {loading ? (
          <div className="medical-records-empty">
            Loading medical records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="medical-records-empty">
            <strong>No medical records found</strong>
            <span>
              Add a medical record to see real data here.
            </span>
          </div>
        ) : (
          <div className="medical-records-table-wrapper">
            <table className="medical-records-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Diagnosis</th>
                  <th>Treatment</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <strong>
                        {record.patient?.fullName ||
                          "Unknown Patient"}
                      </strong>
                    </td>

                    <td>
                      {record.doctor?.fullName ||
                        "Unknown Doctor"}
                    </td>

                    <td>
                      {record.diagnosis || "-"}
                    </td>

                    <td>
                      {record.treatmentPlan || "-"}
                    </td>

                    <td>
                      {formatDate(record.visitDate)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="view-record-button"
                        onClick={() =>
                          openViewModal(record)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD RECORD MODAL */}

      {showAddModal && (
        <div className="medical-modal-overlay">
          <div className="medical-modal">
            <div className="medical-modal-header">
              <div>
                <h2>Add Medical Record</h2>
                <p>
                  Create a new patient medical record.
                </p>
              </div>

              <button
                type="button"
                className="medical-modal-close"
                onClick={closeAddModal}
              >
                ×
              </button>
            </div>

            <form
              className="medical-record-form"
              onSubmit={handleSubmit}
            >
              <div className="form-row">
                <div className="form-group">
                  <label>Patient *</label>

                  <select
                    name="patient"
                    value={formData.patient}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select patient
                    </option>

                    {patients.map((patient) => (
                      <option
                        key={patient._id}
                        value={patient._id}
                      >
                        {patient.fullName} -{" "}
                        {patient.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Doctor *</label>

                  <select
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleDoctorChange}
                    required
                  >
                    <option value="">
                      Select doctor
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

              <div className="form-row">
                <div className="form-group">
                  <label>Appointment</label>

                  <select
                    name="appointment"
                    value={formData.appointment}
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
                  <label>Visit Date *</label>

                  <input
                    type="date"
                    name="visitDate"
                    value={formData.visitDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Symptoms</label>

                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Enter patient symptoms..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Diagnosis *</label>

                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  placeholder="Enter diagnosis..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Treatment Plan</label>

                <textarea
                  name="treatmentPlan"
                  value={formData.treatmentPlan}
                  onChange={handleChange}
                  placeholder="Enter treatment plan..."
                  rows="3"
                />
              </div>

              <div className="vitals-title">
                Patient Vitals
              </div>

              <div className="vitals-grid">
                <div className="form-group">
                  <label>Blood Pressure</label>
                  <input
                    name="bloodPressure"
                    value={formData.bloodPressure}
                    onChange={handleChange}
                    placeholder="120/80"
                  />
                </div>

                <div className="form-group">
                  <label>Pulse Rate</label>
                  <input
                    type="number"
                    name="pulseRate"
                    value={formData.pulseRate}
                    onChange={handleChange}
                    placeholder="72"
                  />
                </div>

                <div className="form-group">
                  <label>Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    placeholder="98.6"
                  />
                </div>

                <div className="form-group">
                  <label>Oxygen Level (%)</label>
                  <input
                    type="number"
                    name="oxygenLevel"
                    value={formData.oxygenLevel}
                    onChange={handleChange}
                    placeholder="98"
                  />
                </div>

                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="65"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Follow-up Date</label>

                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Open">
                      Open
                    </option>
                    <option value="Closed">
                      Closed
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes..."
                  rows="3"
                />
              </div>

              <div className="medical-modal-footer">
                <button
                  type="button"
                  className="cancel-record-button"
                  onClick={closeAddModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-record-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}

      {showViewModal && selectedRecord && (
        <div className="medical-modal-overlay">
          <div className="medical-modal view-medical-modal">
            <div className="medical-modal-header">
              <div>
                <h2>Medical Record</h2>
                <p>
                  Patient medical history and treatment
                  details.
                </p>
              </div>

              <button
                type="button"
                className="medical-modal-close"
                onClick={closeViewModal}
              >
                ×
              </button>
            </div>

            <div className="record-details">
              <div className="record-detail-grid">
                <div>
                  <span>Patient</span>
                  <strong>
                    {selectedRecord.patient
                      ?.fullName || "-"}
                  </strong>
                </div>

                <div>
                  <span>Doctor</span>
                  <strong>
                    {selectedRecord.doctor
                      ?.fullName || "-"}
                  </strong>
                </div>

                <div>
                  <span>Department</span>
                  <strong>
                    {selectedRecord.doctor
                      ?.department || "-"}
                  </strong>
                </div>

                <div>
                  <span>Visit Date</span>
                  <strong>
                    {formatDate(
                      selectedRecord.visitDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>Diagnosis</span>
                  <strong>
                    {selectedRecord.diagnosis ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {selectedRecord.status || "-"}
                  </strong>
                </div>
              </div>

              <div className="record-section">
                <h3>Symptoms</h3>
                <p>
                  {selectedRecord.symptoms || "-"}
                </p>
              </div>

              <div className="record-section">
                <h3>Treatment Plan</h3>
                <p>
                  {selectedRecord.treatmentPlan ||
                    "-"}
                </p>
              </div>

              <div className="vitals-display">
                <h3>Patient Vitals</h3>

                <div className="record-detail-grid">
                  <div>
                    <span>Blood Pressure</span>
                    <strong>
                      {selectedRecord.bloodPressure ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Pulse Rate</span>
                    <strong>
                      {selectedRecord.pulseRate
                        ? `${selectedRecord.pulseRate} bpm`
                        : "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Temperature</span>
                    <strong>
                      {selectedRecord.temperature
                        ? `${selectedRecord.temperature} °F`
                        : "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Oxygen Level</span>
                    <strong>
                      {selectedRecord.oxygenLevel
                        ? `${selectedRecord.oxygenLevel}%`
                        : "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Weight</span>
                    <strong>
                      {selectedRecord.weight
                        ? `${selectedRecord.weight} kg`
                        : "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Follow-up</span>
                    <strong>
                      {formatDate(
                        selectedRecord.followUpDate
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="record-section">
                <h3>Notes</h3>
                <p>
                  {selectedRecord.notes || "-"}
                </p>
              </div>
            </div>

            <div className="medical-modal-footer">
              <button
                type="button"
                className="cancel-record-button"
                onClick={closeViewModal}
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

export default MedicalRecords;