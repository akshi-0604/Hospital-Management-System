import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

import "./DoctorAppointments.css";

function DoctorAppointments() {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);

  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadLoggedInUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadDoctor();
    }
  }, [user]);

  useEffect(() => {
    if (doctor?._id) {
      fetchAppointments(doctor._id);
    }
  }, [doctor]);

  function loadLoggedInUser() {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError(
          "Doctor login information was not found. Please login again."
        );
        setLoading(false);
        setLoadingDoctor(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "Unable to read logged-in user:",
        error
      );

      setError(
        "Unable to read your login information."
      );

      setLoading(false);
      setLoadingDoctor(false);
    }
  }

  async function loadDoctor() {
    try {
      setLoadingDoctor(true);
      setError("");

      const response = await api.get("/doctors");

      console.log(
        "Doctor Appointments - Doctors API:",
        response.data
      );

      let doctorList = [];

      if (Array.isArray(response.data)) {
        doctorList = response.data;
      } else if (
        Array.isArray(response.data?.doctors)
      ) {
        doctorList = response.data.doctors;
      } else if (
        Array.isArray(response.data?.data)
      ) {
        doctorList = response.data.data;
      }

      const loggedInEmail = String(
        user?.email || ""
      )
        .trim()
        .toLowerCase();

      const matchedDoctor = doctorList.find(
        (item) =>
          String(item?.email || "")
            .trim()
            .toLowerCase() === loggedInEmail
      );

      if (!matchedDoctor) {
        setDoctor(null);

        setError(
          "Doctor profile could not be found for the logged-in email address."
        );

        return;
      }

      setDoctor(matchedDoctor);
    } catch (error) {
      console.error(
        "Unable to load doctor:",
        error
      );

      setDoctor(null);

      setError(
        error.response?.data?.message ||
          "Unable to load doctor information."
      );
    } finally {
      setLoadingDoctor(false);
    }
  }

  async function fetchAppointments(doctorId) {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/appointments"
      );

      console.log(
        "Doctor Appointments - Appointments API:",
        response.data
      );

      let appointmentList = [];

      if (Array.isArray(response.data)) {
        appointmentList = response.data;
      } else if (
        Array.isArray(
          response.data?.appointments
        )
      ) {
        appointmentList =
          response.data.appointments;
      } else if (
        Array.isArray(response.data?.data)
      ) {
        appointmentList =
          response.data.data;
      }

      const loggedDoctorId = String(
        doctorId || ""
      );

      const filteredAppointments =
        appointmentList.filter(
          (appointment) => {
            const appointmentDoctor =
              appointment?.doctor;

            if (
              appointmentDoctor &&
              typeof appointmentDoctor ===
                "object"
            ) {
              return (
                String(
                  appointmentDoctor?._id || ""
                ) === loggedDoctorId
              );
            }

            return (
              String(
                appointmentDoctor || ""
              ) === loggedDoctorId ||
              String(
                appointment?.doctorId || ""
              ) === loggedDoctorId
            );
          }
        );

      setAppointments(
        filteredAppointments
      );
    } catch (error) {
      console.error(
        "Unable to load doctor appointments:",
        error
      );

      setAppointments([]);

      setError(
        error.response?.data?.message ||
          "Unable to load appointment information."
      );
    } finally {
      setLoading(false);
    }
  }

  function getAppointmentDate(
    appointment
  ) {
    return (
      appointment?.appointmentDate ||
      appointment?.date ||
      appointment?.scheduledDate ||
      ""
    );
  }

  function getAppointmentTime(
    appointment
  ) {
    return (
      appointment?.appointmentTime ||
      appointment?.time ||
      appointment?.scheduledTime ||
      "-"
    );
  }

  function getAppointmentStatus(
    appointment
  ) {
    return (
      appointment?.status ||
      appointment?.appointmentStatus ||
      "Pending"
    );
  }

  function getPatientName(
    appointment
  ) {
    const patient =
      appointment?.patient;

    if (
      patient &&
      typeof patient === "object"
    ) {
      return (
        patient?.fullName ||
        patient?.name ||
        "Patient"
      );
    }

    return (
      appointment?.patientName ||
      appointment?.patientFullName ||
      "Patient"
    );
  }

  function getPatientEmail(
    appointment
  ) {
    const patient =
      appointment?.patient;

    if (
      patient &&
      typeof patient === "object"
    ) {
      return (
        patient?.email ||
        "-"
      );
    }

    return (
      appointment?.patientEmail ||
      "-"
    );
  }

  function getPatientPhone(
    appointment
  ) {
    const patient =
      appointment?.patient;

    if (
      patient &&
      typeof patient === "object"
    ) {
      return (
        patient?.phone ||
        patient?.phoneNumber ||
        "-"
      );
    }

    return (
      appointment?.patientPhone ||
      "-"
    );
  }

  function getDepartment(
    appointment
  ) {
    const department =
      appointment?.department;

    if (
      department &&
      typeof department === "object"
    ) {
      return (
        department?.name ||
        department?.departmentName ||
        "-"
      );
    }

    return (
      department ||
      appointment?.departmentName ||
      "-"
    );
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "-";
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

  function getStatusClass(status) {
    return String(status)
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function isToday(value) {
    if (!value) {
      return false;
    }

    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return false;
    }

    const today = new Date();

    return (
      date.getDate() ===
        today.getDate() &&
      date.getMonth() ===
        today.getMonth() &&
      date.getFullYear() ===
        today.getFullYear()
    );
  }

  const filteredAppointments =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return appointments.filter(
        (appointment) => {
          const patientName =
            getPatientName(
              appointment
            ).toLowerCase();

          const patientEmail =
            getPatientEmail(
              appointment
            ).toLowerCase();

          const department =
            getDepartment(
              appointment
            ).toLowerCase();

          const reason = String(
            appointment?.reason || ""
          ).toLowerCase();

          const appointmentStatus =
            getAppointmentStatus(
              appointment
            ).toLowerCase();

          const matchesSearch =
            !search ||
            patientName.includes(search) ||
            patientEmail.includes(search) ||
            department.includes(search) ||
            reason.includes(search);

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

  const todayAppointments =
    appointments.filter(
      (appointment) =>
        isToday(
          getAppointmentDate(
            appointment
          )
        )
    ).length;

  const pendingAppointments =
    appointments.filter(
      (appointment) =>
        getAppointmentStatus(
          appointment
        ).toLowerCase() ===
        "pending"
    ).length;

  const confirmedAppointments =
    appointments.filter(
      (appointment) =>
        getAppointmentStatus(
          appointment
        ).toLowerCase() ===
        "confirmed"
    ).length;

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        getAppointmentStatus(
          appointment
        ).toLowerCase() ===
        "completed"
    ).length;

  async function handleStatusUpdate(
    appointment,
    newStatus
  ) {
    if (!appointment?._id) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to change this appointment status to "${newStatus}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await api.patch(
        `/appointments/${appointment._id}/status`,
        {
          status: newStatus,
        }
      );

      await fetchAppointments(
        doctor?._id
      );

      setSelectedAppointment(
        null
      );
    } catch (error) {
      console.error(
        "Unable to update appointment status:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update appointment status."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRefresh() {
    setError("");

    if (!doctor?._id) {
      await loadDoctor();
      return;
    }

    await fetchAppointments(
      doctor._id
    );
  }

  function getActionButtons(
    appointment
  ) {
    const status =
      getAppointmentStatus(
        appointment
      ).toLowerCase();

    return (
      <div className="doctor-appointment-actions">

        <button
          type="button"
          className="doctor-view-button"
          onClick={() =>
            setSelectedAppointment(
              appointment
            )
          }
        >
          View
        </button>

        {status === "pending" && (
          <button
            type="button"
            className="doctor-confirm-button"
            disabled={actionLoading}
            onClick={() =>
              handleStatusUpdate(
                appointment,
                "Confirmed"
              )
            }
          >
            Confirm
          </button>
        )}

        {status === "confirmed" && (
          <button
            type="button"
            className="doctor-complete-button"
            disabled={actionLoading}
            onClick={() =>
              handleStatusUpdate(
                appointment,
                "Completed"
              )
            }
          >
            Complete
          </button>
        )}

        {(status === "pending" ||
          status === "confirmed") && (
          <button
            type="button"
            className="doctor-cancel-button"
            disabled={actionLoading}
            onClick={() =>
              handleStatusUpdate(
                appointment,
                "Cancelled"
              )
            }
          >
            Cancel
          </button>
        )}

      </div>
    );
  }

  if (
    loadingDoctor &&
    !doctor
  ) {
    return (
      <div className="doctor-appointments-page">

        <div className="doctor-appointments-loading">

          <div className="doctor-appointments-spinner"></div>

          <p>
            Loading doctor information...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="doctor-appointments-page">

      <div className="doctor-appointments-header">

        <div>
          <h2>
            Appointments
          </h2>

          <p>
            Manage your scheduled patient
            appointments.
          </p>
        </div>

        <button
          type="button"
          className="doctor-appointments-refresh"
          onClick={handleRefresh}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>

      {error && (
        <div className="doctor-appointments-error">
          {error}
        </div>
      )}

      <div className="doctor-appointments-summary">

        <div className="doctor-appointment-summary-card">

          <span>
            Total Appointments
          </span>

          <strong>
            {totalAppointments}
          </strong>

          <p>
            All your appointments
          </p>

        </div>

        <div className="doctor-appointment-summary-card">

          <span>
            Today's Appointments
          </span>

          <strong>
            {todayAppointments}
          </strong>

          <p>
            Scheduled for today
          </p>

        </div>

        <div className="doctor-appointment-summary-card">

          <span>
            Pending
          </span>

          <strong>
            {pendingAppointments}
          </strong>

          <p>
            Waiting for confirmation
          </p>

        </div>

        <div className="doctor-appointment-summary-card">

          <span>
            Confirmed
          </span>

          <strong>
            {confirmedAppointments}
          </strong>

          <p>
            Confirmed appointments
          </p>

        </div>

        <div className="doctor-appointment-summary-card">

          <span>
            Completed
          </span>

          <strong>
            {completedAppointments}
          </strong>

          <p>
            Completed visits
          </p>

        </div>

      </div>

      <div className="doctor-appointments-filter-card">

        <div className="doctor-search-wrapper">

          <input
            type="text"
            placeholder="Search patient, email, department or reason..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>

        <div className="doctor-status-filter-wrapper">

          <label>
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All
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

      </div>


      <div className="doctor-appointments-card">

        <div className="doctor-appointments-card-header">

          <div>
            <h3>
              Appointment List
            </h3>

            <p>
              {filteredAppointments.length} appointment
              {filteredAppointments.length === 1
                ? ""
                : "s"} found
            </p>
          </div>

        </div>

        {loading ? (
          <div className="doctor-appointments-loading">

            <div className="doctor-appointments-spinner"></div>

            <p>
              Loading appointments...
            </p>

          </div>
        ) : filteredAppointments.length ===
          0 ? (
          <div className="doctor-appointments-empty">

            <div className="doctor-empty-icon">
              📅
            </div>

            <h4>
              No appointments found
            </h4>

            <p>
              No appointments match your
              current search or filter.
            </p>

          </div>
        ) : (
          <div className="doctor-appointments-table-wrapper">

            <table className="doctor-appointments-table">

              <thead>
                <tr>
                  <th>
                    Patient
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
                        appointment._id
                      }
                    >

                      <td>
                        <div className="doctor-patient-info">

                          <div className="doctor-patient-avatar">
                            {getPatientName(
                              appointment
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {getPatientName(
                                appointment
                              )}
                            </strong>

                            <span>
                              {getPatientEmail(
                                appointment
                              )}
                            </span>

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
                        {getAppointmentTime(
                          appointment
                        )}
                      </td>

                      <td>
                        <span className="doctor-reason-text">
                          {appointment?.reason ||
                            "Consultation"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`doctor-appointment-status ${getStatusClass(
                            getAppointmentStatus(
                              appointment
                            )
                          )}`}
                        >
                          {getAppointmentStatus(
                            appointment
                          )}
                        </span>
                      </td>

                      <td>
                        {getActionButtons(
                          appointment
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {selectedAppointment && (
        <div
          className="doctor-appointment-modal-overlay"
          onClick={() =>
            setSelectedAppointment(
              null
            )
          }
        >

          <div
            className="doctor-appointment-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="doctor-appointment-modal-header">

              <div>
                <h3>
                  Appointment Details
                </h3>

                <p>
                  Complete appointment
                  information.
                </p>
              </div>

              <button
                type="button"
                className="doctor-modal-close"
                onClick={() =>
                  setSelectedAppointment(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="doctor-appointment-modal-body">

              {/* Patient */}

              <div className="doctor-modal-section">

                <h4>
                  Patient Information
                </h4>

                <div className="doctor-modal-grid">

                  <div>
                    <label>
                      Patient Name
                    </label>

                    <strong>
                      {getPatientName(
                        selectedAppointment
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>
                      Email
                    </label>

                    <strong>
                      {getPatientEmail(
                        selectedAppointment
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>
                      Phone
                    </label>

                    <strong>
                      {getPatientPhone(
                        selectedAppointment
                      )}
                    </strong>
                  </div>

                </div>

              </div>

              {/* Appointment */}

              <div className="doctor-modal-section">

                <h4>
                  Appointment Information
                </h4>

                <div className="doctor-modal-grid">

                  <div>
                    <label>
                      Department
                    </label>

                    <strong>
                      {getDepartment(
                        selectedAppointment
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>
                      Date
                    </label>

                    <strong>
                      {formatDate(
                        getAppointmentDate(
                          selectedAppointment
                        )
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>
                      Time
                    </label>

                    <strong>
                      {getAppointmentTime(
                        selectedAppointment
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>
                      Status
                    </label>

                    <span
                      className={`doctor-appointment-status ${getStatusClass(
                        getAppointmentStatus(
                          selectedAppointment
                        )
                      )}`}
                    >
                      {getAppointmentStatus(
                        selectedAppointment
                      )}
                    </span>
                  </div>

                  <div className="doctor-modal-full-width">
                    <label>
                      Reason
                    </label>

                    <strong>
                      {selectedAppointment?.reason ||
                        "Consultation"}
                    </strong>
                  </div>

                  {selectedAppointment?.notes && (
                    <div className="doctor-modal-full-width">
                      <label>
                        Notes
                      </label>

                      <strong>
                        {selectedAppointment.notes}
                      </strong>
                    </div>
                  )}

                </div>

              </div>

            </div>

            <div className="doctor-appointment-modal-footer">

              {(() => {
                const status =
                  getAppointmentStatus(
                    selectedAppointment
                  ).toLowerCase();

                return (
                  <>
                    {status ===
                      "pending" && (
                      <button
                        type="button"
                        className="doctor-confirm-button"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          handleStatusUpdate(
                            selectedAppointment,
                            "Confirmed"
                          )
                        }
                      >
                        Confirm Appointment
                      </button>
                    )}

                    {status ===
                      "confirmed" && (
                      <button
                        type="button"
                        className="doctor-complete-button"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          handleStatusUpdate(
                            selectedAppointment,
                            "Completed"
                          )
                        }
                      >
                        Mark Completed
                      </button>
                    )}

                    {(status ===
                      "pending" ||
                      status ===
                        "confirmed") && (
                      <button
                        type="button"
                        className="doctor-cancel-button"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          handleStatusUpdate(
                            selectedAppointment,
                            "Cancelled"
                          )
                        }
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      type="button"
                      className="doctor-modal-close-button"
                      onClick={() =>
                        setSelectedAppointment(
                          null
                        )
                      }
                    >
                      Close
                    </button>
                  </>
                );
              })()}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default DoctorAppointments;