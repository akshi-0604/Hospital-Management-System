import { useNavigate } from "react-router-dom";

import "./DoctorQuickActions.css";

function DoctorQuickActions() {
  const navigate = useNavigate();

  return (
    <div className="doctor-quick-page">
      <div className="doctor-quick-header">
        <h1>Quick Actions</h1>
        <p>
          Quickly access the most frequently used doctor functions.
        </p>
      </div>

      <div className="doctor-quick-grid">
        <button
          type="button"
          onClick={() =>
            navigate("/doctor/appointments")
          }
        >
          <span>📅</span>
          <strong>Appointments</strong>
          <small>
            View and manage your appointments.
          </small>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/doctor/patients")
          }
        >
          <span>👥</span>
          <strong>Patients</strong>
          <small>
            View patients associated with your appointments.
          </small>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/doctor/medical-records")
          }
        >
          <span>📋</span>
          <strong>Medical Records</strong>
          <small>
            Review your patients' medical records.
          </small>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/doctor/prescriptions")
          }
        >
          <span>💊</span>
          <strong>Prescriptions</strong>
          <small>
            Review prescriptions created by you.
          </small>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/doctor/laboratory")
          }
        >
          <span>🧪</span>
          <strong>Laboratory</strong>
          <small>
            Review laboratory reports.
          </small>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/doctor/profile")
          }
        >
          <span>👤</span>
          <strong>My Profile</strong>
          <small>
            View your doctor profile.
          </small>
        </button>
      </div>
    </div>
  );
}

export default DoctorQuickActions;