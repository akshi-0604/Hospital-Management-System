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

  const [loadingDoctors, setLoadingDoctors] =
    useState(true);

  const [loadingAppointments, setLoadingAppointments] =
    useState(true);

  const [loadingBooking, setLoadingBooking] =
    useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [showAppointmentModal, setShowAppointmentModal] =
    useState(false);

  const [appointmentForm, setAppointmentForm] =
    useState({
      doctor: "",
      department: "",
      appointmentDate: "",
      appointmentTime: "",
      reason: "",
      notes: "",
    });
  useEffect(() => {
    loadUser();
    fetchDoctors();
    fetchAppointments();
  }, []);

  function loadUser() {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        setUser(null);
        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

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

      const response =
        await axios.get(DOCTORS_URL);

      console.log(
        "Patient dashboard doctors:",
        response.data
      );

      let doctorData = [];

      if (Array.isArray(response.data)) {
        doctorData = response.data;
      } else if (
        Array.isArray(
          response.data?.doctors
        )
      ) {
        doctorData =
          response.data.doctors;
      } else if (
        Array.isArray(
          response.data?.data
        )
      ) {
        doctorData =
          response.data.data;
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
        await axios.get(
          APPOINTMENTS_URL
        );

      console.log(
        "Patient dashboard appointments:",
        response.data
      );

      let appointmentData = [];

      if (Array.isArray(response.data)) {
        appointmentData =
          response.data;
      } else if (
        Array.isArray(
          response.data?.appointments
        )
      ) {
        appointmentData =
          response.data.appointments;
      } else if (
        Array.isArray(
          response.data?.data
        )
      ) {
        appointmentData =
          response.data.data;
      }

      // Get logged-in patient's ID
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        try {
          const currentUser =
            JSON.parse(
              storedUser
            );

          const patientId =
            currentUser?.id ||
            currentUser?._id;

          if (patientId) {
            appointmentData =
              appointmentData.filter(
                (appointment) => {
                  const patient =
                    appointment?.patient;

                  // Populated patient object
                  if (
                    patient &&
                    typeof patient ===
                    "object"
                  ) {
                    return (
                      String(
                        patient._id
                      ) ===
                      String(
                        patientId
                      )
                    );
                  }

                  // Direct patient ID
                  return (
                    String(
                      patient || ""
                    ) ===
                    String(
                      patientId
                    ) ||
                    String(
                      appointment?.patientId ||
                      ""
                    ) ===
                    String(
                      patientId
                    )
                  );
                }
              );
          }
        } catch (error) {
          console.error(
            "Unable to read patient information:",
            error
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

  function getDoctorName(doctor) {
    const name =
      doctor?.fullName ||
      doctor?.name ||
      "Doctor";

    if (
      name
        .toLowerCase()
        .startsWith("dr.")
    ) {
      return name;
    }

    return `Dr. ${name}`;
  }

  function getSelectedDoctor() {
    return doctors.find(
      (doctor) =>
        String(doctor?._id) ===
        String(
          appointmentForm.doctor
        )
    );
  }
  function getAppointmentDoctorName(
    appointment
  ) {
    const doctor =
      appointment?.doctor;

    let name = "";

    if (
      doctor &&
      typeof doctor ===
      "object"
    ) {
      name =
        doctor.fullName ||
        doctor.name ||
        "";
    }

    if (!name) {
      name =
        appointment?.doctorName ||
        appointment?.doctorFullName ||
        "";
    }

    if (!name) {
      return "Doctor information unavailable";
    }

    if (
      name
        .toLowerCase()
        .startsWith("dr.")
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
      "Department not available"
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

  function getAppointmentStatus(
    appointment
  ) {
    return (
      appointment?.status ||
      "Pending"
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

  const availableDoctors =
    useMemo(() => {
      return doctors.filter(
        (doctor) => {
          const status =
            String(
              doctor?.status ||
              ""
            )
              .trim()
              .toLowerCase();

          return (
            !status ||
            status ===
            "available"
          );
        }
      );
    }, [doctors]);
  const upcomingAppointments =
    useMemo(() => {
      const now =
        new Date();

      return [...appointments]
        .filter(
          (appointment) => {
            const dateValue =
              getAppointmentDate(
                appointment
              );

            if (!dateValue) {
              return false;
            }

            const date =
              new Date(
                dateValue
              );

            return (
              !Number.isNaN(
                date.getTime()
              ) &&
              date >= now
            );
          }
        )
        .sort(
          (a, b) => {
            const dateA =
              new Date(
                getAppointmentDate(
                  a
                )
              ).getTime();

            const dateB =
              new Date(
                getAppointmentDate(
                  b
                )
              ).getTime();

            return (
              dateA - dateB
            );
          }
        );
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

  const todayAppointments =
    appointments.filter(
      (appointment) =>
        isToday(
          getAppointmentDate(
            appointment
          )
        )
    );
  function openAppointmentModal() {
    setAppointmentForm({
      doctor: "",
      department: "",
      appointmentDate: "",
      appointmentTime: "",
      reason: "",
      notes: "",
    });

    setError("");
    setSuccessMessage("");

    setShowAppointmentModal(true);
  }

  function closeAppointmentModal() {
    if (loadingBooking) {
      return;
    }

    setShowAppointmentModal(false);

    setAppointmentForm({
      doctor: "",
      department: "",
      appointmentDate: "",
      appointmentTime: "",
      reason: "",
      notes: "",
    });

    setError("");
  }

  function handleAppointmentChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setAppointmentForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    // Automatically set department
    // when doctor is selected
    if (name === "doctor") {
      const selectedDoctor =
        doctors.find(
          (doctor) =>
            String(
              doctor?._id
            ) ===
            String(value)
        );

      setAppointmentForm(
        (previous) => ({
          ...previous,
          doctor: value,
          department:
            selectedDoctor?.department ||
            "",
        })
      );
    }
  }
  async function handleCreateAppointment(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const patientId =
      user?.id ||
      user?._id;

    if (!patientId) {
      setError(
        "Patient information was not found. Please login again."
      );
      return;
    }

    if (
      !appointmentForm.doctor ||
      !appointmentForm.department ||
      !appointmentForm.appointmentDate ||
      !appointmentForm.appointmentTime
    ) {
      setError(
        "Please select a doctor, department, date and time."
      );
      return;
    }

    try {
      setLoadingBooking(true);

      const response =
        await axios.post(
          APPOINTMENTS_URL,
          {
            patient:
              patientId,

            doctor:
              appointmentForm.doctor,

            department:
              appointmentForm.department,

            appointmentDate:
              appointmentForm.appointmentDate,

            appointmentTime:
              appointmentForm.appointmentTime,

            reason:
              appointmentForm.reason,

            notes:
              appointmentForm.notes,

            status: "Pending",
          }
        );

      console.log(
        "Appointment created:",
        response.data
      );

      setSuccessMessage(
        "Appointment booked successfully."
      );

      await fetchAppointments();

      setAppointmentForm({
        doctor: "",
        department: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
        notes: "",
      });

      setTimeout(() => {
        setShowAppointmentModal(
          false
        );

        setSuccessMessage(
          ""
        );
      }, 1000);
    } catch (error) {
      console.error(
        "Create appointment error:",
        error
      );

      setError(
        error.response?.data
          ?.message ||
        "Unable to book appointment. Please try again."
      );
    } finally {
      setLoadingBooking(false);
    }
  }

  async function handleRefresh() {
    setError("");

    loadUser();

    await Promise.all([
      fetchDoctors(),
      fetchAppointments(),
    ]);
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
            {user?.fullName ||
              "Patient"}
          </h2>

          <p>
            Manage your appointments
            and view your hospital
            information.
          </p>

        </div>

        <button
          type="button"
          className="patient-refresh-button"
          onClick={
            handleRefresh
          }
        >
          ↻ Refresh
        </button>

      </div>
      {error &&
        !showAppointmentModal && (
          <div className="patient-dashboard-error">
            {error}
          </div>
        )}

      <div className="patient-profile-card">

        <div className="patient-profile-avatar">
          {user?.fullName
            ?.charAt(0)
            .toUpperCase() ||
            "P"}
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
            {
              appointments.length
            }
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
            {
              upcomingAppointments.length
            }
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
            {
              confirmedAppointments
            }
          </strong>

          <p>
            Confirmed appointments
          </p>

        </div>


        <div className="patient-summary-card">

          <span>
            Pending
          </span>

          <strong>
            {
              pendingAppointments
            }
          </strong>

          <p>
            Waiting for confirmation
          </p>

        </div>

      </div>

      <div className="patient-booking-banner">

        <div>

          <h3>
            Need a Doctor?
          </h3>

          <p>
            Book an appointment with
            an available doctor.
          </p>

        </div>

        <button
          type="button"
          className="book-appointment-button"
          onClick={
            openAppointmentModal
          }
        >
          + Book Appointment
        </button>

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

          <button
            type="button"
            className="section-book-button"
            onClick={
              openAppointmentModal
            }
          >
            + Book
          </button>

        </div>


        {upcomingAppointments.length ===
          0 ? (

          <div className="patient-empty-state">

            <h4>
              No upcoming
              appointments
            </h4>

            <p>
              Book an appointment
              with one of our
              available doctors.
            </p>

            <button
              type="button"
              className="empty-book-button"
              onClick={
                openAppointmentModal
              }
            >
              Book Your First Appointment
            </button>

          </div>

        ) : (

          <div className="upcoming-appointment-card">

            <div className="appointment-doctor-avatar">

              {getAppointmentDoctorName(
                upcomingAppointments[0]
              )
                .replace(
                  "Dr. ",
                  ""
                )
                .charAt(0)
                .toUpperCase()}

            </div>


            <div className="upcoming-appointment-info">

              <h4>
                {
                  getAppointmentDoctorName(
                    upcomingAppointments[0]
                  )
                }
              </h4>

              <p className="doctor-specialization">

                {upcomingAppointments[0]
                  ?.doctor
                  ?.specialization ||
                  "Specialization not available"}

              </p>

              <span className="appointment-department">

                {
                  getAppointmentDepartment(
                    upcomingAppointments[0]
                  )
                }

              </span>


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
                  .replace(
                    /\s+/g,
                    "-"
                  )
                }`}
            >
              {
                getAppointmentStatus(
                  upcomingAppointments[0]
                )
              }
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
              Choose a doctor to
              book your appointment.
            </p>

          </div>

        </div>


        {loadingDoctors ? (

          <div className="patient-empty-state">
            Loading doctors...
          </div>

        ) : availableDoctors.length ===
          0 ? (

          <div className="patient-empty-state">

            <h4>
              No doctors currently
              available
            </h4>

            <p>
              Please check again
              later.
            </p>

          </div>

        ) : (

          <div className="available-doctors-grid">

            {availableDoctors
              .slice(0, 6)
              .map(
                (doctor) => (

                  <div
                    className="available-doctor-card"
                    key={
                      doctor._id
                    }
                  >

                    <div className="available-doctor-avatar">

                      {doctor.fullName
                        ?.charAt(
                          0
                        )
                        .toUpperCase() ||
                        "D"}

                    </div>


                    <div className="available-doctor-info">

                      <h4>
                        {
                          getDoctorName(
                            doctor
                          )
                        }
                      </h4>

                      <p>
                        {
                          doctor.specialization ||
                          "Specialist"
                        }
                      </p>

                      <span>
                        {
                          doctor.department ||
                          "Department not assigned"
                        }
                      </span>

                    </div>


                    <div className="doctor-availability">

                      <span className="availability-dot"></span>

                      Available

                    </div>


                    <button
                      type="button"
                      className="doctor-book-button"
                      onClick={() => {

                        setAppointmentForm(
                          {
                            doctor:
                              doctor._id,
                            department:
                              doctor.department ||
                              "",
                            appointmentDate:
                              "",
                            appointmentTime:
                              "",
                            reason:
                              "",
                            notes:
                              "",
                          }
                        );

                        setError(
                          ""
                        );

                        setSuccessMessage(
                          ""
                        );

                        setShowAppointmentModal(
                          true
                        );

                      }}
                    >
                      Book
                    </button>

                  </div>

                )
              )}

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


        {appointments.length ===
          0 ? (

          <div className="patient-empty-state">

            <h4>
              No appointment
              records
            </h4>

            <p>
              Your appointments will
              appear here after booking.
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
              .map(
                (appointment) => (

                  <div
                    className="patient-table-row"
                    key={
                      appointment._id
                    }
                  >

                    <span>

                      {
                        getAppointmentDoctorName(
                          appointment
                        )
                      }

                    </span>


                    <span>

                      {
                        getAppointmentDepartment(
                          appointment
                        )
                      }

                    </span>


                    <span>

                      {formatDate(
                        getAppointmentDate(
                          appointment
                        )
                      )}

                    </span>


                    <span>

                      {
                        getAppointmentTime(
                          appointment
                        )
                      }

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
                            )
                          }`}
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

      <div className="patient-dashboard-section">

        <div className="patient-section-header">

          <div>

            <h3>
              My Profile
            </h3>

            <p>
              Your registered
              account information.
            </p>

          </div>

        </div>


        <div className="patient-profile-details">

          <div>

            <label>
              Full Name
            </label>

            <strong>
              {
                user?.fullName ||
                "Not available"
              }
            </strong>

          </div>


          <div>

            <label>
              Email Address
            </label>

            <strong>
              {
                user?.email ||
                "Not available"
              }
            </strong>

          </div>


          <div>

            <label>
              Phone
            </label>

            <strong>
              {
                user?.phone ||
                "Not provided"
              }
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
      {showAppointmentModal && (

        <div
          className="appointment-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeAppointmentModal();
            }
          }}
        >

          <div className="appointment-modal">

            {/* MODAL HEADER */}

            <div className="appointment-modal-header">

              <div>

                <h3>
                  Book an Appointment
                </h3>

                <p>
                  Select your preferred
                  doctor, date and time.
                </p>

              </div>


              <button
                type="button"
                className="appointment-modal-close"
                onClick={
                  closeAppointmentModal
                }
                disabled={
                  loadingBooking
                }
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="appointment-form"
              onSubmit={
                handleCreateAppointment
              }
            >

              <div className="appointment-modal-body">

                {error && (
                  <div className="appointment-form-error">
                    {error}
                  </div>
                )}


                {successMessage && (
                  <div className="appointment-form-success">
                    {
                      successMessage
                    }
                  </div>
                )}


                {/* DOCTOR */}

                <div className="appointment-form-group">

                  <label htmlFor="doctor">
                    Doctor *
                  </label>

                  <select
                    id="doctor"
                    name="doctor"
                    value={
                      appointmentForm.doctor
                    }
                    onChange={
                      handleAppointmentChange
                    }
                    required
                  >

                    <option value="">
                      Select a doctor
                    </option>

                    {availableDoctors.map(
                      (doctor) => (

                        <option
                          key={
                            doctor._id
                          }
                          value={
                            doctor._id
                          }
                        >
                          {
                            getDoctorName(
                              doctor
                            )
                          }
                          {" - "}
                          {
                            doctor.specialization
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* DEPARTMENT */}

                <div className="appointment-form-group">

                  <label htmlFor="department">
                    Department *
                  </label>

                  <input
                    id="department"
                    name="department"
                    value={
                      appointmentForm.department
                    }
                    onChange={
                      handleAppointmentChange
                    }
                    placeholder="Department"
                    readOnly
                    required
                  />

                </div>


                {/* DATE */}

                <div className="appointment-form-row">

                  <div className="appointment-form-group">

                    <label htmlFor="appointmentDate">
                      Appointment Date *
                    </label>

                    <input
                      id="appointmentDate"
                      type="date"
                      name="appointmentDate"
                      value={
                        appointmentForm.appointmentDate
                      }
                      min={
                        new Date()
                          .toISOString()
                          .split(
                            "T"
                          )[0]
                      }
                      onChange={
                        handleAppointmentChange
                      }
                      required
                    />

                  </div>


                  {/* TIME */}

                  <div className="appointment-form-group">

                    <label htmlFor="appointmentTime">
                      Preferred Time *
                    </label>

                    <input
                      id="appointmentTime"
                      type="time"
                      name="appointmentTime"
                      value={
                        appointmentForm.appointmentTime
                      }
                      onChange={
                        handleAppointmentChange
                      }
                      required
                    />

                  </div>

                </div>


                {/* REASON */}

                <div className="appointment-form-group">

                  <label htmlFor="reason">
                    Reason for Visit
                  </label>

                  <input
                    id="reason"
                    type="text"
                    name="reason"
                    value={
                      appointmentForm.reason
                    }
                    onChange={
                      handleAppointmentChange
                    }
                    placeholder="Example: General consultation"
                  />

                </div>


                {/* NOTES */}

                <div className="appointment-form-group">

                  <label htmlFor="notes">
                    Additional Notes
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    value={
                      appointmentForm.notes
                    }
                    onChange={
                      handleAppointmentChange
                    }
                    placeholder="Add any additional information..."
                    rows="4"
                  />

                </div>


                {/* SELECTED DOCTOR PREVIEW */}

                {getSelectedDoctor() && (

                  <div className="selected-doctor-preview">

                    <div className="selected-doctor-avatar">

                      {
                        getSelectedDoctor()
                          ?.fullName
                          ?.charAt(
                            0
                          )
                          .toUpperCase()
                      }

                    </div>


                    <div>

                      <strong>
                        {
                          getDoctorName(
                            getSelectedDoctor()
                          )
                        }
                      </strong>

                      <span>
                        {
                          getSelectedDoctor()
                            ?.specialization
                        }
                      </span>

                      <small>
                        {
                          getSelectedDoctor()
                            ?.department
                        }
                      </small>

                    </div>

                  </div>

                )}

              </div>


              {/* FOOTER */}

              <div className="appointment-modal-footer">

                <button
                  type="button"
                  className="appointment-cancel-button"
                  onClick={
                    closeAppointmentModal
                  }
                  disabled={
                    loadingBooking
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="appointment-submit-button"
                  disabled={
                    loadingBooking
                  }
                >
                  {loadingBooking
                    ? "Booking..."
                    : "Book Appointment"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default PatientDashboard;