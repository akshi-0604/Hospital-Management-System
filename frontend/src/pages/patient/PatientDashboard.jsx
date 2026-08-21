import "./PatientDashboard.css";

function PatientDashboard() {
  return (
    <div className="patient-dashboard">
      <div className="patient-dashboard-header">
        <h2>Patient Dashboard</h2>

        <p>
          Welcome to your Hospital Management System.
        </p>
      </div>

      <div className="patient-dashboard-card">
        <h3>My Health Overview</h3>

        <p>
          Your appointments, medical records,
          prescriptions, and laboratory reports
          will appear here.
        </p>
      </div>
    </div>
  );
}

export default PatientDashboard;