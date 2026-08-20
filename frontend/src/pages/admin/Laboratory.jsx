import "./Laboratory.css";

function Laboratory() {
  const reports = [
    {
      id: 1,
      patient: "Akash Reddy",
      test: "Blood Test",
      doctor: "Dr. Priya Sharma",
      date: "13 Aug 2026",
      status: "Completed",
    },
    {
      id: 2,
      patient: "Bhavani",
      test: "MRI Scan",
      doctor: "Dr. Rahul Kumar",
      date: "13 Aug 2026",
      status: "Pending",
    },
    {
      id: 3,
      patient: "Akshitha",
      test: "Blood Sugar",
      doctor: "Dr. Anjali Rao",
      date: "12 Aug 2026",
      status: "Completed",
    },
  ];

  return (
    <div className="laboratory-page">

      <div className="laboratory-header">
        <div>
          <h2>Laboratory</h2>

          <p>
            Manage laboratory tests and patient reports.
          </p>
        </div>

        <button className="add-test-button">
          + Add Test
        </button>
      </div>

      <div className="laboratory-table-card">

        <div className="laboratory-table">

          <div className="laboratory-table-header">
            <span>Patient</span>
            <span>Test</span>
            <span>Doctor</span>
            <span>Date</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {reports.map((report) => (
            <div
              className="laboratory-table-row"
              key={report.id}
            >
              <strong>{report.patient}</strong>

              <span>{report.test}</span>

              <span>{report.doctor}</span>

              <span>{report.date}</span>

              <span
                className={`lab-status ${report.status.toLowerCase()}`}
              >
                {report.status}
              </span>

              <button>View Report</button>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default Laboratory;