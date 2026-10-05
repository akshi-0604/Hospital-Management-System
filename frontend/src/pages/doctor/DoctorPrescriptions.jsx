import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

import "./DoctorPrescriptions.css";

function DoctorPrescriptions() {
  const [doctor, setDoctor] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedPrescription, setSelectedPrescription] =
    useState(null);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  async function loadPrescriptions() {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("Logged-in doctor information was not found.");
        return;
      }

      const loggedInUser = JSON.parse(storedUser);

      const doctorResponse = await api.get("/doctors");

      let doctors = [];

      if (Array.isArray(doctorResponse.data)) {
        doctors = doctorResponse.data;
      } else if (Array.isArray(doctorResponse.data?.doctors)) {
        doctors = doctorResponse.data.doctors;
      } else if (Array.isArray(doctorResponse.data?.data)) {
        doctors = doctorResponse.data.data;
      }

      const loggedInDoctor = doctors.find(
        (item) =>
          String(item.email || "").toLowerCase() ===
          String(loggedInUser.email || "").toLowerCase()
      );

      if (!loggedInDoctor) {
        setError("Doctor profile could not be found.");
        return;
      }

      setDoctor(loggedInDoctor);

      const response = await api.get("/prescriptions");

      let prescriptionData = [];

      if (Array.isArray(response.data)) {
        prescriptionData = response.data;
      } else if (Array.isArray(response.data?.prescriptions)) {
        prescriptionData = response.data.prescriptions;
      } else if (Array.isArray(response.data?.data)) {
        prescriptionData = response.data.data;
      }

      const doctorId = String(
        loggedInDoctor._id || loggedInDoctor.id || ""
      );

      const doctorPrescriptions = prescriptionData.filter(
        (prescription) => {
          const prescriptionDoctor =
            prescription.doctor?._id ||
            prescription.doctor?.id ||
            prescription.doctor;

          return (
            String(prescriptionDoctor || "") === doctorId
          );
        }
      );

      setPrescriptions(doctorPrescriptions);
    } catch (err) {
      console.error("Doctor prescriptions error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load prescriptions."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredPrescriptions = useMemo(() => {
    const value = search.trim().toLowerCase();

    return prescriptions.filter((prescription) => {
      const patientName =
        prescription.patient?.fullName ||
        prescription.patient?.name ||
        prescription.patientName ||
        "";

      const diagnosis =
        prescription.diagnosis || "";

      const department =
        prescription.department?.name ||
        prescription.department ||
        "";

      const status =
        prescription.status || "Active";

      const matchesSearch =
        !value ||
        patientName.toLowerCase().includes(value) ||
        diagnosis.toLowerCase().includes(value) ||
        String(department).toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, search, statusFilter]);

  function formatDate(value) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getMedicineCount(prescription) {
    if (Array.isArray(prescription.medicines)) {
      return prescription.medicines.length;
    }

    return 0;
  }

  return (
    <div className="doctor-prescriptions-page">
      <div className="doctor-prescriptions-header">
        <div>
          <h1>Prescriptions</h1>
          <p>
            View prescriptions created by you.
          </p>
        </div>

        <button
          type="button"
          className="doctor-prescriptions-refresh"
          onClick={loadPrescriptions}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="doctor-prescriptions-error">
          {error}
        </div>
      )}

      <div className="doctor-prescriptions-summary">
        <div>
          <span>Total Prescriptions</span>
          <strong>{prescriptions.length}</strong>
        </div>

        <div>
          <span>Showing</span>
          <strong>
            {filteredPrescriptions.length}
          </strong>
        </div>

        <div>
          <span>Doctor</span>
          <strong>
            {doctor?.fullName || "Doctor"}
          </strong>
        </div>
      </div>

      <div className="doctor-prescriptions-toolbar">
        <input
          type="text"
          placeholder="Search patient, diagnosis, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="doctor-prescriptions-table-card">
        {loading ? (
          <div className="doctor-prescriptions-empty">
            Loading prescriptions...
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="doctor-prescriptions-empty">
            <strong>No prescriptions found</strong>
            <span>
              Prescriptions created by you will appear here.
            </span>
          </div>
        ) : (
          <div className="doctor-prescriptions-table-wrapper">
            <table className="doctor-prescriptions-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Department</th>
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
                    <tr key={prescription._id}>
                      <td>
                        <strong>
                          {prescription.patient?.fullName ||
                            prescription.patient?.name ||
                            prescription.patientName ||
                            "Unknown Patient"}
                        </strong>
                      </td>

                      <td>
                        {prescription.department?.name ||
                          prescription.department ||
                          "Not available"}
                      </td>

                      <td>
                        {prescription.diagnosis ||
                          "Not available"}
                      </td>

                      <td>
                        {getMedicineCount(prescription)}
                      </td>

                      <td>
                        {formatDate(
                          prescription.prescriptionDate ||
                            prescription.date ||
                            prescription.createdAt
                        )}
                      </td>

                      <td>
                        <span className="doctor-prescription-status">
                          {prescription.status || "Active"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="doctor-prescription-view-button"
                          onClick={() =>
                            setSelectedPrescription(
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

      {selectedPrescription && (
        <div className="doctor-prescription-modal-overlay">
          <div className="doctor-prescription-modal">
            <div className="doctor-prescription-modal-header">
              <div>
                <h2>Prescription</h2>
                <p>
                  {selectedPrescription.patient?.fullName ||
                    selectedPrescription.patient?.name ||
                    selectedPrescription.patientName ||
                    "Patient"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPrescription(null)
                }
              >
                ×
              </button>
            </div>

            <div className="doctor-prescription-details">
              <div>
                <span>Patient</span>
                <strong>
                  {selectedPrescription.patient?.fullName ||
                    selectedPrescription.patient?.name ||
                    selectedPrescription.patientName ||
                    "Unknown"}
                </strong>
              </div>

              <div>
                <span>Date</span>
                <strong>
                  {formatDate(
                    selectedPrescription.prescriptionDate ||
                      selectedPrescription.date ||
                      selectedPrescription.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>Diagnosis</span>
                <strong>
                  {selectedPrescription.diagnosis ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedPrescription.status ||
                    "Active"}
                </strong>
              </div>

              <div className="doctor-prescription-full">
                <span>Medicines</span>

                {Array.isArray(
                  selectedPrescription.medicines
                ) &&
                selectedPrescription.medicines.length > 0 ? (
                  <div className="doctor-medicine-list">
                    {selectedPrescription.medicines.map(
                      (medicine, index) => (
                        <div
                          className="doctor-medicine-item"
                          key={index}
                        >
                          <strong>
                            {medicine.name ||
                              medicine.medicine ||
                              "Medicine"}
                          </strong>

                          <span>
                            Dosage:{" "}
                            {medicine.dosage ||
                              "Not specified"}
                          </span>

                          <span>
                            Frequency:{" "}
                            {medicine.frequency ||
                              "Not specified"}
                          </span>

                          <span>
                            Duration:{" "}
                            {medicine.duration ||
                              "Not specified"}
                          </span>

                          <span>
                            Instructions:{" "}
                            {medicine.instructions ||
                              "Not specified"}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <strong>
                    No medicine details available.
                  </strong>
                )}
              </div>

              <div className="doctor-prescription-full">
                <span>Notes</span>
                <strong>
                  {selectedPrescription.notes ||
                    "No notes available."}
                </strong>
              </div>
            </div>

            <div className="doctor-prescription-modal-footer">
              <button
                type="button"
                onClick={() =>
                  setSelectedPrescription(null)
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

export default DoctorPrescriptions;