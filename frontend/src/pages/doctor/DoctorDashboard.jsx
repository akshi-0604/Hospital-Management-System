import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "./DoctorDashboard.css";

const API_BASE_URL =
  "https://hospital-management-system-nvjt.onrender.com/api";

const DOCTORS_URL = `${API_BASE_URL}/doctors`;
const APPOINTMENTS_URL = `${API_BASE_URL}/appointments`;

function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [loadingDoctor, setLoadingDoctor] =
    useState(true);

  const [loadingAppointments, setLoadingAppointments] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadLoggedInUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDoctorAndAppointments();
    }
  }, [user]);

  function loadLoggedInUser() {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        setError(
          "Doctor login information was not found. Please login again."
        );
        setLoadingDoctor(false);
        setLoadingAppointments(false);
        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "Unable to read logged-in user:",
        error
      );

      setError(
        "Unable to read your login information."
      );

      setLoadingDoctor(false);
      setLoadingAppointments(false);
    }
  }

  async function fetchDoctorAndAppointments() {
    setError("");

    await Promise.all([
      fetchDoctor(),
      fetchAppointments(),
    ]);
  }

  async function fetchDoctor() {
    try {
      setLoadingDoctor(true);

      const response =
        await axios.get(DOCTORS_URL);

      console.log(
        "Doctor Dashboard - Doctors API:",
        response.data
      );

      let doctorList = [];

      if (Array.isArray(response.data)) {
        doctorList = response.data;
      } else if (
        Array.isArray(
          response.data?.doctors
        )
      ) {
        doctorList =
          response.data.doctors;
      } else if (
        Array.isArray(
          response.data?.data
        )
      ) {
        doctorList =
          response.data.data;
      }

      if (!doctorList.length) {
        setDoctor(null);

        setError(
          "No doctor records were found."
        );

        return;
      }

      const loggedInEmail =
        String(user?.email || "")
          .trim()
          .toLowerCase();

      const matchedDoctor =
        doctorList.find(
          (item) =>
            String(
              item?.email || ""
            )
              .trim()
              .toLowerCase() ===
            loggedInEmail
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
  async function fetchAppointments() {
    try {
      setLoadingAppointments(true);

      const response =
        await axios.get(
          APPOINTMENTS_URL
        );

      console.log(
        "Doctor Dashboard - Appointments API:",
        response.data
      );

      let appointmentList = [];

      if (Array.isArray(response.data)) {
        appointmentList =
          response.data;
      } else if (
        Array.isArray(
          response.data?.appointments
        )
      ) {
        appointmentList =
          response.data.appointments;
      } else if (
        Array.isArray(
          response.data?.data
        )
      ) {
        appointmentList =
          response.data.data;
      }


      if (doctor?._id) {
        const doctorId =
          String(doctor._id);

        appointmentList =
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
                    appointmentDoctor._id
                  ) === doctorId
                );
              }

              return (
                String(
                  appointmentDoctor || ""
                ) === doctorId ||
                String(
                  appointment?.doctorId ||
                    ""
                ) === doctorId
              );
            }
          );
      }

      setAppointments(
        appointmentList
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
      setLoadingAppointments(false);
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

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
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

  function formatTime(value) {
    if (!value) {
      return "-";
    }

    return value;
  }

  function isToday(value) {
    if (!value) {
      return false;
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return false;
    }

    const today =
      new Date();

    return (
      date.getDate() ===
        today.getDate() &&
      date.getMonth() ===
        today.getMonth() &&
      date.getFullYear() ===
        today.getFullYear()
    );
  }

  function getPatientName(
    appointment
  ) {
    const patient =
      appointment?.patient;

    if (
      patient &&
      typeof patient ===
        "object"
    ) {
      return (
        patient.fullName ||
        patient.name ||
        "Patient information unavailable"
      );
    }

    return (
      appointment?.patientName ||
      appointment?.patientFullName ||
      "Patient information unavailable"
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

  function getStatusClass(
    status
  ) {
    return String(status)
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      );
  }

  const todaysAppointments =
    useMemo(() => {
      return [...appointments]
        .filter((appointment) =>
          isToday(
            getAppointmentDate(
              appointment
            )
          )
        )
        .sort((a, b) => {
          const timeA =
            String(
              getAppointmentTime(a)
            );

          const timeB =
            String(
              getAppointmentTime(b)
            );

          return timeA.localeCompare(
            timeB
          );
        });
    }, [appointments]);

  const upcomingAppointments =
    useMemo(() => {
      const now =
        new Date();

      return [...appointments]
        .filter((appointment) => {
          const appointmentDate =
            getAppointmentDate(
              appointment
            );

          if (!appointmentDate) {
            return false;
          }

          const date =
            new Date(
              appointmentDate
            );

          return (
            !Number.isNaN(
              date.getTime()
            ) &&
            date >= now
          );
        })
        .sort((a, b) => {
          const dateA =
            new Date(
              getAppointmentDate(a)
            ).getTime();

          const dateB =
            new Date(
              getAppointmentDate(b)
            ).getTime();

          return dateA - dateB;
        });
    }, [appointments]);

  const confirmedAppointments =
    appointments.filter(
      (appointment) =>
        getAppointmentStatus(
          appointment
        ).toLowerCase() ===
        "confirmed"
    ).length;

  const pendingAppointments =
    appointments.filter(
      (appointment) =>
        getAppointmentStatus(
          appointment
        ).toLowerCase() ===
        "pending"
    ).length;

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        getAppointmentStatus(
          appointment
        ).toLowerCase() ===
        "completed"
    ).length;

  const doctorStatus =
    doctor?.status ||
    "Unavailable";

  const doctorStatusClass =
    String(
      doctorStatus
    )
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      );
  const nextAppointment =
    upcomingAppointments.length >
    0
      ? upcomingAppointments[0]
      : null;

  async function handleRefresh() {
    setError("");

    if (!user) {
      loadLoggedInUser();
      return;
    }

    await fetchDoctorAndAppointments();
  }

  if (
    loadingDoctor &&
    loadingAppointments
  ) {
    return (
      <div className="doctor-dashboard-page">

        <div className="doctor-dashboard-loading">

          <div className="doctor-loading-spinner"></div>

          <p>
            Loading your doctor dashboard...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="doctor-dashboard-page">

      <div className="doctor-dashboard-header">

        <div>

          <h2>
            Welcome back,{" "}
            {doctor?.fullName ||
              user?.fullName ||
              "Doctor"}
          </h2>

          <p>
            Here is your professional and
            appointment overview.
          </p>

        </div>

        <button
          type="button"
          className="doctor-refresh-button"
          onClick={handleRefresh}
        >
          ↻ Refresh
        </button>

      </div>

      {error && (
        <div className="doctor-dashboard-error">
          {error}
        </div>
      )}

      <div className="doctor-profile-card">

        <div className="doctor-profile-avatar">

          {doctor?.fullName
            ?.charAt(0)
            .toUpperCase() ||
            "D"}

        </div>


        <div className="doctor-profile-main">

          <div>

            <h3>
              {doctor?.fullName ||
                "Doctor"}
            </h3>

            <p>
              {doctor?.specialization ||
                "Specialization unavailable"}
            </p>

            <span className="doctor-department">
              {doctor?.department ||
                "Department unavailable"}
            </span>

          </div>


          <span
            className={`doctor-profile-status ${doctorStatusClass}`}
          >
            <span className="status-dot"></span>

            {doctorStatus}

          </span>

        </div>

      </div>

      <div className="doctor-details-card">

        <div className="doctor-section-title">

          <div>

            <h3>
              Professional Information
            </h3>

            <p>
              Your registered professional
              information.
            </p>

          </div>

        </div>


        <div className="doctor-details-grid">

          <div className="doctor-detail-item">
            <label>
              Doctor ID
            </label>
            <strong>
              {doctor?.doctorId ||
                "-"}
            </strong>
          </div>


          <div className="doctor-detail-item">
            <label>
              Email
            </label>
            <strong>
              {doctor?.email ||
                user?.email ||
                "-"}
            </strong>
          </div>


          <div className="doctor-detail-item">
            <label>
              Phone
            </label>
            <strong>
              {doctor?.phone ||
                "-"}
            </strong>
          </div>


          <div className="doctor-detail-item">
            <label>
              Department
            </label>
            <strong>
              {doctor?.department ||
                "-"}
            </strong>
          </div>


          <div className="doctor-detail-item">
            <label>
              Specialization
            </label>
            <strong>
              {doctor?.specialization ||
                "-"}
            </strong>
          </div>


          <div className="doctor-detail-item">
            <label>
              Qualification
            </label>
            <strong>
              {doctor?.qualification ||
                "-"}
            </strong>
          </div>


          <div className="doctor-detail-item">
            <label>
              Experience
            </label>
            <strong>
              {doctor?.experience !==
                undefined
                ? `${doctor.experience} years`
                : "-"}
            </strong>
          </div>


          <div className="doctor-detail-item">
            <label>
              Consultation Fee
            </label>
            <strong>
              {doctor?.consultationFee !==
                undefined
                ? `₹${doctor.consultationFee}`
                : "-"}
            </strong>
          </div>


          <div className="doctor-detail-item">
            <label>
              Gender
            </label>
            <strong>
              {doctor?.gender ||
                "-"}
            </strong>
          </div>


          <div className="doctor-detail-item">
            <label>
              Date of Birth
            </label>
            <strong>
              {formatDate(
                doctor?.dob
              )}
            </strong>
          </div>


          <div className="doctor-detail-item">
            <label>
              Joining Date
            </label>
            <strong>
              {formatDate(
                doctor?.joiningDate
              )}
            </strong>
          </div>


          <div className="doctor-detail-item">
            <label>
              Current Status
            </label>

            <strong>
              {doctorStatus}
            </strong>

          </div>

        </div>

      </div>
      <div className="doctor-summary-grid">

        <div className="doctor-summary-card">

          <span>
            Total Appointments
          </span>

          <strong>
            {appointments.length}
          </strong>

          <p>
            Your scheduled appointments
          </p>

        </div>


        <div className="doctor-summary-card">

          <span>
            Today's Appointments
          </span>

          <strong>
            {todaysAppointments.length}
          </strong>

          <p>
            Appointments scheduled today
          </p>

        </div>


        <div className="doctor-summary-card">

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


        <div className="doctor-summary-card">

          <span>
            Completed
          </span>

          <strong>
            {completedAppointments}
          </strong>

          <p>
            Completed appointments
          </p>

        </div>

      </div>
      <div className="doctor-dashboard-section">

        <div className="doctor-section-title">

          <div>

            <h3>
              Next Appointment
            </h3>

            <p>
              Your next scheduled patient visit.
            </p>

          </div>

        </div>


        {nextAppointment ? (

          <div className="next-appointment-card">

            <div className="next-appointment-avatar">

              {getPatientName(
                nextAppointment
              )
                .charAt(0)
                .toUpperCase()}

            </div>


            <div className="next-appointment-info">

              <h4>
                {getPatientName(
                  nextAppointment
                )}
              </h4>

              <p>
                {getAppointmentDate(
                  nextAppointment
                )
                  ? formatDate(
                      getAppointmentDate(
                        nextAppointment
                      )
                    )
                  : "-"}

                {" • "}

                {getAppointmentTime(
                  nextAppointment
                )}
              </p>

              <span>
                {nextAppointment?.reason ||
                  "Consultation"}
              </span>

            </div>


            <span
              className={`doctor-status-badge ${getStatusClass(
                getAppointmentStatus(
                  nextAppointment
                )
              )}`}
            >
              {getAppointmentStatus(
                nextAppointment
              )}
            </span>

          </div>

        ) : (

          <div className="doctor-empty-state">

            <h4>
              No upcoming appointments
            </h4>

            <p>
              You don't have any upcoming
              patient appointments.
            </p>

          </div>

        )}

      </div>

      <div className="doctor-dashboard-section">

        <div className="doctor-section-title">

          <div>

            <h3>
              Today's Schedule
            </h3>

            <p>
              Patients scheduled for today.
            </p>

          </div>

        </div>


        {todaysAppointments.length ===
        0 ? (

          <div className="doctor-empty-state">

            <h4>
              No appointments today
            </h4>

            <p>
              You currently have no
              scheduled appointments for today.
            </p>

          </div>

        ) : (

          <div className="doctor-schedule-table">

            <div className="doctor-table-header">

              <span>
                Time
              </span>

              <span>
                Patient
              </span>

              <span>
                Reason
              </span>

              <span>
                Status
              </span>

            </div>


            {todaysAppointments.map(
              (appointment) => (

                <div
                  className="doctor-table-row"
                  key={
                    appointment._id
                  }
                >

                  <span>
                    {getAppointmentTime(
                      appointment
                    )}
                  </span>

                  <span className="doctor-patient-cell">

                    <span className="small-patient-avatar">

                      {getPatientName(
                        appointment
                      )
                        .charAt(0)
                        .toUpperCase()}

                    </span>

                    <strong>
                      {getPatientName(
                        appointment
                      )}
                    </strong>

                  </span>

                  <span>
                    {appointment?.reason ||
                      "Consultation"}
                  </span>

                  <span>

                    <span
                      className={`doctor-status-badge ${getStatusClass(
                        getAppointmentStatus(
                          appointment
                        )
                      )}`}
                    >
                      {getAppointmentStatus(
                        appointment
                      )}
                    </span>

                  </span>

                </div>

              )
            )}

          </div>

        )}

      </div>

      <div className="doctor-dashboard-section">

        <div className="doctor-section-title">

          <div>

            <h3>
              Upcoming Appointments
            </h3>

            <p>
              Your upcoming patient schedule.
            </p>

          </div>

        </div>


        {upcomingAppointments.length ===
        0 ? (

          <div className="doctor-empty-state">

            <h4>
              No upcoming appointments
            </h4>

            <p>
              New scheduled appointments
              will appear here.
            </p>

          </div>

        ) : (

          <div className="doctor-upcoming-grid">

            {upcomingAppointments
              .slice(0, 6)
              .map(
                (appointment) => (

                  <div
                    className="doctor-upcoming-card"
                    key={
                      appointment._id
                    }
                  >

                    <div className="upcoming-card-top">

                      <div className="small-patient-avatar">

                        {getPatientName(
                          appointment
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </div>


                      <span
                        className={`doctor-status-badge ${getStatusClass(
                          getAppointmentStatus(
                            appointment
                          )
                        )}`}
                      >
                        {getAppointmentStatus(
                          appointment
                        )}
                      </span>

                    </div>


                    <h4>
                      {getPatientName(
                        appointment
                      )}
                    </h4>


                    <p>
                      {appointment?.reason ||
                        "Consultation"}
                    </p>


                    <div className="upcoming-card-date">

                      <span>
                        {formatDate(
                          getAppointmentDate(
                            appointment
                          )
                        )}
                      </span>

                      <span>
                        {getAppointmentTime(
                          appointment
                        )}
                      </span>

                    </div>

                  </div>

                )
              )}

          </div>

        )}

      </div>
      <div className="doctor-dashboard-section">

        <div className="doctor-section-title">

          <div>

            <h3>
              Availability
            </h3>

            <p>
              Your current availability status.
            </p>

          </div>

        </div>


        <div className="availability-panel">

          <div className="availability-main">

            <div
              className={`large-availability-dot ${doctorStatusClass}`}
            ></div>


            <div>

              <h4>
                {doctorStatus}
              </h4>

              <p>
                {doctorStatus ===
                "Available"
                  ? todaysAppointments.length ===
                    0
                    ? "You currently have no appointments scheduled today."
                    : `You have ${todaysAppointments.length} appointment${todaysAppointments.length === 1 ? "" : "s"} scheduled today.`
                  : doctorStatus ===
                    "On Leave"
                  ? "You are currently marked as on leave."
                  : "You are currently marked as unavailable."}
              </p>

            </div>

          </div>


          <div className="availability-stats">

            <div>

              <span>
                Today's Appointments
              </span>

              <strong>
                {todaysAppointments.length}
              </strong>

            </div>


            <div>

              <span>
                Next Appointment
              </span>

              <strong>
                {nextAppointment
                  ? getAppointmentTime(
                      nextAppointment
                    )
                  : "Free"}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DoctorDashboard;