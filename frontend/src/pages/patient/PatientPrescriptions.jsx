import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./PatientPrescriptions.css";

const APPOINTMENTS_URL = "/prescriptions";

function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPrescription, setSelectedPrescription] =
    useState(null);

  const [showViewModal, setShowViewModal] =
    useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  async function loadPrescriptions() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        APPOINTMENTS_URL
      );

      const data = response.data;

      let prescriptionList = [];

      if (Array.isArray(data)) {
        prescriptionList = data;
      } else if (Array.isArray(data?.prescriptions)) {
        prescriptionList = data.prescriptions;
      } else if (Array.isArray(data?.data)) {
        prescriptionList = data.data;
      }

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setPrescriptions([]);
        setError("Patient information not found.");
        return;
      }

      const loggedInUser = JSON.parse(storedUser);

      const patientId =
        loggedInUser?._id ||
        loggedInUser?.id ||
        loggedInUser?.userId;

      if (!patientId) {
        setPrescriptions([]);
        setError("Patient ID not found.");
        return;
      }

      const patientPrescriptions =
        prescriptionList.filter((prescription) => {
          const prescriptionPatient =
            prescription?.patient;

          const prescriptionPatientId =
            prescriptionPatient?._id ||
            prescriptionPatient?.id ||
            prescriptionPatient ||
            prescription?.patientId;

          return (
            String(prescriptionPatientId) ===
            String(patientId)
          );
        });

      setPrescriptions(patientPrescriptions);
    } catch (error) {
      console.error(
        "Load patient prescriptions error:",
        error
      );

      setPrescriptions([]);

      setError(
        error.response?.data?.message ||
          "Unable to load prescriptions."
      );
    } finally {
      setLoading(false);
    }
  }

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

  function getDoctorName(prescription) {
    return (
      prescription?.doctor?.fullName ||
      prescription?.doctor?.name ||
      "Unknown Doctor"
    );
  }

  function getDepartment(prescription) {
    return (
      prescription?.doctor?.department ||
      prescription?.department ||
      "-"
    );
  }

  const filteredPrescriptions = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return prescriptions.filter((item) => {
      const doctorName =
        getDoctorName(item).toLowerCase();

      const department =
        getDepartment(item).toLowerCase();

      const diagnosis =
        item?.diagnosis?.toLowerCase() || "";

      const matchesSearch =
        !searchText ||
        doctorName.includes(searchText) ||
        department.includes(searchText) ||
        diagnosis.includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        item?.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    prescriptions,
    search,
    statusFilter,
  ]);

  const totalPrescriptions =
    prescriptions.length;

  const activePrescriptions =
    prescriptions.filter(
      (item) => item?.status === "Active"
    ).length;

  const completedPrescriptions =
    prescriptions.filter(
      (item) => item?.status === "Completed"
    ).length;

  function openViewModal(prescription) {
    setSelectedPrescription(
      prescription
    );

    setShowViewModal(true);
  }

  function closeViewModal() {
    setSelectedPrescription(null);
    setShowViewModal(false);
  }

  function handleDownloadPrescription(prescription) {
    if (!prescription) {
      return;
    }

    const doc = new jsPDF();

    const patientName =
      prescription?.patient?.fullName ||
      "Patient";

    const doctorName =
      getDoctorName(prescription);

    const department =
      getDepartment(prescription);

    const diagnosis =
      prescription?.diagnosis ||
      "-";

    const prescriptionDate =
      formatDate(
        prescription?.prescriptionDate
      );

    const status =
      prescription?.status ||
      "-";

    const notes =
      prescription?.notes ||
      "No additional notes.";

    const generatedDate =
      formatDateTime(new Date());

    /*
      Header
    */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text(
      "Hospital Management System",
      105,
      20,
      {
        align: "center",
      }
    );

    doc.setFontSize(14);

    doc.text(
      "Prescription",
      105,
      29,
      {
        align: "center",
      }
    );

    doc.setDrawColor(
      180,
      180,
      180
    );

    doc.line(
      15,
      35,
      195,
      35
    );

    /*
      Patient / Prescription Details
    */
    autoTable(doc, {
      startY: 43,
      theme: "grid",

      head: [
        [
          "Patient Information",
          "Prescription Information",
        ],
      ],

      body: [
        [
          `Patient: ${patientName}`,
          `Doctor: ${doctorName}`,
        ],
        [
          `Department: ${department}`,
          `Date: ${prescriptionDate}`,
        ],
        [
          `Diagnosis: ${diagnosis}`,
          `Status: ${status}`,
        ],
        [
          `Generated: ${generatedDate}`,
          `Appointment: ${
            prescription?.appointment
              ? "Linked"
              : "Not linked"
          }`,
        ],
      ],

      styles: {
        fontSize: 10,
        cellPadding: 5,
      },

      headStyles: {
        fontStyle: "bold",
      },

      columnStyles: {
        0: {
          cellWidth: 88,
        },

        1: {
          cellWidth: 88,
        },
      },
    });

    /*
      Medicines
    */
    let currentY =
      doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    doc.text(
      "Prescribed Medicines",
      15,
      currentY
    );

    const medicines =
      Array.isArray(
        prescription?.medications
      )
        ? prescription.medications
        : [];

    const medicineRows =
      medicines.length > 0
        ? medicines.map(
            (medicine, index) => [
              index + 1,
              medicine?.medicineName ||
                "-",
              medicine?.dosage ||
                "-",
              medicine?.frequency ||
                "-",
              medicine?.duration ||
                "-",
              medicine?.instructions ||
                "-",
            ]
          )
        : [
            [
              "-",
              "No medicine details available",
              "-",
              "-",
              "-",
              "-",
            ],
          ];

    autoTable(doc, {
      startY: currentY + 5,

      theme: "grid",

      head: [
        [
          "#",
          "Medicine",
          "Dosage",
          "Frequency",
          "Duration",
          "Instructions",
        ],
      ],

      body: medicineRows,

      styles: {
        fontSize: 8,
        cellPadding: 4,
        overflow: "linebreak",
      },

      headStyles: {
        fontStyle: "bold",
      },

      columnStyles: {
        0: {
          cellWidth: 10,
        },

        1: {
          cellWidth: 35,
        },

        2: {
          cellWidth: 25,
        },

        3: {
          cellWidth: 28,
        },

        4: {
          cellWidth: 25,
        },

        5: {
          cellWidth: 57,
        },
      },
    });

    /*
      Notes
    */
    currentY =
      doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    doc.text(
      "Notes",
      15,
      currentY
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const noteLines =
      doc.splitTextToSize(
        notes,
        175
      );

    doc.text(
      noteLines,
      15,
      currentY + 7
    );

    /*
      Footer
    */
    const pageHeight =
      doc.internal.pageSize.height;

    doc.setDrawColor(
      200,
      200,
      200
    );

    doc.line(
      15,
      pageHeight - 20,
      195,
      pageHeight - 20
    );

    doc.setFontSize(8);
    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "Hospital Management System - Prescription",
      105,
      pageHeight - 12,
      {
        align: "center",
      }
    );

    /*
      Safe filename
    */
    const safePatientName =
      patientName
        .replace(/[^a-z0-9]/gi, "_")
        .replace(/_+/g, "_");

    const safeDate =
      prescriptionDate
        .replace(/[^a-z0-9]/gi, "_")
        .replace(/_+/g, "_");

    const fileName =
      `Prescription_${safePatientName}_${safeDate}.pdf`;

    doc.save(fileName);
  }

  return (
    <div className="patient-prescriptions-page">

      <div className="patient-prescriptions-header">

        <div>
          <h1>
            Prescriptions
          </h1>

          <p>
            View your prescribed medicines and
            medication instructions.
          </p>
        </div>

        <button
          type="button"
          className="patient-prescriptions-refresh"
          onClick={loadPrescriptions}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>

      <div className="patient-prescription-summary">

        <div className="patient-prescription-summary-card">
          <span>
            Total Prescriptions
          </span>

          <strong>
            {totalPrescriptions}
          </strong>
        </div>

        <div className="patient-prescription-summary-card">
          <span>
            Active
          </span>

          <strong>
            {activePrescriptions}
          </strong>
        </div>

        <div className="patient-prescription-summary-card">
          <span>
            Completed
          </span>

          <strong>
            {completedPrescriptions}
          </strong>
        </div>

      </div>

      <div className="patient-prescriptions-toolbar">

        <input
          type="text"
          placeholder="Search doctor, department or diagnosis..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
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

      </div>

      {error && (
        <div className="patient-prescription-error">
          {error}
        </div>
      )}

      <div className="patient-prescriptions-table-card">

        {loading ? (
          <div className="patient-prescription-empty">

            <strong>
              Loading prescriptions...
            </strong>

            <span>
              Please wait while your prescription
              records are loaded.
            </span>

          </div>
        ) : filteredPrescriptions.length ===
          0 ? (
          <div className="patient-prescription-empty">

            <strong>
              No prescriptions found
            </strong>

            <span>
              Your prescription records will
              appear here when available.
            </span>

          </div>
        ) : (
          <div className="patient-prescriptions-table-wrapper">

            <table className="patient-prescriptions-table">

              <thead>
                <tr>
                  <th>Doctor</th>
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
                    <tr
                      key={
                        prescription._id
                      }
                    >

                      <td>
                        <strong>
                          {getDoctorName(
                            prescription
                          )}
                        </strong>
                      </td>

                      <td>
                        {getDepartment(
                          prescription
                        )}
                      </td>

                      <td>
                        {prescription?.diagnosis ||
                          "-"}
                      </td>

                      <td>
                        <span className="patient-medicine-count">
                          {prescription?.medications
                            ?.length || 0}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          prescription?.prescriptionDate
                        )}
                      </td>

                      <td>
                        <span
                          className={`patient-prescription-status ${
                            prescription?.status
                              ?.toLowerCase() || ""
                          }`}
                        >
                          {prescription?.status ||
                            "-"}
                        </span>
                      </td>

                      <td>

                        <div className="patient-prescription-actions">

                          <button
                            type="button"
                            className="patient-view-prescription-button"
                            onClick={() =>
                              openViewModal(
                                prescription
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="patient-download-prescription-button"
                            onClick={() =>
                              handleDownloadPrescription(
                                prescription
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
        selectedPrescription && (
          <div className="patient-prescription-modal-overlay">

            <div className="patient-prescription-modal">

              <div className="patient-prescription-modal-header">

                <div>
                  <h2>
                    Prescription Details
                  </h2>

                  <p>
                    Your medication and
                    prescription information.
                  </p>
                </div>

                <button
                  type="button"
                  className="patient-prescription-close-button"
                  onClick={
                    closeViewModal
                  }
                >
                  ×
                </button>

              </div>

              <div className="patient-prescription-details">

                <div className="patient-prescription-detail-grid">

                  <div>
                    <span>
                      Patient
                    </span>

                    <strong>
                      {selectedPrescription
                        .patient
                        ?.fullName ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Doctor
                    </span>

                    <strong>
                      {getDoctorName(
                        selectedPrescription
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Department
                    </span>

                    <strong>
                      {getDepartment(
                        selectedPrescription
                      )}
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
                      {selectedPrescription.diagnosis ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Status
                    </span>

                    <strong>
                      {selectedPrescription.status ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Appointment
                    </span>

                    <strong>
                      {selectedPrescription
                        .appointment?._id
                        ? "Linked"
                        : selectedPrescription
                            .appointment
                          ? "Linked"
                          : "Not linked"}
                    </strong>
                  </div>

                </div>

                <div className="patient-prescription-view-section">

                  <h3>
                    Medicines
                  </h3>

                  <div className="patient-medicine-view-list">

                    {Array.isArray(
                      selectedPrescription.medications
                    ) &&
                    selectedPrescription
                      .medications.length > 0 ? (
                      selectedPrescription.medications.map(
                        (
                          medicine,
                          index
                        ) => (
                          <div
                            className="patient-medicine-view-card"
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
                                {medicine.dosage ||
                                  "-"}{" "}
                                •{" "}
                                {medicine.frequency ||
                                  "-"}{" "}
                                •{" "}
                                {medicine.duration ||
                                  "-"}
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
                      )
                    ) : (
                      <div className="patient-no-medicine">
                        No medicine details
                        available.
                      </div>
                    )}

                  </div>

                </div>

                <div className="patient-prescription-view-section">

                  <h3>
                    Notes
                  </h3>

                  <p>
                    {selectedPrescription.notes ||
                      "No additional notes."}
                  </p>

                </div>

              </div>

              <div className="patient-prescription-modal-footer">

                <button
                  type="button"
                  className="patient-download-prescription-button"
                  onClick={() =>
                    handleDownloadPrescription(
                      selectedPrescription
                    )
                  }
                >
                  Download PDF
                </button>

                <button
                  type="button"
                  className="patient-prescription-close-footer-button"
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

export default PatientPrescriptions;