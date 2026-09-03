import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Prescriptions.css";

const API_BASE_URL =
  "https://hospital-management-system-nvjt.onrender.com/api";

const PRESCRIPTIONS_URL =
  `${API_BASE_URL}/prescriptions`;

const PATIENTS_URL =
  `${API_BASE_URL}/patients`;

const DOCTORS_URL =
  `${API_BASE_URL}/doctors`;

const APPOINTMENTS_URL =
  `${API_BASE_URL}/appointments`;

const emptyMedicine = {
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

const emptyForm = {
  patient: "",
  doctor: "",
  appointment: "",
  prescriptionDate: "",
  diagnosis: "",
  medications: [emptyMedicine],
  notes: "",
  status: "Active",
};

function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

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

  const [selectedPrescription, setSelectedPrescription] =
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
      axios.get(PRESCRIPTIONS_URL),
      axios.get(PATIENTS_URL),
      axios.get(DOCTORS_URL),
      axios.get(APPOINTMENTS_URL),
    ]);

    if (results[0].status === "fulfilled") {
      setPrescriptions(
        results[0].value.data?.prescriptions || []
      );
    } else {
      setPrescriptions([]);
      setError(
        results[0].reason?.response?.data?.message ||
          "Unable to load prescriptions."
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

  const filteredPrescriptions = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return prescriptions.filter((item) => {
      const patientName =
        item.patient?.fullName || "";

      const doctorName =
        item.doctor?.fullName || "";

      const diagnosis =
        item.diagnosis || "";

      const matchesSearch =
        !searchText ||
        patientName
          .toLowerCase()
          .includes(searchText) ||
        doctorName
          .toLowerCase()
          .includes(searchText) ||
        diagnosis
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    prescriptions,
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

  function openAddModal() {
    setFormData({
      ...emptyForm,
      prescriptionDate: getToday(),
      medications: [
        { ...emptyMedicine },
      ],
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

  function openViewModal(prescription) {
    setSelectedPrescription(prescription);
    setShowViewModal(true);
  }

  function closeViewModal() {
    setSelectedPrescription(null);
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
    setFormData((previous) => ({
      ...previous,
      doctor: event.target.value,
      appointment: "",
    }));
  }

  function updateMedicine(
    index,
    field,
    value
  ) {
    setFormData((previous) => {
      const updated = [
        ...previous.medications,
      ];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...previous,
        medications: updated,
      };
    });
  }

  function addMedicine() {
    setFormData((previous) => ({
      ...previous,
      medications: [
        ...previous.medications,
        { ...emptyMedicine },
      ],
    }));
  }

  function removeMedicine(index) {
    setFormData((previous) => ({
      ...previous,
      medications:
        previous.medications.filter(
          (_, medicineIndex) =>
            medicineIndex !== index
        ),
    }));
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

    const validMedicines =
      formData.medications.filter(
        (medicine) =>
          medicine.medicineName.trim() &&
          medicine.dosage.trim() &&
          medicine.frequency.trim() &&
          medicine.duration.trim()
      );

    if (
      !formData.patient ||
      !formData.doctor ||
      !formData.prescriptionDate ||
      validMedicines.length === 0
    ) {
      alert(
        "Patient, doctor, prescription date and at least one complete medicine are required."
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
        prescriptionDate:
          formData.prescriptionDate,
        diagnosis:
          formData.diagnosis.trim(),
        medications: validMedicines.map(
          (medicine) => ({
            medicineName:
              medicine.medicineName.trim(),
            dosage: medicine.dosage.trim(),
            frequency:
              medicine.frequency.trim(),
            duration:
              medicine.duration.trim(),
            instructions:
              medicine.instructions.trim(),
          })
        ),
        notes: formData.notes.trim(),
        status: formData.status,
      };

      await axios.post(
        PRESCRIPTIONS_URL,
        payload
      );

      alert(
        "Prescription added successfully."
      );

      closeModal();
      await loadData();
    } catch (error) {
      console.error(
        "Add prescription error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to add prescription."
      );
    } finally {
      setSaving(false);
    }
  }

  const totalPrescriptions =
    prescriptions.length;

  const activePrescriptions =
    prescriptions.filter(
      (item) => item.status === "Active"
    ).length;

  const completedPrescriptions =
    prescriptions.filter(
      (item) => item.status === "Completed"
    ).length;

  return (
    <div className="prescriptions-page">
      <div className="prescriptions-header">
        <div>
          <h1>Prescriptions</h1>
          <p>
            Manage patient prescriptions and
            medication records.
          </p>
        </div>

        <button
          type="button"
          className="add-prescription-button"
          onClick={openAddModal}
        >
          + Add Prescription
        </button>
      </div>

      <div className="prescription-summary">
        <div className="prescription-summary-card">
          <span>Total Prescriptions</span>
          <strong>
            {totalPrescriptions}
          </strong>
        </div>

        <div className="prescription-summary-card">
          <span>Active</span>
          <strong>
            {activePrescriptions}
          </strong>
        </div>

        <div className="prescription-summary-card">
          <span>Completed</span>
          <strong>
            {completedPrescriptions}
          </strong>
        </div>
      </div>

      <div className="prescriptions-toolbar">
        <input
          type="text"
          placeholder="Search patient, doctor or diagnosis..."
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
          <option value="Active">
            Active
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
        <div className="prescription-error">
          {error}
        </div>
      )}

      <div className="prescriptions-table-card">
        {loading ? (
          <div className="prescription-empty">
            Loading prescriptions...
          </div>
        ) : filteredPrescriptions.length ===
          0 ? (
          <div className="prescription-empty">
            <strong>
              No prescriptions found
            </strong>
            <span>
              Add a prescription to see real
              database records here.
            </span>
          </div>
        ) : (
          <div className="prescriptions-table-wrapper">
            <table className="prescriptions-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Diagnosis</th>
                  <th>Medicines</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPrescriptions.map(
                  (prescription) => (
                    <tr
                      key={prescription._id}
                    >
                      <td>
                        <strong>
                          {prescription.patient
                            ?.fullName ||
                            "Unknown Patient"}
                        </strong>
                      </td>

                      <td>
                        {prescription.doctor
                          ?.fullName ||
                          "Unknown Doctor"}
                      </td>

                      <td>
                        {prescription.diagnosis ||
                          "-"}
                      </td>

                      <td>
                        <span className="medicine-count">
                          {prescription
                            .medications
                            ?.length || 0}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          prescription.prescriptionDate
                        )}
                      </td>

                      <td>
                        <span
                          className={`prescription-status ${prescription.status?.toLowerCase()}`}
                        >
                          {prescription.status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="view-prescription-button"
                          onClick={() =>
                            openViewModal(
                              prescription
                            )
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
        <div className="prescription-modal-overlay">
          <div className="prescription-modal">
            <div className="prescription-modal-header">
              <div>
                <h2>
                  Add Prescription
                </h2>
                <p>
                  Create a patient medication
                  prescription.
                </p>
              </div>

              <button
                type="button"
                className="prescription-close-button"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form
              className="prescription-form"
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
                    Prescription Date *
                  </label>

                  <input
                    type="date"
                    name="prescriptionDate"
                    value={
                      formData.prescriptionDate
                    }
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Diagnosis
                </label>

                <input
                  type="text"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  placeholder="Enter diagnosis"
                />
              </div>

              <div className="medicines-heading">
                <div>
                  <h3>
                    Medicines
                  </h3>

                  <span>
                    {formData.medications.length}{" "}
                    medicine
                    {formData.medications.length !==
                    1
                      ? "s"
                      : ""}
                  </span>
                </div>

                <button
                  type="button"
                  className="add-medicine-button"
                  onClick={addMedicine}
                >
                  + Add Medicine
                </button>
              </div>

              <div className="medicine-list">
                {formData.medications.map(
                  (medicine, index) => (
                    <div
                      className="medicine-card"
                      key={index}
                    >
                      <div className="medicine-card-header">
                        <strong>
                          Medicine {index + 1}
                        </strong>

                        {formData.medications
                          .length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeMedicine(
                                index
                              )
                            }
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="medicine-grid">
                        <div className="form-group">
                          <label>
                            Medicine Name *
                          </label>

                          <input
                            value={
                              medicine.medicineName
                            }
                            onChange={(event) =>
                              updateMedicine(
                                index,
                                "medicineName",
                                event.target.value
                              )
                            }
                            placeholder="Paracetamol"
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Dosage *
                          </label>

                          <input
                            value={
                              medicine.dosage
                            }
                            onChange={(event) =>
                              updateMedicine(
                                index,
                                "dosage",
                                event.target.value
                              )
                            }
                            placeholder="500 mg"
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Frequency *
                          </label>

                          <input
                            value={
                              medicine.frequency
                            }
                            onChange={(event) =>
                              updateMedicine(
                                index,
                                "frequency",
                                event.target.value
                              )
                            }
                            placeholder="Twice daily"
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Duration *
                          </label>

                          <input
                            value={
                              medicine.duration
                            }
                            onChange={(event) =>
                              updateMedicine(
                                index,
                                "duration",
                                event.target.value
                              )
                            }
                            placeholder="5 days"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>
                          Instructions
                        </label>

                        <input
                          value={
                            medicine.instructions
                          }
                          onChange={(event) =>
                            updateMedicine(
                              index,
                              "instructions",
                              event.target.value
                            )
                          }
                          placeholder="After food"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="form-group">
                <label>
                  Additional Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Additional instructions or notes..."
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
                  <option value="Active">
                    Active
                  </option>
                  <option value="Completed">
                    Completed
                  </option>
                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>
              </div>

              <div className="prescription-modal-footer">
                <button
                  type="button"
                  className="cancel-prescription-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-prescription-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}

      {showViewModal &&
        selectedPrescription && (
          <div className="prescription-modal-overlay">
            <div className="prescription-modal view-prescription-modal">
              <div className="prescription-modal-header">
                <div>
                  <h2>
                    Prescription Details
                  </h2>

                  <p>
                    Patient medication
                    information.
                  </p>
                </div>

                <button
                  type="button"
                  className="prescription-close-button"
                  onClick={
                    closeViewModal
                  }
                >
                  ×
                </button>
              </div>

              <div className="prescription-details">
                <div className="prescription-detail-grid">
                  <div>
                    <span>
                      Patient
                    </span>
                    <strong>
                      {selectedPrescription
                        .patient
                        ?.fullName || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Doctor
                    </span>
                    <strong>
                      {selectedPrescription
                        .doctor
                        ?.fullName || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Department
                    </span>
                    <strong>
                      {selectedPrescription
                        .doctor
                        ?.department || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Date
                    </span>
                    <strong>
                      {formatDate(
                        selectedPrescription.prescriptionDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Diagnosis
                    </span>
                    <strong>
                      {selectedPrescription
                        .diagnosis || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Status
                    </span>
                    <strong>
                      {
                        selectedPrescription.status
                      }
                    </strong>
                  </div>
                </div>

                <div className="prescription-view-section">
                  <h3>
                    Medicines
                  </h3>

                  <div className="medicine-view-list">
                    {selectedPrescription.medications?.map(
                      (medicine, index) => (
                        <div
                          className="medicine-view-card"
                          key={
                            medicine._id ||
                            index
                          }
                        >
                          <div>
                            <strong>
                              {
                                medicine.medicineName
                              }
                            </strong>

                            <span>
                              {
                                medicine.dosage
                              }{" "}
                              •{" "}
                              {
                                medicine.frequency
                              }{" "}
                              •{" "}
                              {
                                medicine.duration
                              }
                            </span>
                          </div>

                          {medicine.instructions && (
                            <small>
                              {
                                medicine.instructions
                              }
                            </small>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="prescription-view-section">
                  <h3>
                    Notes
                  </h3>

                  <p>
                    {selectedPrescription
                      .notes || "-"}
                  </p>
                </div>
              </div>

              <div className="prescription-modal-footer">
                <button
                  type="button"
                  className="cancel-prescription-button"
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

export default Prescriptions;