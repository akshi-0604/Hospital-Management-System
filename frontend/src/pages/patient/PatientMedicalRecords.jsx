import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "./PatientMedicalRecords.css";

function PatientMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadMedicalRecords();
    }
  }, [user]);

  function loadUser() {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("User information not found.");
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (err) {
      console.error("Load patient user error:", err);
      setError("Unable to load patient information.");
      setLoading(false);
    }
  }

  async function loadMedicalRecords() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/medical-records");

      const allRecords =
        response.data?.records ||
        response.data?.data ||
        (Array.isArray(response.data)
          ? response.data
          : []);

      const patientId =
        user?._id ||
        user?.id ||
        user?.userId;

      const patientRecords = allRecords.filter(
        (record) => {
          const recordPatientId =
            record.patient?._id ||
            record.patient?.id ||
            record.patient;

          return (
            patientId &&
            recordPatientId &&
            String(recordPatientId) === String(patientId)
          );
        }
      );

      setRecords(patientRecords);
    } catch (err) {
      console.error(
        "Load patient medical records error:",
        err
      );

      setRecords([]);

      setError(
        err.response?.data?.message ||
          "Unable to load your medical records."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return records;
    }

    return records.filter((record) => {
      const doctorName =
        record.doctor?.fullName || "";

      const diagnosis =
        record.diagnosis || "";

      const treatmentPlan =
        record.treatmentPlan || "";

      const symptoms =
        record.symptoms || "";

      const notes =
        record.notes || "";

      return (
        doctorName.toLowerCase().includes(text) ||
        diagnosis.toLowerCase().includes(text) ||
        treatmentPlan.toLowerCase().includes(text) ||
        symptoms.toLowerCase().includes(text) ||
        notes.toLowerCase().includes(text)
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

  function openViewModal(record) {
    setSelectedRecord(record);
    setShowViewModal(true);
  }

  function closeViewModal() {
    setSelectedRecord(null);
    setShowViewModal(false);
  }

  return (
    <div className="patient-medical-records-page">
      <div className="patient-medical-records-header">
        <div>
          <h1>Medical Records</h1>

          <p>
            View your medical history, diagnosis,
            treatment details and patient vitals.
          </p>
        </div>
      </div>

      <div className="patient-medical-records-toolbar">
        <input
          type="text"
          placeholder="Search diagnosis, doctor or treatment..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <button
          type="button"
          className="patient-refresh-records-button"
          onClick={loadMedicalRecords}
          disabled={loading}
        >
          ↻ {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="patient-medical-records-error">
          {error}
        </div>
      )}

      <div className="patient-medical-records-table-card">
        {loading ? (
          <div className="patient-medical-records-empty">
            <strong>
              Loading your medical records...
            </strong>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="patient-medical-records-empty">
            <strong>
              No medical records found
            </strong>

            <span>
              Your medical records will appear here
              when they are added by the hospital.
            </span>
          </div>
        ) : (
          <div className="patient-medical-records-table-wrapper">
            <table className="patient-medical-records-table">
              <thead>
                <tr>
                  <th>Doctor</th>
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
                        {record.doctor?.fullName ||
                          "Unknown Doctor"}
                      </strong>

                      {record.doctor?.specialization && (
                        <span className="patient-doctor-specialization">
                          {record.doctor.specialization}
                        </span>
                      )}
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
                      <span
                        className={`patient-record-status ${
                          record.status === "Closed"
                            ? "closed"
                            : "open"
                        }`}
                      >
                        {record.status || "Open"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="patient-view-record-button"
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

      {showViewModal && selectedRecord && (
        <div
          className="patient-medical-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeViewModal();
            }
          }}
        >
          <div className="patient-medical-modal">
            <div className="patient-medical-modal-header">
              <div>
                <h2>Medical Record</h2>

                <p>
                  Your medical history and treatment
                  details.
                </p>
              </div>

              <button
                type="button"
                className="patient-medical-modal-close"
                onClick={closeViewModal}
              >
                ×
              </button>
            </div>

            <div className="patient-record-details">
              <div className="patient-record-detail-grid">
                <div>
                  <span>Doctor</span>

                  <strong>
                    {selectedRecord.doctor
                      ?.fullName || "-"}
                  </strong>
                </div>

                <div>
                  <span>Specialization</span>

                  <strong>
                    {selectedRecord.doctor
                      ?.specialization || "-"}
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
                    {selectedRecord.diagnosis || "-"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong>
                    {selectedRecord.status || "-"}
                  </strong>
                </div>
              </div>

              <div className="patient-record-section">
                <h3>Symptoms</h3>

                <p>
                  {selectedRecord.symptoms || "-"}
                </p>
              </div>

              <div className="patient-record-section">
                <h3>Treatment Plan</h3>

                <p>
                  {selectedRecord.treatmentPlan ||
                    "-"}
                </p>
              </div>

              <div className="patient-vitals-display">
                <h3>Patient Vitals</h3>

                <div className="patient-record-detail-grid">
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
                      {selectedRecord.pulseRate !==
                        undefined &&
                      selectedRecord.pulseRate !==
                        null
                        ? `${selectedRecord.pulseRate} bpm`
                        : "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Temperature</span>

                    <strong>
                      {selectedRecord.temperature !==
                        undefined &&
                      selectedRecord.temperature !==
                        null
                        ? `${selectedRecord.temperature} °F`
                        : "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Oxygen Level</span>

                    <strong>
                      {selectedRecord.oxygenLevel !==
                        undefined &&
                      selectedRecord.oxygenLevel !==
                        null
                        ? `${selectedRecord.oxygenLevel}%`
                        : "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Weight</span>

                    <strong>
                      {selectedRecord.weight !==
                        undefined &&
                      selectedRecord.weight !== null
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

              <div className="patient-record-section">
                <h3>Notes</h3>

                <p>
                  {selectedRecord.notes || "-"}
                </p>
              </div>
            </div>

            <div className="patient-medical-modal-footer">
              <button
                type="button"
                className="patient-close-record-button"
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

export default PatientMedicalRecords;

