import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "./PatientDashboard.css";

const API_BASE_URL =
  "https://hospital-management-system-nvjt.onrender.com/api";

const DOCTORS_URL = `${API_BASE_URL}/doctors`;
const APPOINTMENTS_URL = `${API_BASE_URL}/appointments`;

function PatientDashboard() {
  const [user, setUser] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingAppointments, setLoadingAppointments] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadUser();
    fetchDoctors();
    fetchAppointments();
  }, []);
  function loadUser() {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setUser(null);
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "Unable to load logged-in user:",
        error
      );

      setUser(null);
    }
  }

  async function fetchDoctors() {
    try {
      setLoadingDoctors(true);

      const response = await axios.get(DOCTORS_URL);

      console.log(
        "Patient dashboard doctors:",
        response.data
      );

      let doctorData = [];

      if (Array.isArray(response.data)) {
        doctorData = response.data;
      } else if (
        Array.isArray(response.data.doctors)
      ) {
        doctorData = response.data.doctors;
      } else if (
        Array.isArray(response.data.data)
      ) {
        doctorData = response.data.data;
      }

      setDoctors(doctorData);
    } catch (error) {
      console.error(
        "Unable to load doctors:",
        error
      );

      setDoctors([]);

      setError(
        error.response?.data?.message ||
          "Unable to load doctor information."
      );
    } finally {
      setLoadingDoctors(false);
    }
  }
  async function fetchAppointments() {
    try {
      setLoadingAppointments(true);

      const response =
        await axios.get(APPOINTMENTS_URL);

      console.log(
        "Patient dashboard appointments:",
        response.data
      );

      let appointmentData = [];

      if (Array.isArray(response.data)) {
        appointmentData = response.data;
      } else if (
        Array.isArray(
          response.data.appointments
        )
      ) {
        appointmentData =
          response.data.appointments;
      } else if (
        Array.isArray(response.data.data)
      ) {
        appointmentData =
          response.data.data;
      }

      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        const currentUser =
          JSON.parse(storedUser);

        const patientId =
          currentUser?.id;

        if (patientId) {
          appointmentData =
            appointmentData.filter(
              (appointment) => {

                const appointmentPatient =
                  appointment?.patient;

                if (
                  appointmentPatient &&
                  typeof appointmentPatient ===
                    "object"
                ) {
                  return (
                    appointmentPatient._id ===
                    patientId
                  );
                }

                return (
                  appointmentPatient ===
                  patientId ||
                  appointment?.patientId ===
                  patientId
                );
              }
            );
        }
      }

      setAppointments(
        appointmentData
      );
    } catch (error) {
      console.error(
        "Unable to load appointments:",
        error
      );

      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
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

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
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

  function getDoctorName(doctor) {
    const name =
      doctor?.fullName ||
      doctor?.name ||
      "Unknown Doctor";

    if (
      name.toLowerCase().startsWith("dr.")
    ) {
      return name;
    }

    return `Dr. ${name}`;
  }

  function getAppointmentDoctorName(
    appointment
  ) {
    const doctor =
      appointment?.doctor;

    const name =
      doctor?.fullName ||
      doctor?.name ||
      appointment?.doctorName ||
      "Unknown Doctor";

    if (
      name.toLowerCase().startsWith("dr.")
    ) {
      return name;
    }

    return `Dr. ${name}`;
  }

  function getAppointmentDepartment(
    appointment
  ) {
    return (
      appointment?.department ||
      appointment?.doctor?.department ||
      "Not assigned"
    );
  }
  function getAppointmentStatus(
    appointment
  ) {
    return (
      appointment?.status ||
      "Pending"
    );
  }

  const availableDoctors =
    useMemo(() => {
      return doctors.filter(
        (doctor) => {
          const status =
            String(
              doctor?.status || ""
            ).toLowerCase();

          return (
            !status ||
            status === "available"
          );
        }
      );
    }, [doctors]);
 
  const upcomingAppointments =
    useMemo(() => {
      const now = new Date();

      return appointments
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
  function handleRefresh() {
    setError("");

    loadUser();
    fetchDoctors();
    fetchAppointments();
  }

  if (
    loadingDoctors &&
    loadingAppointments
  ) {
    return (
      <div className="patient-dashboard-page">

        <div className="patient-dashboard-loading">
          Loading your dashboard...
        </div>

      </div>
    );
  }

  return (
    <div className="patient-dashboard-page">

      <div className="patient-dashboard-header">

        <div>
          <h2>
            Welcome back,{" "}
            {user?.fullName || "Patient"}
          </h2>

          <p>
            Here is your health and
            appointment overview.
          </p>
        </div>

        <button
          type="button"
          className="patient-refresh-button"
          onClick={handleRefresh}
        >
          ↻ Refresh
        </button>

      </div>

      {error && (
        <div className="patient-dashboard-error">
          {error}
        </div>
      )}

      <div className="patient-profile-card">

        <div className="patient-profile-avatar">
          {user?.fullName
            ?.charAt(0)
            .toUpperCase() || "P"}
        </div>

        <div className="patient-profile-info">

          <h3>
            {user?.fullName ||
              "Patient"}
          </h3>

          <p>
            {user?.email ||
              "Email not available"}
          </p>

          <span>
            Patient
          </span>

        </div>

      </div>

      <div className="patient-summary-grid">

        <div className="patient-summary-card">

          <span>
            Total Appointments
          </span>

          <strong>
            {appointments.length}
          </strong>

          <p>
            Your appointments
          </p>

        </div>


        <div className="patient-summary-card">

          <span>
            Upcoming
          </span>

          <strong>
            {upcomingAppointments.length}
          </strong>

          <p>
            Scheduled appointments
          </p>

        </div>


        <div className="patient-summary-card">

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


        <div className="patient-summary-card">

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

      <div className="patient-dashboard-section">

        <div className="patient-section-header">

          <div>

            <h3>
              Upcoming Appointment
            </h3>

            <p>
              Your next scheduled
              hospital visit.
            </p>

          </div>

        </div>


        {upcomingAppointments.length === 0 ? (

          <div className="patient-empty-state">

            <h4>
              No upcoming appointments
            </h4>

            <p>
              You currently don't have
              a scheduled appointment.
            </p>

          </div>

        ) : (

          <div className="upcoming-appointment-card">

            <div className="appointment-doctor-avatar">
              {getAppointmentDoctorName(
                upcomingAppointments[0]
              )
                .replace("Dr. ", "")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="upcoming-appointment-info">

              <h4>
                {getAppointmentDoctorName(
                  upcomingAppointments[0]
                )}
              </h4>

              <p>
                {getAppointmentDepartment(
                  upcomingAppointments[0]
                )}
              </p>

              <div className="appointment-date-info">

                <span>
                  {formatDate(
                    getAppointmentDate(
                      upcomingAppointments[0]
                    )
                  )}
                </span>

                <span>
                  {getAppointmentTime(
                    upcomingAppointments[0]
                  )}
                </span>

              </div>

            </div>


            <span
              className={`patient-status-badge ${getAppointmentStatus(
                upcomingAppointments[0]
              )
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              {getAppointmentStatus(
                upcomingAppointments[0]
              )}
            </span>

          </div>

        )}

      </div>

      <div className="patient-dashboard-section">

        <div className="patient-section-header">

          <div>

            <h3>
              Available Doctors
            </h3>

            <p>
              Doctors currently available
              for consultation.
            </p>

          </div>

        </div>


        {loadingDoctors ? (

          <div className="patient-empty-state">
            Loading doctors...
          </div>

        ) : availableDoctors.length === 0 ? (

          <div className="patient-empty-state">

            <h4>
              No available doctors
            </h4>

            <p>
              There are currently no
              doctors marked as available.
            </p>

          </div>

        ) : (

          <div className="available-doctors-grid">

            {availableDoctors
              .slice(0, 6)
              .map((doctor) => (

                <div
                  className="available-doctor-card"
                  key={doctor._id}
                >

                  <div className="available-doctor-avatar">
                    {doctor.fullName
                      ?.charAt(0)
                      .toUpperCase() || "D"}
                  </div>

                  <div className="available-doctor-info">

                    <h4>
                      {getDoctorName(
                        doctor
                      )}
                    </h4>

                    <p>
                      {doctor.specialization ||
                        "Specialist"}
                    </p>

                    <span>
                      {doctor.department ||
                        "Department not assigned"}
                    </span>

                  </div>


                  <div className="doctor-availability">

                    <span className="availability-dot"></span>

                    Available

                  </div>

                </div>

              ))}

          </div>

        )}

      </div>

      <div className="patient-dashboard-section">

        <div className="patient-section-header">

          <div>

            <h3>
              My Recent Appointments
            </h3>

            <p>
              Your latest appointment
              records.
            </p>

          </div>

        </div>


        {appointments.length === 0 ? (

          <div className="patient-empty-state">

            <h4>
              No appointment records
            </h4>

            <p>
              Your appointment history
              will appear here.
            </p>

          </div>

        ) : (

          <div className="patient-appointment-table">

            <div className="patient-table-header">

              <span>
                Doctor
              </span>

              <span>
                Department
              </span>

              <span>
                Date
              </span>

              <span>
                Time
              </span>

              <span>
                Status
              </span>

            </div>


            {appointments
              .slice(0, 5)
              .map((appointment) => (

                <div
                  className="patient-table-row"
                  key={
                    appointment._id
                  }
                >

                  <span>
                    {getAppointmentDoctorName(
                      appointment
                    )}
                  </span>

                  <span>
                    {getAppointmentDepartment(
                      appointment
                    )}
                  </span>

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

                  <span>

                    <span
                      className={`patient-status-badge ${getAppointmentStatus(
                        appointment
                      )
                        .toLowerCase()
                        .replace(
                          /\s+/g,
                          "-"
                        )}`}
                    >
                      {getAppointmentStatus(
                        appointment
                      )}
                    </span>

                  </span>

                </div>

              ))}

          </div>

        )}

      </div>


      {/* ==================================================
          PROFILE INFORMATION
      ================================================== */}

      <div className="patient-dashboard-section">

        <div className="patient-section-header">

          <div>

            <h3>
              My Profile
            </h3>

            <p>
              Your registered account
              information.
            </p>

          </div>

        </div>


        <div className="patient-profile-details">

          <div>
            <label>
              Full Name
            </label>

            <strong>
              {user?.fullName ||
                "Not available"}
            </strong>
          </div>


          <div>
            <label>
              Email Address
            </label>

            <strong>
              {user?.email ||
                "Not available"}
            </strong>
          </div>


          <div>
            <label>
              Phone
            </label>

            <strong>
              {user?.phone ||
                "Not provided"}
            </strong>
          </div>


          <div>
            <label>
              Role
            </label>

            <strong>
              Patient
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default PatientDashboard;