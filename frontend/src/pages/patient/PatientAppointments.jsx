import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../api/axios";
import "./PatientAppointments.css";

const API_BASE_URL =
  "https://hospital-management-system-nvjt.onrender.com/api";

const APPOINTMENTS_URL =
  `${API_BASE_URL}/appointments`;

function PatientAppointments() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected appointment for View modal
  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  function loadUser() {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        setUser(null);
        setError("Patient information not found.");
        setLoading(false);
        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "Unable to load patient user:",
        error
      );

      setUser(null);
      setError(
        "Unable to load patient information."
      );
      setLoading(false);
    }
  }

  async function fetchAppointments() {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(APPOINTMENTS_URL);

      let appointmentData = [];

      if (Array.isArray(response.data)) {
        appointmentData = response.data;
      } else if (
        Array.isArray(response.data?.appointments)
      ) {
        appointmentData =
          response.data.appointments;
      } else if (
        Array.isArray(response.data?.data)
      ) {
        appointmentData =
          response.data.data;
      }

      const patientId =
        user?._id ||
        user?.id ||
        user?.userId;

      if (!patientId) {
        setAppointments([]);
        setError(
          "Patient ID not found."
        );
        return;
      }

      const patientAppointments =
        appointmentData.filter(
          (appointment) => {
            const appointmentPatient =
              appointment?.patient;

            const appointmentPatientId =
              typeof appointmentPatient ===
              "object"
                ? appointmentPatient?._id ||
                  appointmentPatient?.id
                : appointmentPatient;

            const directPatientId =
              appointment?.patientId;

            return (
              String(
                appointmentPatientId ||
                  directPatientId ||
                  ""
              ) === String(patientId)
            );
          }
        );

      setAppointments(
        patientAppointments
      );
    } catch (error) {
      console.error(
        "Unable to fetch patient appointments:",
        error
      );

      setAppointments([]);

      setError(
        error?.response?.data?.message ||
          "Unable to load appointments."
      );
    } finally {
      setLoading(false);
    }
  }

  function getDoctorName(appointment) {
    if (
      appointment?.doctor &&
      typeof appointment.doctor === "object"
    ) {
      return (
        appointment.doctor.fullName ||
        appointment.doctor.name ||
        appointment.doctor.doctorName ||
        "Doctor"
      );
    }

    return (
      appointment?.doctorName ||
      "Doctor"
    );
  }

  function getDepartment(appointment) {
    if (
      appointment?.department &&
      typeof appointment.department === "object"
    ) {
      return (
        appointment.department.name ||
        appointment.department.departmentName ||
        "—"
      );
    }

    return (
      appointment?.department ||
      "—"
    );
  }

  function getAppointmentDate(appointment) {
    return (
      appointment?.appointmentDate ||
      appointment?.date ||
      ""
    );
  }

  function getAppointmentTime(appointment) {
    return (
      appointment?.appointmentTime ||
      appointment?.time ||
      ""
    );
  }

  function getReason(appointment) {
    return (
      appointment?.reason ||
      appointment?.purpose ||
      "General Consultation"
    );
  }

  function getStatus(appointment) {
    return (
      appointment?.status ||
      "Pending"
    );
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatTime(timeValue) {
    if (!timeValue) {
      return "—";
    }

    const timeText =
      String(timeValue);

    const match =
      timeText.match(
        /^(\d{1,2}):(\d{2})$/
      );

    if (!match) {
      return timeText;
    }

    const hours =
      Number(match[1]);

    const minutes =
      match[2];

    const period =
      hours >= 12
        ? "PM"
        : "AM";

    const displayHour =
      hours % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  }

  function getStatusClass(status) {
    const normalized =
      String(status)
        .toLowerCase()
        .replace(/\s+/g, "-");

    if (
      normalized === "confirmed"
    ) {
      return "confirmed";
    }

    if (
      normalized === "completed"
    ) {
      return "completed";
    }

    if (
      normalized === "cancelled" ||
      normalized === "canceled"
    ) {
      return "cancelled";
    }

    if (
      normalized === "rescheduled"
    ) {
      return "rescheduled";
    }

    return "pending";
  }

  /*
   * GET PATIENT NAME
   */
  function getPatientName() {
    if (!user) {
      return "Patient";
    }

    return (
      user.fullName ||
      user.name ||
      `${user.firstName || ""} ${
        user.lastName || ""
      }`.trim() ||
      "Patient"
    );
  }

  /*
   * GET PATIENT EMAIL
   */
  function getPatientEmail() {
    return (
      user?.email ||
      "—"
    );
  }

  /*
   * VIEW APPOINTMENT
   */
  function handleViewAppointment(
    appointment
  ) {
    setSelectedAppointment(
      appointment
    );
  }

  /*
   * CLOSE VIEW MODAL
   */
  function handleCloseView() {
    setSelectedAppointment(null);
  }

  /*
   * DOWNLOAD SINGLE APPOINTMENT PDF
   */
  function handleDownloadAppointment(
    appointment
  ) {
    try {
      const doc = new jsPDF();

      const patientName =
        getPatientName();

      const patientEmail =
        getPatientEmail();

      const doctorName =
        getDoctorName(
          appointment
        );

      const department =
        getDepartment(
          appointment
        );

      const appointmentDate =
        formatDate(
          getAppointmentDate(
            appointment
          )
        );

      const appointmentTime =
        formatTime(
          getAppointmentTime(
            appointment
          )
        );

      const reason =
        getReason(
          appointment
        );

      const status =
        getStatus(
          appointment
        );

      const generatedDate =
        new Date().toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

      /*
       * PDF HEADER
       */
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(
        "Hospital Management System",
        105,
        20,
        { align: "center" }
      );

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Patient Appointment Details",
        105,
        30,
        { align: "center" }
      );

      /*
       * PATIENT DETAILS
       */
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");

      doc.text(
        "Patient Information",
        14,
        45
      );

      autoTable(doc, {
        startY: 50,
        head: [
          [
            "Field",
            "Details",
          ],
        ],
        body: [
          [
            "Patient Name",
            patientName,
          ],
          [
            "Email",
            patientEmail,
          ],
        ],
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fontStyle: "bold",
        },
      });

      /*
       * APPOINTMENT DETAILS
       */
      const appointmentTableStart =
        doc.lastAutoTable.finalY + 12;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");

      doc.text(
        "Appointment Information",
        14,
        appointmentTableStart
      );

      autoTable(doc, {
        startY:
          appointmentTableStart + 5,
        head: [
          [
            "Field",
            "Details",
          ],
        ],
        body: [
          [
            "Doctor",
            `Dr. ${doctorName}`,
          ],
          [
            "Department",
            department,
          ],
          [
            "Appointment Date",
            appointmentDate,
          ],
          [
            "Appointment Time",
            appointmentTime,
          ],
          [
            "Reason",
            reason,
          ],
          [
            "Status",
            status,
          ],
        ],
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fontStyle: "bold",
        },
      });

      /*
       * FOOTER
       */
      const footerY =
        doc.lastAutoTable.finalY + 18;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      doc.text(
        `Generated on: ${generatedDate}`,
        14,
        footerY
      );

      doc.text(
        "This document was generated from the Hospital Management System.",
        14,
        footerY + 7
      );

      /*
       * SAFE FILE NAME
       */
      const safePatientName =
        patientName
          .replace(
            /[^a-zA-Z0-9]+/g,
            "_"
          )
          .replace(
            /^_+|_+$/g,
            ""
          );

      const safeDate =
        String(
          getAppointmentDate(
            appointment
          )
        )
          .split("T")[0]
          .replace(
            /[^0-9-]/g,
            ""
          ) ||
        "appointment";

      const fileName =
        `Appointment_${safePatientName}_${safeDate}.pdf`;

      doc.save(fileName);
    } catch (error) {
      console.error(
        "Unable to generate appointment PDF:",
        error
      );

      setError(
        "Unable to download appointment PDF."
      );
    }
  }

  const filteredAppointments =
    useMemo(() => {
      return appointments.filter(
        (appointment) => {
          const doctorName =
            getDoctorName(
              appointment
            ).toLowerCase();

          const department =
            getDepartment(
              appointment
            ).toLowerCase();

          const reason =
            getReason(
              appointment
            ).toLowerCase();

          const search =
            searchTerm
              .trim()
              .toLowerCase();

          const matchesSearch =
            !search ||
            doctorName.includes(search) ||
            department.includes(search) ||
            reason.includes(search);

          const appointmentStatus =
            String(
              getStatus(appointment)
            ).toLowerCase();

          const matchesStatus =
            statusFilter === "All" ||
            appointmentStatus ===
              statusFilter.toLowerCase();

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      appointments,
      searchTerm,
      statusFilter,
    ]);

  const totalAppointments =
    appointments.length;

  const pendingAppointments =
    appointments.filter(
      (appointment) =>
        String(
          getStatus(appointment)
        ).toLowerCase() ===
        "pending"
    ).length;

  const confirmedAppointments =
    appointments.filter(
      (appointment) =>
        String(
          getStatus(appointment)
        ).toLowerCase() ===
        "confirmed"
    ).length;

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        String(
          getStatus(appointment)
        ).toLowerCase() ===
        "completed"
    ).length;

  return (
    <div className="patient-appointments-page">

      {/* PAGE HEADER */}
      <div className="patient-appointments-header">

        <div>
          <h1>
            My Appointments
          </h1>

          <p>
            View and manage your hospital appointments.
          </p>
        </div>

        <button
          type="button"
          className="patient-appointments-refresh"
          onClick={fetchAppointments}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="patient-appointments-error">
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="patient-appointments-summary">

        <div className="patient-appointment-summary-card">

          <div>
            <span>
              Total Appointments
            </span>

            <strong>
              {totalAppointments}
            </strong>
          </div>
        </div>

        <div className="patient-appointment-summary-card">

          <div>
            <span>
              Pending
            </span>

            <strong>
              {pendingAppointments}
            </strong>
          </div>
        </div>

        <div className="patient-appointment-summary-card">

          <div>
            <span>
              Confirmed
            </span>

            <strong>
              {confirmedAppointments}
            </strong>
          </div>
        </div>

        <div className="patient-appointment-summary-card">

          <div>
            <span>
              Completed
            </span>

            <strong>
              {completedAppointments}
            </strong>
          </div>
        </div>

      </div>

      {/* APPOINTMENTS SECTION */}
      <div className="patient-appointments-section">

        <div className="patient-appointments-section-header">

          <div>
            <h2>
              Appointment History
            </h2>

            <p>
              Your appointments recorded in the hospital system.
            </p>
          </div>

        </div>

        {/* FILTERS */}
        <div className="patient-appointments-filters">

          <div className="patient-appointment-search">

            <input
              type="text"
              placeholder="Search doctor, department or reason..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

          </div>

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

            <option value="Pending">
              Pending
            </option>

            <option value="Confirmed">
              Confirmed
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="Cancelled">
              Cancelled
            </option>

            <option value="Rescheduled">
              Rescheduled
            </option>
          </select>

        </div>

        {/* LOADING */}
        {loading ? (
          <div className="patient-appointments-loading">

            <div className="patient-appointments-spinner"></div>

            <p>
              Loading your appointments...
            </p>

          </div>
        ) : filteredAppointments.length === 0 ? (

          /* EMPTY */
          <div className="patient-appointments-empty">

            <div className="patient-appointments-empty-icon">
              📅
            </div>

            <h3>
              No appointments found
            </h3>

            <p>
              {appointments.length === 0
                ? "You do not have any appointments yet."
                : "No appointments match your current search or filter."}
            </p>

          </div>

        ) : (

          /* TABLE */
          <div className="patient-appointments-table-wrapper">

            <table className="patient-appointments-table">

              <thead>
                <tr>

                  <th>
                    Doctor
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Time
                  </th>

                  <th>
                    Reason
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

                {filteredAppointments.map(
                  (appointment) => (

                    <tr
                      key={
                        appointment?._id ||
                        appointment?.id
                      }
                    >

                      <td>
                        <div className="patient-doctor-cell">

                          <div className="patient-doctor-avatar">
                            {getDoctorName(
                              appointment
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              Dr.{" "}
                              {getDoctorName(
                                appointment
                              )}
                            </strong>
                          </div>

                        </div>
                      </td>

                      <td>
                        {getDepartment(
                          appointment
                        )}
                      </td>

                      <td>
                        {formatDate(
                          getAppointmentDate(
                            appointment
                          )
                        )}
                      </td>

                      <td>
                        {formatTime(
                          getAppointmentTime(
                            appointment
                          )
                        )}
                      </td>

                      <td>
                        <span className="patient-appointment-reason">
                          {getReason(
                            appointment
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`patient-appointment-status ${getStatusClass(
                            getStatus(
                              appointment
                            )
                          )}`}
                        >
                          {getStatus(
                            appointment
                          )}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td>
                        <div className="patient-appointment-actions">

                          <button
                            type="button"
                            className="patient-appointment-view-btn"
                            onClick={() =>
                              handleViewAppointment(
                                appointment
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="patient-appointment-download-btn"
                            onClick={() =>
                              handleDownloadAppointment(
                                appointment
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

      {/* VIEW APPOINTMENT MODAL */}
      {selectedAppointment && (
        <div
          className="patient-appointment-modal-overlay"
          onClick={handleCloseView}
        >

          <div
            className="patient-appointment-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="patient-appointment-modal-header">

              <div>
                <h2>
                  Appointment Details
                </h2>

                <p>
                  View your appointment information.
                </p>
              </div>

              <button
                type="button"
                className="patient-appointment-modal-close"
                onClick={handleCloseView}
              >
                ×
              </button>

            </div>

            <div className="patient-appointment-modal-body">

              <div className="patient-appointment-detail-grid">

                <div className="patient-appointment-detail-item">
                  <span>
                    Patient Name
                  </span>

                  <strong>
                    {getPatientName()}
                  </strong>
                </div>

                <div className="patient-appointment-detail-item">
                  <span>
                    Email
                  </span>

                  <strong>
                    {getPatientEmail()}
                  </strong>
                </div>

                <div className="patient-appointment-detail-item">
                  <span>
                    Doctor
                  </span>

                  <strong>
                    Dr.{" "}
                    {getDoctorName(
                      selectedAppointment
                    )}
                  </strong>
                </div>

                <div className="patient-appointment-detail-item">
                  <span>
                    Department
                  </span>

                  <strong>
                    {getDepartment(
                      selectedAppointment
                    )}
                  </strong>
                </div>

                <div className="patient-appointment-detail-item">
                  <span>
                    Appointment Date
                  </span>

                  <strong>
                    {formatDate(
                      getAppointmentDate(
                        selectedAppointment
                      )
                    )}
                  </strong>
                </div>

                <div className="patient-appointment-detail-item">
                  <span>
                    Appointment Time
                  </span>

                  <strong>
                    {formatTime(
                      getAppointmentTime(
                        selectedAppointment
                      )
                    )}
                  </strong>
                </div>

                <div className="patient-appointment-detail-item patient-appointment-detail-full">
                  <span>
                    Reason
                  </span>

                  <strong>
                    {getReason(
                      selectedAppointment
                    )}
                  </strong>
                </div>

                <div className="patient-appointment-detail-item">
                  <span>
                    Status
                  </span>

                  <strong
                    className={`patient-appointment-status ${getStatusClass(
                      getStatus(
                        selectedAppointment
                      )
                    )}`}
                  >
                    {getStatus(
                      selectedAppointment
                    )}
                  </strong>
                </div>

              </div>

            </div>

            <div className="patient-appointment-modal-footer">

              <button
                type="button"
                className="patient-appointment-modal-download"
                onClick={() =>
                  handleDownloadAppointment(
                    selectedAppointment
                  )
                }
              >
                Download PDF
              </button>

              <button
                type="button"
                className="patient-appointment-modal-cancel"
                onClick={handleCloseView}
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

export default PatientAppointments;