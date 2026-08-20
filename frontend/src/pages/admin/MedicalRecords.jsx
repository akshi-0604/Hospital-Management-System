import "./MedicalRecords.css";

function MedicalRecords() {
  const records = [
    {
      id: 1,
      patient: "Akash Reddy",
      doctor: "Dr. Priya Sharma",
      diagnosis: "Hypertension",
      treatment: "Medication and regular monitoring",
      date: "13 Aug 2026",
    },
    {
      id: 2,
      patient: "Bhavani",
      doctor: "Dr. Rahul Kumar",
      diagnosis: "Migraine",
      treatment: "Medication and follow-up",
      date: "12 Aug 2026",
    },
    {
      id: 3,
      patient: "Akshitha",
      doctor: "Dr. Anjali Rao",
      diagnosis: "Fever",
      treatment: "Medication and rest",
      date: "11 Aug 2026",
    },
  ];

  return (
    <div className="medical-records-page">

      <div className="medical-records-header">
        <div>
          <h2>Medical Records</h2>

          <p>
            Manage patient medical history and treatment records.
          </p>
        </div>

        <button className="add-record-button">
          + Add Record
        </button>
      </div>

      <div className="records-search">
        <input
          type="text"
          placeholder="Search patient or diagnosis..."
        />
      </div>

      <div className="records-table-card">

        <div className="records-table">

          <div className="records-table-header">
            <span>Patient</span>
            <span>Doctor</span>
            <span>Diagnosis</span>
            <span>Treatment</span>
            <span>Date</span>
            <span>Action</span>
          </div>

          {records.map((record) => (
            <div
              className="records-table-row"
              key={record.id}
            >
              <strong>{record.patient}</strong>

              <span>{record.doctor}</span>

              <span>{record.diagnosis}</span>

              <span>{record.treatment}</span>

              <span>{record.date}</span>

              <button>View</button>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default MedicalRecords;