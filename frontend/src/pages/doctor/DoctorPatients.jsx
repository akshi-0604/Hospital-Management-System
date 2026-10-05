import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

import "./DoctorPatients.css";

function DoctorPatients() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadDoctorPatients();
  }, []);

  async function loadDoctorPatients() {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("Logged-in doctor information was not found.");
        return;
      }

      const loggedInUser = JSON.parse(storedUser);

      const doctorResponse = await api.get("/doctors");

      let doctorData = [];

      if (Array.isArray(doctorResponse.data)) {
        doctorData = doctorResponse.data;
      } else if (Array.isArray(doctorResponse.data?.doctors)) {
        doctorData = doctorResponse.data.doctors;
      } else if (Array.isArray(doctorResponse.data?.data)) {
        doctorData = doctorResponse.data.data;
      }

      const loggedInDoctor = doctorData.find(
        (item) =>
          String(item.email || "").toLowerCase() ===
          String(loggedInUser.email || "").toLowerCase()
      );

      if (!loggedInDoctor) {
        setError("Doctor profile could not be found.");
        return;
      }

      setDoctor(loggedInDoctor);

      const appointmentResponse = await api.get("/appointments");

      let appointmentData = [];

      if (Array.isArray(appointmentResponse.data)) {
        appointmentData = appointmentResponse.data;
      } else if (Array.isArray(appointmentResponse.data?.appointments)) {
        appointmentData = appointmentResponse.data.appointments;
      } else if (Array.isArray(appointmentResponse.data?.data)) {
        appointmentData = appointmentResponse.data.data;
      }

      const doctorAppointments = appointmentData.filter((appointment) => {
        const appointmentDoctor =
          appointment.doctor?._id ||
          appointment.doctor?.id ||
          appointment.doctor;

        return String(appointmentDoctor || "") ===
          String(loggedInDoctor._id || loggedInDoctor.id || "");
      });

      setAppointments(doctorAppointments);
    } catch (err) {
      console.error("Doctor patients error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your patients."
      );
    } finally {
      setLoading(false);
    }
  }

  const patients = useMemo(() => {
    const patientMap = new Map();

    appointments.forEach((appointment) => {
      const patient = appointment.patient;

      const patientId =
        patient?._id ||
        patient?.id ||
        appointment.patientId ||
        appointment.patient;

      const patientName =
        patient?.fullName ||
        patient?.name ||
        appointment.patientName ||
        "Unknown Patient";

      const patientEmail =
        patient?.email ||
        appointment.patientEmail ||
        "";

      if (!patientId && !patientEmail && !patientName) {
        return;
      }

      const key =
        String(patientId || patientEmail || patientName).toLowerCase();

      if (!patientMap.has(key)) {
        patientMap.set(key, {
          id: patientId,
          fullName: patientName,
          email: patientEmail,
          phone:
            patient?.phone ||
            patient?.phoneNumber ||
            appointment.patientPhone ||
            "Not available",
          gender: patient?.gender || "Not available",
          dateOfBirth: patient?.dateOfBirth || "",
          address: patient?.address || "Not available",
          bloodGroup: patient?.bloodGroup || "Not available",
          appointments: 0,
          lastAppointment: null,
          source: patient,
        });
      }

      const current = patientMap.get(key);

      current.appointments += 1;

      const appointmentDate =
        appointment.appointmentDate ||
        appointment.date ||
        appointment.createdAt;

      if (
        appointmentDate &&
        (!current.lastAppointment ||
          new Date(appointmentDate) >
            new Date(current.lastAppointment))
      ) {
        current.lastAppointment = appointmentDate;
      }
    });

    return Array.from(patientMap.values());
  }, [appointments]);

  const filteredPatients = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return patients;
    }

    return patients.filter((patient) => {
      return (
        patient.fullName.toLowerCase().includes(value) ||
        patient.email.toLowerCase().includes(value) ||
        String(patient.phone).toLowerCase().includes(value) ||
        String(patient.gender).toLowerCase().includes(value) ||
        String(patient.bloodGroup).toLowerCase().includes(value)
      );
    });
  }, [patients, search]);

  function formatDate(value) {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="doctor-patients-page">
      <div className="doctor-patients-header">
        <div>
          <h1>Patients</h1>
          <p>
            View patients associated with your appointments.
          </p>
        </div>

        <button
          type="button"
          className="doctor-patients-refresh"
          onClick={loadDoctorPatients}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="doctor-patients-error">
          {error}
        </div>
      )}

      <div className="doctor-patients-summary">
        <div className="doctor-patient-summary-card">
          <span>Total Patients</span>
          <strong>{patients.length}</strong>
        </div>

        <div className="doctor-patient-summary-card">
          <span>Appointments</span>
          <strong>{appointments.length}</strong>
        </div>

        <div className="doctor-patient-summary-card">
          <span>Doctor</span>
          <strong>
            {doctor?.fullName || "Doctor"}
          </strong>
        </div>
      </div>

      <div className="doctor-patients-toolbar">
        <input
          type="text"
          placeholder="Search patient name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="doctor-patients-table-card">
        {loading ? (
          <div className="doctor-patients-empty">
            Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="doctor-patients-empty">
            <strong>No patients found</strong>
            <span>
              Patients associated with your appointments will
              appear here.
            </span>
          </div>
        ) : (
          <div className="doctor-patients-table-wrapper">
            <table className="doctor-patients-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Blood Group</th>
                  <th>Appointments</th>
                  <th>Last Appointment</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.map((patient, index) => (
                  <tr
                    key={
                      patient.id ||
                      patient.email ||
                      `${patient.fullName}-${index}`
                    }
                  >
                    <td>
                      <strong>{patient.fullName}</strong>
                    </td>

                    <td>
                      {patient.email || "Not available"}
                    </td>

                    <td>{patient.phone}</td>

                    <td>{patient.gender}</td>

                    <td>{patient.bloodGroup}</td>

                    <td>
                      <span className="doctor-patient-count">
                        {patient.appointments}
                      </span>
                    </td>

                    <td>
                      {formatDate(patient.lastAppointment)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="doctor-patient-view-button"
                        onClick={() =>
                          setSelectedPatient(patient)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="doctor-patient-modal-overlay">
          <div className="doctor-patient-modal">
            <div className="doctor-patient-modal-header">
              <div>
                <h2>Patient Details</h2>
                <p>{selectedPatient.fullName}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
              >
                ×
              </button>
            </div>

            <div className="doctor-patient-details">
              <div>
                <span>Name</span>
                <strong>{selectedPatient.fullName}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {selectedPatient.email || "Not available"}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{selectedPatient.phone}</strong>
              </div>

              <div>
                <span>Gender</span>
                <strong>{selectedPatient.gender}</strong>
              </div>

              <div>
                <span>Date of Birth</span>
                <strong>
                  {formatDate(selectedPatient.dateOfBirth)}
                </strong>
              </div>

              <div>
                <span>Blood Group</span>
                <strong>{selectedPatient.bloodGroup}</strong>
              </div>

              <div className="doctor-patient-detail-full">
                <span>Address</span>
                <strong>{selectedPatient.address}</strong>
              </div>

              <div>
                <span>Total Appointments</span>
                <strong>
                  {selectedPatient.appointments}
                </strong>
              </div>

              <div>
                <span>Last Appointment</span>
                <strong>
                  {formatDate(selectedPatient.lastAppointment)}
                </strong>
              </div>
            </div>

            <div className="doctor-patient-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
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

export default DoctorPatients;