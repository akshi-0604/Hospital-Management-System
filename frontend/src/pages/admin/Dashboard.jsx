import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-page">

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h2>Hospital Overview</h2>

          <p>
            Here is what's happening in your hospital today.
          </p>
        </div>
      </div>


      {/* Dashboard Cards */}
      <div className="dashboard-cards">

        {/* Total Patients */}
        <div className="dashboard-card">
          <span>Total Patients</span>

          <strong>1,250</strong>

          <p>
            Registered patients
          </p>
        </div>


        {/* Total Doctors */}
        <div className="dashboard-card">
          <span>Total Doctors</span>

          <strong>42</strong>

          <p>
            Active doctors
          </p>
        </div>


        {/* Total Departments */}
        <div className="dashboard-card">
          <span>Total Departments</span>

          <strong>8</strong>

          <p>
            Hospital departments
          </p>
        </div>


        {/* Appointments */}
        <div className="dashboard-card">
          <span>Appointments</span>

          <strong>86</strong>

          <p>
            Today's appointments
          </p>
        </div>


        {/* Today's Revenue */}
        <div className="dashboard-card">
          <span>Today's Revenue</span>

          <strong>₹85,400</strong>

          <p>
            Total collected today
          </p>
        </div>

      </div>


      {/* Recent Appointments */}
      <div className="dashboard-section">

        <h3>Recent Appointments</h3>

        <div className="appointment-table">

          {/* Table Header */}
          <div className="table-header">
            <span>Patient</span>
            <span>Doctor</span>
            <span>Time</span>
            <span>Status</span>
          </div>


          {/* Appointment 1 */}
          <div className="table-row">
            <span>Ravi Kumar</span>

            <span>Dr. Priya</span>

            <span>10:30 AM</span>

            <span className="status confirmed">
              Confirmed
            </span>
          </div>


          {/* Appointment 2 */}
          <div className="table-row">
            <span>Anitha Rao</span>

            <span>Dr. Rahul</span>

            <span>11:00 AM</span>

            <span className="status pending">
              Pending
            </span>
          </div>


          {/* Appointment 3 */}
          <div className="table-row">
            <span>Suresh Kumar</span>

            <span>Dr. Priya</span>

            <span>12:30 PM</span>

            <span className="status completed">
              Completed
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;