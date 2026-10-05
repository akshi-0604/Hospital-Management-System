import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

import "./DoctorMedicalRecords.css";

function DoctorMedicalRecords() {
  const [doctor, setDoctor] = useState(null);
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
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

      const response = await api.get("/medical-records");

      let recordData = [];

      if (Array.isArray(response.data)) {
        recordData = response.data;
      } else if (Array.isArray(response.data?.records)) {
        recordData = response.data.records;
      } else if (Array.isArray(response.data?.medicalRecords)) {
        recordData = response.data.medicalRecords;
      } else if (Array.isArray(response.data?.data)) {
        recordData = response.data.data;
      }

      const doctorId = String(
        loggedInDoctor._id || loggedInDoctor.id || ""
      );

      const doctorRecords = recordData.filter((record) => {
        const recordDoctor =
          record.doctor?._id ||
          record.doctor?.id ||
          record.doctor;

        return String(recordDoctor || "") === doctorId;
      });

      setRecords(doctorRecords);
    } catch (err) {
      console.error("Doctor medical records error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load medical records."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = useMemo(() => {
    const value = search.trim().toLowerCase();

    return records.filter((record) => {
      const patientName =
        record.patient?.fullName ||
        record.patient?.name ||
        record.patientName ||
        "";

      const diagnosis = record.diagnosis || "";
      const treatment = record.treatmentPlan || "";
      const symptoms = record.symptoms || "";
      const notes = record.notes || "";

      const matchesSearch =
        !value ||
        patientName.toLowerCase().includes(value) ||
        diagnosis.toLowerCase().includes(value) ||
        treatment.toLowerCase().includes(value) ||
        symptoms.toLowerCase().includes(value) ||
        notes.toLowerCase().includes(value);

      const status =
        record.status || "Active";

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

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

  return (
    <div className="doctor-records-page">
      <div className="doctor-records-header">
        <div>
          <h1>Medical Records</h1>
          <p>
            Manage and review medical records created by you.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRecords}
          className="doctor-records-refresh"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="doctor-records-error">
          {error}
        </div>
      )}

      <div className="doctor-records-summary">
        <div>
          <span>Total Records</span>
          <strong>{records.length}</strong>
        </div>

        <div>
          <span>Showing</span>
          <strong>{filteredRecords.length}</strong>
        </div>

        <div>
          <span>Doctor</span>
          <strong>
            {doctor?.fullName || "Doctor"}
          </strong>
        </div>
      </div>

      <div className="doctor-records-toolbar">
        <input
          type="text"
          placeholder="Search patient, diagnosis, treatment..."
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
          <option value="Archived">Archived</option>
        </select>
      </div>

      <div className="doctor-records-table-card">
        {loading ? (
          <div className="doctor-records-empty">
            Loading medical records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="doctor-records-empty">
            <strong>No medical records found</strong>
            <span>
              Medical records created by you will appear here.
            </span>
          </div>
        ) : (
          <div className="doctor-records-table-wrapper">
            <table className="doctor-records-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Diagnosis</th>
                  <th>Treatment</th>
                  <th>Visit Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <strong>
                        {record.patient?.fullName ||
                          record.patient?.name ||
                          record.patientName ||
                          "Unknown Patient"}
                      </strong>
                    </td>

                    <td>
                      {record.diagnosis || "Not available"}
                    </td>

                    <td>
                      {record.treatmentPlan ||
                        "Not available"}
                    </td>

                    <td>
                      {formatDate(
                        record.visitDate ||
                          record.createdAt
                      )}
                    </td>

                    <td>
                      <span className="doctor-record-status">
                        {record.status || "Active"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="doctor-record-view-button"
                        onClick={() =>
                          setSelectedRecord(record)
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

      {selectedRecord && (
        <div className="doctor-record-modal-overlay">
          <div className="doctor-record-modal">
            <div className="doctor-record-modal-header">
              <div>
                <h2>Medical Record</h2>
                <p>
                  {selectedRecord.patient?.fullName ||
                    selectedRecord.patient?.name ||
                    selectedRecord.patientName ||
                    "Patient"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
              >
                ×
              </button>
            </div>

            <div className="doctor-record-details">
              <div>
                <span>Patient</span>
                <strong>
                  {selectedRecord.patient?.fullName ||
                    selectedRecord.patient?.name ||
                    selectedRecord.patientName ||
                    "Unknown"}
                </strong>
              </div>

              <div>
                <span>Visit Date</span>
                <strong>
                  {formatDate(
                    selectedRecord.visitDate ||
                      selectedRecord.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>Diagnosis</span>
                <strong>
                  {selectedRecord.diagnosis ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedRecord.status || "Active"}
                </strong>
              </div>

              <div className="doctor-record-full">
                <span>Symptoms</span>
                <strong>
                  {selectedRecord.symptoms ||
                    "Not available"}
                </strong>
              </div>

              <div className="doctor-record-full">
                <span>Treatment Plan</span>
                <strong>
                  {selectedRecord.treatmentPlan ||
                    "Not available"}
                </strong>
              </div>

              <div className="doctor-record-full">
                <span>Notes</span>
                <strong>
                  {selectedRecord.notes ||
                    "Not available"}
                </strong>
              </div>
            </div>

            <div className="doctor-record-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
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

export default DoctorMedicalRecords;