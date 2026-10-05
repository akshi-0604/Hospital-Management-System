import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
        doctorName
          .toLowerCase()
          .includes(text) ||
        diagnosis
          .toLowerCase()
          .includes(text) ||
        treatmentPlan
          .toLowerCase()
          .includes(text) ||
        symptoms
          .toLowerCase()
          .includes(text) ||
        notes
          .toLowerCase()
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

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  function handleDownloadRecord(record) {
    if (!record) {
      return;
    }

    const doc = new jsPDF();

    const patientName =
      record.patient?.fullName ||
      user?.fullName ||
      user?.name ||
      "Patient";

    const doctorName =
      record.doctor?.fullName ||
      "Unknown Doctor";

    const specialization =
      record.doctor?.specialization ||
      "-";

    const department =
      record.doctor?.department ||
      "-";

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");

    doc.text(
      "Hospital Management System",
      105,
      20,
      {
        align: "center",
      }
    );

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");

    doc.text(
      "Medical Record",
      105,
      30,
      {
        align: "center",
      }
    );

    doc.setDrawColor(200, 200, 200);

    doc.line(
      15,
      36,
      195,
      36
    );

    doc.setFontSize(11);
    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Patient Information",
      15,
      48
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      `Patient: ${patientName}`,
      15,
      58
    );

    doc.text(
      `Doctor: ${doctorName}`,
      15,
      66
    );

    doc.text(
      `Specialization: ${specialization}`,
      15,
      74
    );

    doc.text(
      `Department: ${department}`,
      15,
      82
    );

    doc.text(
      `Visit Date: ${formatDate(
        record.visitDate
      )}`,
      110,
      58
    );

    doc.text(
      `Status: ${record.status || "Open"}`,
      110,
      66
    );

    doc.text(
      `Generated: ${formatDateTime(
        new Date()
      )}`,
      110,
      74
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Medical Details",
      15,
      100
    );

    const medicalDetails = [
      [
        "Diagnosis",
        record.diagnosis || "-",
      ],
      [
        "Symptoms",
        record.symptoms || "-",
      ],
      [
        "Treatment Plan",
        record.treatmentPlan || "-",
      ],
      [
        "Notes",
        record.notes || "-",
      ],
    ];

    autoTable(doc, {
      startY: 106,

      head: [
        [
          "Field",
          "Details",
        ],
      ],

      body: medicalDetails,

      theme: "grid",

      styles: {
        fontSize: 10,
        cellPadding: 4,
        valign: "top",
      },

      headStyles: {
        fontStyle: "bold",
      },

      columnStyles: {
        0: {
          cellWidth: 42,
        },
        1: {
          cellWidth: 138,
        },
      },
    });

    let currentY =
      doc.lastAutoTable.finalY +
      14;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Patient Vitals",
      15,
      currentY
    );

    const vitals = [
      [
        "Blood Pressure",
        record.bloodPressure || "-",
      ],
      [
        "Pulse Rate",
        record.pulseRate !== undefined &&
        record.pulseRate !== null
          ? `${record.pulseRate} bpm`
          : "-",
      ],
      [
        "Temperature",
        record.temperature !== undefined &&
        record.temperature !== null
          ? `${record.temperature} °F`
          : "-",
      ],
      [
        "Oxygen Level",
        record.oxygenLevel !== undefined &&
        record.oxygenLevel !== null
          ? `${record.oxygenLevel}%`
          : "-",
      ],
      [
        "Weight",
        record.weight !== undefined &&
        record.weight !== null
          ? `${record.weight} kg`
          : "-",
      ],
      [
        "Follow-up Date",
        formatDate(
          record.followUpDate
        ),
      ],
    ];

    autoTable(doc, {
      startY: currentY + 6,

      head: [
        [
          "Vital",
          "Value",
        ],
      ],

      body: vitals,

      theme: "grid",

      styles: {
        fontSize: 10,
        cellPadding: 4,
      },

      headStyles: {
        fontStyle: "bold",
      },
    });

    currentY =
      doc.lastAutoTable.finalY +
      14;

    doc.setFontSize(9);
    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "Hospital Management System",
      105,
      285,
      {
        align: "center",
      }
    );

    const safePatientName =
      patientName
        .replace(
          /[^a-z0-9]/gi,
          "_"
        )
        .replace(
          /_+/g,
          "_"
        );

    const visitDate =
      record.visitDate
        ? new Date(record.visitDate)
            .toISOString()
            .split("T")[0]
        : "record";

    doc.save(
      `Medical_Record_${safePatientName}_${visitDate}.pdf`
    );
  }

  return (
    <div className="patient-medical-records-page">

      <div className="patient-medical-records-header">
        <div>
          <h1>
            Medical Records
          </h1>

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
            setSearch(
              event.target.value
            )
          }
        />

        <button
          type="button"
          className="patient-refresh-records-button"
          onClick={loadMedicalRecords}
          disabled={loading}
        >
          ↻{" "}
          {loading
            ? "Refreshing..."
            : "Refresh"}
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
                  <th>
                    Doctor
                  </th>

                  <th>
                    Diagnosis
                  </th>

                  <th>
                    Treatment
                  </th>

                  <th>
                    Visit Date
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

                {filteredRecords.map(
                  (record) => (
                    <tr
                      key={record._id}
                    >

                      <td>
                        <strong>
                          {record.doctor?.fullName ||
                            "Unknown Doctor"}
                        </strong>

                        {record.doctor
                          ?.specialization && (
                          <span className="patient-doctor-specialization">
                            {
                              record.doctor
                                .specialization
                            }
                          </span>
                        )}
                      </td>

                      <td>
                        {record.diagnosis ||
                          "-"}
                      </td>

                      <td>
                        {record.treatmentPlan ||
                          "-"}
                      </td>

                      <td>
                        {formatDate(
                          record.visitDate
                        )}
                      </td>

                      <td>
                        <span
                          className={`patient-record-status ${
                            record.status ===
                            "Closed"
                              ? "closed"
                              : "open"
                          }`}
                        >
                          {record.status ||
                            "Open"}
                        </span>
                      </td>


                      <td>
                        <div className="patient-medical-record-actions">

                          <button
                            type="button"
                            className="patient-view-record-button"
                            onClick={() =>
                              openViewModal(
                                record
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="patient-download-record-button"
                            onClick={() =>
                              handleDownloadRecord(
                                record
                              )
                            }
                          >
                            Download
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

      {showViewModal &&
        selectedRecord && (
          <div
            className="patient-medical-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeViewModal();
              }
            }}
          >

            <div className="patient-medical-modal">

              {/* MODAL HEADER */}

              <div className="patient-medical-modal-header">

                <div>
                  <h2>
                    Medical Record
                  </h2>

                  <p>
                    Your medical history and treatment
                    details.
                  </p>
                </div>

                <button
                  type="button"
                  className="patient-medical-modal-close"
                  onClick={
                    closeViewModal
                  }
                >
                  ×
                </button>

              </div>

              {/* RECORD DETAILS */}

              <div className="patient-record-details">

                {/* BASIC DETAILS */}

                <div className="patient-record-detail-grid">

                  <div>
                    <span>
                      Doctor
                    </span>

                    <strong>
                      {selectedRecord.doctor
                        ?.fullName ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Specialization
                    </span>

                    <strong>
                      {selectedRecord.doctor
                        ?.specialization ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Department
                    </span>

                    <strong>
                      {selectedRecord.doctor
                        ?.department ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Visit Date
                    </span>

                    <strong>
                      {formatDate(
                        selectedRecord.visitDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Diagnosis
                    </span>

                    <strong>
                      {selectedRecord.diagnosis ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Status
                    </span>

                    <strong>
                      {selectedRecord.status ||
                        "-"}
                    </strong>
                  </div>

                </div>

                {/* SYMPTOMS */}

                <div className="patient-record-section">

                  <h3>
                    Symptoms
                  </h3>

                  <p>
                    {selectedRecord.symptoms ||
                      "-"}
                  </p>

                </div>

                {/* TREATMENT */}

                <div className="patient-record-section">

                  <h3>
                    Treatment Plan
                  </h3>

                  <p>
                    {selectedRecord.treatmentPlan ||
                      "-"}
                  </p>

                </div>

                {/* VITALS */}

                <div className="patient-vitals-display">

                  <h3>
                    Patient Vitals
                  </h3>

                  <div className="patient-record-detail-grid">

                    <div>
                      <span>
                        Blood Pressure
                      </span>

                      <strong>
                        {selectedRecord.bloodPressure ||
                          "-"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Pulse Rate
                      </span>

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
                      <span>
                        Temperature
                      </span>

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
                      <span>
                        Oxygen Level
                      </span>

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
                      <span>
                        Weight
                      </span>

                      <strong>
                        {selectedRecord.weight !==
                          undefined &&
                        selectedRecord.weight !==
                          null
                          ? `${selectedRecord.weight} kg`
                          : "-"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Follow-up
                      </span>

                      <strong>
                        {formatDate(
                          selectedRecord.followUpDate
                        )}
                      </strong>
                    </div>

                  </div>

                </div>


                <div className="patient-record-section">

                  <h3>
                    Notes
                  </h3>

                  <p>
                    {selectedRecord.notes ||
                      "-"}
                  </p>

                </div>

              </div>

              <div className="patient-medical-modal-footer">

                <button
                  type="button"
                  className="patient-download-record-button"
                  onClick={() =>
                    handleDownloadRecord(
                      selectedRecord
                    )
                  }
                >
                  Download PDF
                </button>

                <button
                  type="button"
                  className="patient-close-record-button"
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

export default PatientMedicalRecords;