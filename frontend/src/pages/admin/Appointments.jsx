import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "./Appointments.css";

const API_BASE_URL =
  "https://hospital-management-system-nvjt.onrender.com/api";

const APPOINTMENTS_URL =
  `${API_BASE_URL}/appointments`;

const PATIENTS_URL =
  `${API_BASE_URL}/patients`;

const DOCTORS_URL =
  `${API_BASE_URL}/doctors`;


function Appointments() {
  const [appointments, setAppointments] = useState([]);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [showViewModal, setShowViewModal] = useState(false);

  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    department: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    notes: "",
    status: "Pending",
  });


  // --------------------------------------------------
  // FETCH APPOINTMENTS
  // --------------------------------------------------

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, []);


  async function fetchAppointments() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(APPOINTMENTS_URL);

      console.log(
        "Appointments API response:",
        response.data
      );

      if (Array.isArray(response.data)) {
        setAppointments(response.data);
      } else if (
        Array.isArray(response.data.appointments)
      ) {
        setAppointments(response.data.appointments);
      } else if (
        Array.isArray(response.data.data)
      ) {
        setAppointments(response.data.data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error(
        "Error while getting appointments:",
        error
      );

      setAppointments([]);

      setError(
        error.response?.data?.message ||
          "Unable to load appointment records."
      );
    } finally {
      setLoading(false);
    }
  }


  // --------------------------------------------------
  // FETCH PATIENTS
  // --------------------------------------------------

  async function fetchPatients() {
    try {
      const response = await axios.get(PATIENTS_URL);

      console.log(
        "Patients API response:",
        response.data
      );

      if (Array.isArray(response.data)) {
        setPatients(response.data);
      } else if (
        Array.isArray(response.data.patients)
      ) {
        setPatients(response.data.patients);
      } else if (
        Array.isArray(response.data.data)
      ) {
        setPatients(response.data.data);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error(
        "Error while getting patients:",
        error
      );
    }
  }


  // --------------------------------------------------
  // FETCH DOCTORS
  // --------------------------------------------------

  async function fetchDoctors() {
    try {
      const response = await axios.get(DOCTORS_URL);

      console.log(
        "Doctors API response:",
        response.data
      );

      if (Array.isArray(response.data)) {
        setDoctors(response.data);
      } else if (
        Array.isArray(response.data.doctors)
      ) {
        setDoctors(response.data.doctors);
      } else if (
        Array.isArray(response.data.data)
      ) {
        setDoctors(response.data.data);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error(
        "Error while getting doctors:",
        error
      );
    }
  }


  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  function handleFormChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


  // --------------------------------------------------
  // OPEN ADD FORM
  // --------------------------------------------------

  function openAddModal() {
    setFormError("");

    setFormData({
      patient: "",
      doctor: "",
      department: "",
      appointmentDate: "",
      appointmentTime: "",
      reason: "",
      notes: "",
      status: "Pending",
    });

    setShowAddModal(true);
  }


  // --------------------------------------------------
  // CLOSE ADD FORM
  // --------------------------------------------------

  function closeAddModal() {
    if (formLoading) {
      return;
    }

    setShowAddModal(false);
    setFormError("");
  }


  // --------------------------------------------------
  // CREATE APPOINTMENT
  // --------------------------------------------------

  async function handleCreateAppointment(event) {
    event.preventDefault();

    setFormError("");

    if (
      !formData.patient ||
      !formData.doctor ||
      !formData.department ||
      !formData.appointmentDate ||
      !formData.appointmentTime
    ) {
      setFormError(
        "Please fill all required appointment details."
      );

      return;
    }

    try {
      setFormLoading(true);

      const response = await axios.post(
        APPOINTMENTS_URL,
        formData
      );

      console.log(
        "Created appointment:",
        response.data
      );

      setShowAddModal(false);

      setFormData({
        patient: "",
        doctor: "",
        department: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
        notes: "",
        status: "Pending",
      });

      await fetchAppointments();

      alert("Appointment created successfully.");
    } catch (error) {
      console.error(
        "Create appointment error:",
        error
      );

      setFormError(
        error.response?.data?.message ||
          "Unable to create appointment."
      );
    } finally {
      setFormLoading(false);
    }
  }


  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  function formatDate(value) {
    if (!value) {
      return "N/A";
    }

    const formattedDate = new Date(value);

    if (Number.isNaN(formattedDate.getTime())) {
      return value;
    }

    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }


  // --------------------------------------------------
  // GET PATIENT NAME
  // --------------------------------------------------

  function getPatientName(appointment) {
    return (
      appointment.patient?.fullName ||
      appointment.patient?.name ||
      appointment.patientName ||
      "Unknown Patient"
    );
  }


  // --------------------------------------------------
  // GET DOCTOR NAME
  // --------------------------------------------------

  function getDoctorName(appointment) {
    const name =
      appointment.doctor?.fullName ||
      appointment.doctor?.name ||
      appointment.doctorName;

    if (!name) {
      return "Unknown Doctor";
    }

    return name.startsWith("Dr.")
      ? name
      : `Dr. ${name}`;
  }


  // --------------------------------------------------
  // GET DEPARTMENT
  // --------------------------------------------------

  function getDepartment(appointment) {
    return (
      appointment.department ||
      appointment.doctor?.department ||
      "Not assigned"
    );
  }


  // --------------------------------------------------
  // GET DATE
  // --------------------------------------------------

  function getAppointmentDate(appointment) {
    return (
      appointment.appointmentDate ||
      appointment.date ||
      ""
    );
  }


  // --------------------------------------------------
  // GET TIME
  // --------------------------------------------------

  function getAppointmentTime(appointment) {
    return (
      appointment.appointmentTime ||
      appointment.time ||
      "Not specified"
    );
  }


  // --------------------------------------------------
  // GET STATUS
  // --------------------------------------------------

  function getAppointmentStatus(appointment) {
    return (
      appointment.status ||
      "Pending"
    );
  }


  // --------------------------------------------------
  // FILTER APPOINTMENTS
  // --------------------------------------------------

  const filteredAppointments = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return appointments.filter(
      (appointment) => {
        const patientName =
          getPatientName(
            appointment
          ).toLowerCase();

        const doctorName =
          getDoctorName(
            appointment
          ).toLowerCase();

        const department =
          getDepartment(
            appointment
          ).toLowerCase();

        const appointmentStatus =
          getAppointmentStatus(
            appointment
          ).toLowerCase();

        const matchesSearch =
          !searchText ||
          patientName.includes(searchText) ||
          doctorName.includes(searchText) ||
          department.includes(searchText) ||
          appointmentStatus.includes(searchText);

        const matchesStatus =
          status === "all" ||
          appointmentStatus ===
            status.toLowerCase();

        const appointmentDate =
          getAppointmentDate(
            appointment
          );

        const formattedDate =
          appointmentDate
            ? new Date(appointmentDate)
                .toISOString()
                .split("T")[0]
            : "";

        const matchesDate =
          !date ||
          formattedDate === date;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDate
        );
      }
    );
  }, [
    appointments,
    search,
    status,
    date,
  ]);


  // --------------------------------------------------
  // CLEAR FILTERS
  // --------------------------------------------------

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setDate("");
  }


  // --------------------------------------------------
  // VIEW APPOINTMENT
  // --------------------------------------------------

  function handleView(appointment) {
    setSelectedAppointment(
      appointment
    );

    setShowViewModal(true);
  }


  function closeViewModal() {
    setSelectedAppointment(null);
    setShowViewModal(false);
  }


  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="appointments-page">

        <div className="appointments-header">
          <div>
            <h2>Appointments</h2>

            <p>
              Schedule and manage patient
              appointments.
            </p>
          </div>
        </div>

        <div className="appointments-message-card">
          <div className="appointments-loader"></div>

          <p>
            Loading appointment records...
          </p>
        </div>

      </div>
    );
  }


  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="appointments-page">

      {/* HEADER */}

      <div className="appointments-header">

        <div>
          <h2>Appointments</h2>

          <p>
            Schedule and manage patient
            appointments.
          </p>
        </div>

        <button
          className="add-appointment-button"
          onClick={openAddModal}
        >
          + Add Appointment
        </button>

      </div>


      {/* TOP FILTER CARD */}

      <div className="appointments-filter-card">

        <div className="appointment-search-wrapper">
          <input
            type="text"
            placeholder="Search by patient, doctor, department..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="all">
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
        </select>

        <input
          type="date"
          value={date}
          onChange={(event) =>
            setDate(event.target.value)
          }
        />

        <button
          className="clear-button"
          onClick={clearFilters}
        >
          Clear
        </button>

      </div>


      {/* COUNT */}

      <div className="appointments-list-header">

        <span>
          Showing{" "}
          <strong>
            {filteredAppointments.length}
          </strong>{" "}
          of{" "}
          <strong>
            {appointments.length}
          </strong>{" "}
          appointments
        </span>

        <button
          className="refresh-button"
          onClick={fetchAppointments}
        >
          ↻ Refresh
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="appointments-error">
          {error}
        </div>
      )}


      {/* TABLE / EMPTY */}

      {filteredAppointments.length === 0 ? (

        <div className="appointments-empty-card">

          <div className="empty-icon">
            📅
          </div>

          <h3>
            No appointments found
          </h3>

          <p>
            There are no appointments
            matching the current filters.
          </p>

          <button
            className="empty-add-button"
            onClick={openAddModal}
          >
            + Add New Appointment
          </button>

        </div>

      ) : (

        <div className="appointments-table-card">

          <div className="appointments-table">

            <div className="appointments-table-header">

              <span>Patient</span>
              <span>Doctor</span>
              <span>Department</span>
              <span>Date</span>
              <span>Time</span>
              <span>Status</span>
              <span>Action</span>

            </div>


            {filteredAppointments.map(
              (appointment) => (

                <div
                  className="appointments-table-row"
                  key={appointment._id}
                >

                  <span>
                    {getPatientName(
                      appointment
                    )}
                  </span>

                  <span>
                    {getDoctorName(
                      appointment
                    )}
                  </span>

                  <span>
                    {getDepartment(
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
                      className={`status-badge status-${getAppointmentStatus(
                        appointment
                      ).toLowerCase()}`}
                    >
                      {getAppointmentStatus(
                        appointment
                      )}
                    </span>
                  </span>

                  <span>

                    <button
                      className="view-button"
                      onClick={() =>
                        handleView(
                          appointment
                        )
                      }
                    >
                      View
                    </button>

                  </span>

                </div>

              )
            )}

          </div>

        </div>

      )}


      {/* ADD APPOINTMENT MODAL */}

      {showAddModal && (
        <div className="modal-overlay">

          <div className="appointment-modal">

            <div className="modal-header">

              <div>
                <h3>
                  Add New Appointment
                </h3>

                <p>
                  Enter appointment details
                  below.
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={closeAddModal}
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                handleCreateAppointment
              }
            >

              <div className="form-grid">

                {/* PATIENT */}

                <div className="form-group">

                  <label>
                    Patient *
                  </label>

                  <select
                    name="patient"
                    value={formData.patient}
                    onChange={
                      handleFormChange
                    }
                    required
                  >

                    <option value="">
                      Select Patient
                    </option>

                    {patients.map(
                      (patient) => (

                        <option
                          key={
                            patient._id
                          }
                          value={
                            patient._id
                          }
                        >
                          {patient.fullName ||
                            patient.name ||
                            patient.email}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* DOCTOR */}

                <div className="form-group">

                  <label>
                    Doctor *
                  </label>

                  <select
                    name="doctor"
                    value={formData.doctor}
                    onChange={
                      handleFormChange
                    }
                    required
                  >

                    <option value="">
                      Select Doctor
                    </option>

                    {doctors.map(
                      (doctor) => (

                        <option
                          key={
                            doctor._id
                          }
                          value={
                            doctor._id
                          }
                        >
                          Dr.{" "}
                          {doctor.fullName ||
                            doctor.name ||
                            doctor.email}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* DEPARTMENT */}

                <div className="form-group">

                  <label>
                    Department *
                  </label>

                  <input
                    type="text"
                    name="department"
                    value={
                      formData.department
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Example: Cardiology"
                    required
                  />

                </div>


                {/* DATE */}

                <div className="form-group">

                  <label>
                    Appointment Date *
                  </label>

                  <input
                    type="date"
                    name="appointmentDate"
                    value={
                      formData.appointmentDate
                    }
                    onChange={
                      handleFormChange
                    }
                    required
                  />

                </div>


                {/* TIME */}

                <div className="form-group">

                  <label>
                    Appointment Time *
                  </label>

                  <input
                    type="time"
                    name="appointmentTime"
                    value={
                      formData.appointmentTime
                    }
                    onChange={
                      handleFormChange
                    }
                    required
                  />

                </div>


                {/* STATUS */}

                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleFormChange
                    }
                  >

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

                  </select>

                </div>


                {/* REASON */}

                <div className="form-group full-width">

                  <label>
                    Reason
                  </label>

                  <input
                    type="text"
                    name="reason"
                    value={
                      formData.reason
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Reason for appointment"
                  />

                </div>


                {/* NOTES */}

                <div className="form-group full-width">

                  <label>
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={
                      formData.notes
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Additional notes"
                    rows="3"
                  />

                </div>

              </div>


              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}


              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeAddModal}
                  disabled={formLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-appointment-button"
                  disabled={formLoading}
                >
                  {formLoading
                    ? "Creating..."
                    : "Create Appointment"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* VIEW APPOINTMENT MODAL */}

      {showViewModal &&
        selectedAppointment && (

          <div className="modal-overlay">

            <div className="appointment-modal view-modal">

              <div className="modal-header">

                <div>
                  <h3>
                    Appointment Details
                  </h3>

                  <p>
                    View appointment
                    information.
                  </p>
                </div>

                <button
                  className="modal-close-button"
                  onClick={
                    closeViewModal
                  }
                >
                  ×
                </button>

              </div>


              <div className="appointment-details">

                <div>
                  <label>
                    Patient
                  </label>

                  <strong>
                    {getPatientName(
                      selectedAppointment
                    )}
                  </strong>
                </div>

                <div>
                  <label>
                    Doctor
                  </label>

                  <strong>
                    {getDoctorName(
                      selectedAppointment
                    )}
                  </strong>
                </div>

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

                  <strong>
                    {getAppointmentStatus(
                      selectedAppointment
                    )}
                  </strong>
                </div>

                <div className="details-full">

                  <label>
                    Reason
                  </label>

                  <p>
                    {selectedAppointment.reason ||
                      "No reason provided."}
                  </p>

                </div>

                <div className="details-full">

                  <label>
                    Notes
                  </label>

                  <p>
                    {selectedAppointment.notes ||
                      "No additional notes."}
                  </p>

                </div>

              </div>


              <div className="modal-actions">

                <button
                  className="cancel-button"
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

export default Appointments;