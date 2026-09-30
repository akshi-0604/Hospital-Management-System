import { useEffect, useMemo, useState } from "react";
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

          <div className="summary-icon">
            📅
          </div>

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

          <div className="summary-icon">
            ⏳
          </div>

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

          <div className="summary-icon">
            ✓
          </div>

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

          <div className="summary-icon">
            ✔
          </div>

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

            <span>
              🔍
            </span>

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

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default PatientAppointments;