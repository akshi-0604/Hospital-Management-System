import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "./Dashboard.css";

const API_BASE_URL =
  "https://hospital-management-system-nvjt.onrender.com/api";

const PATIENTS_URL = `${API_BASE_URL}/patients`;
const DOCTORS_URL = `${API_BASE_URL}/doctors`;
const APPOINTMENTS_URL = `${API_BASE_URL}/appointments`;

function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        axios.get(PATIENTS_URL),
        axios.get(DOCTORS_URL),
        axios.get(APPOINTMENTS_URL),
      ]);

      let patientsData = [];
      let doctorsData = [];
      let appointmentsData = [];

      if (results[0].status === "fulfilled") {
        const data = results[0].value.data;

        if (Array.isArray(data)) {
          patientsData = data;
        } else if (Array.isArray(data?.patients)) {
          patientsData = data.patients;
        } else if (Array.isArray(data?.data)) {
          patientsData = data.data;
        }
      } else {
        console.error(
          "Patients API error:",
          results[0].reason
        );
      }
      if (results[1].status === "fulfilled") {
        const data = results[1].value.data;

        if (Array.isArray(data)) {
          doctorsData = data;
        } else if (Array.isArray(data?.doctors)) {
          doctorsData = data.doctors;
        } else if (Array.isArray(data?.data)) {
          doctorsData = data.data;
        }
      } else {
        console.error(
          "Doctors API error:",
          results[1].reason
        );
      }

      if (results[2].status === "fulfilled") {
        const data = results[2].value.data;

        if (Array.isArray(data)) {
          appointmentsData = data;
        } else if (Array.isArray(data?.appointments)) {
          appointmentsData = data.appointments;
        } else if (Array.isArray(data?.data)) {
          appointmentsData = data.data;
        }
      } else {
        console.error(
          "Appointments API error:",
          results[2].reason
        );
      }

      setPatients(patientsData);
      setDoctors(doctorsData);
      setAppointments(appointmentsData);

      const allFailed = results.every(
        (result) => result.status === "rejected"
      );

      if (allFailed) {
        setError(
          "Unable to load dashboard data. Please check the backend."
        );
      }
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

      setError(
        "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  const totalDepartments = useMemo(() => {
    const departments = doctors
      .map((doctor) =>
        String(doctor?.department || "")
          .trim()
          .toLowerCase()
      )
      .filter(Boolean);

    return new Set(departments).size;
  }, [doctors]);

  function isToday(value) {
    if (!value) {
      return false;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  const todaysAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      return isToday(
        appointment?.appointmentDate ||
          appointment?.date ||
          appointment?.scheduledDate
      );
    });
  }, [appointments]);

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => {
        const dateA = new Date(
          a?.appointmentDate ||
            a?.date ||
            a?.scheduledDate ||
            a?.createdAt ||
            0
        ).getTime();

        const dateB = new Date(
          b?.appointmentDate ||
            b?.date ||
            b?.scheduledDate ||
            b?.createdAt ||
            0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [appointments]);

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

  function formatTime(value) {
    if (!value) {
      return "-";
    }

    return value;
  }

  function getPatientName(appointment) {
    const patient = appointment?.patient;

    if (
      patient &&
      typeof patient === "object"
    ) {
      return (
        patient.fullName ||
        patient.name ||
        "Unknown Patient"
      );
    }

    return (
      appointment?.patientName ||
      appointment?.patientFullName ||
      "Unknown Patient"
    );
  }

  function getDoctorName(appointment) {
    const doctor = appointment?.doctor;

    let name = "";

    if (
      doctor &&
      typeof doctor === "object"
    ) {
      name =
        doctor.fullName ||
        doctor.name ||
        "";
    } else {
      name =
        appointment?.doctorName ||
        appointment?.doctorFullName ||
        "";
    }

    if (!name) {
      return "Unknown Doctor";
    }

    return name.startsWith("Dr.")
      ? name
      : `Dr. ${name}`;
  }

  function getDepartment(appointment) {
    return (
      appointment?.department ||
      appointment?.doctor?.department ||
      "Not assigned"
    );
  }

  function getAppointmentDate(appointment) {
    return (
      appointment?.appointmentDate ||
      appointment?.date ||
      appointment?.scheduledDate ||
      ""
    );
  }

  function getAppointmentTime(appointment) {
    return (
      appointment?.appointmentTime ||
      appointment?.time ||
      appointment?.scheduledTime ||
      "-"
    );
  }

  function getAppointmentStatus(appointment) {
    return (
      appointment?.status ||
      "Pending"
    );
  }

  function getStatusClass(status) {
    return String(status)
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function handleRefresh() {
    loadDashboardData();
  }
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h2>Hospital Overview</h2>

            <p>
              Here is what's happening in your hospital today.
            </p>
          </div>
        </div>

        <div className="dashboard-loading">
          Loading dashboard data...
        </div>
      </div>
    );
  }
  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>
          <h2>Hospital Overview</h2>

          <p>
            Here is what's happening in your hospital today.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh-button"
          onClick={handleRefresh}
        >
          ↻ Refresh
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}


      {/* SUMMARY CARDS */}

      <div className="dashboard-cards">

        {/* TOTAL PATIENTS */}

        <div className="dashboard-card">

          <span>
            Total Patients
          </span>

          <strong>
            {patients.length}
          </strong>

          <p>
            Registered patients
          </p>

        </div>


        {/* TOTAL DOCTORS */}

        <div className="dashboard-card">

          <span>
            Total Doctors
          </span>

          <strong>
            {doctors.length}
          </strong>

          <p>
            Registered doctors
          </p>

        </div>


        {/* TOTAL DEPARTMENTS */}

        <div className="dashboard-card">

          <span>
            Total Departments
          </span>

          <strong>
            {totalDepartments}
          </strong>

          <p>
            Hospital departments
          </p>

        </div>


        {/* TOTAL APPOINTMENTS */}

        <div className="dashboard-card">

          <span>
            Total Appointments
          </span>

          <strong>
            {appointments.length}
          </strong>

          <p>
            All scheduled appointments
          </p>

        </div>

        <div className="dashboard-card">

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

        <div className="dashboard-card">

          <span>
            Today's Revenue
          </span>

          <strong>
            —
          </strong>

          <p>
            Available after billing integration
          </p>

        </div>

      </div>


      {/* RECENT APPOINTMENTS */}

      <div className="dashboard-section">

        <div className="dashboard-section-header">

          <div>
            <h3>
              Recent Appointments
            </h3>

            <p>
              Latest appointment records from the database.
            </p>
          </div>

        </div>


        {recentAppointments.length === 0 ? (

          <div className="dashboard-empty">

            <h4>
              No appointments yet
            </h4>

            <p>
              Create an appointment from the Appointments module.
            </p>

          </div>

        ) : (

          <div className="appointment-table">

            <div className="table-header">

              <span>
                Patient
              </span>

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

            {recentAppointments.map(
              (appointment) => (

                <div
                  className="table-row"
                  key={
                    appointment?._id ||
                    `${getPatientName(
                      appointment
                    )}-${getAppointmentDate(
                      appointment
                    )}`
                  }
                >

                  <span>
                    {
                      getPatientName(
                        appointment
                      )
                    }
                  </span>


                  <span>
                    {
                      getDoctorName(
                        appointment
                      )
                    }
                  </span>


                  <span>
                    {
                      getDepartment(
                        appointment
                      )
                    }
                  </span>


                  <span>
                    {
                      formatDate(
                        getAppointmentDate(
                          appointment
                        )
                      )
                    }
                  </span>


                  <span>
                    {
                      formatTime(
                        getAppointmentTime(
                          appointment
                        )
                      )
                    }
                  </span>


                  <span>

                    <span
                      className={`status ${getStatusClass(
                        getAppointmentStatus(
                          appointment
                        )
                      )}`}
                    >
                      {
                        getAppointmentStatus(
                          appointment
                        )
                      }
                    </span>

                  </span>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Dashboard;