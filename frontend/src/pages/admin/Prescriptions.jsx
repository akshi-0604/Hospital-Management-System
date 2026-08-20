import "./Prescriptions.css";

function Prescriptions() {
  const prescriptions = [
    {
      id: 1,
      patient: "Akash Reddy",
      doctor: "Dr. Priya Sharma",
      medicine: "Amlodipine",
      dosage: "5 mg",
      duration: "30 Days",
      date: "13 Aug 2026",
    },
    {
      id: 2,
      patient: "Bhavani",
      doctor: "Dr. Rahul Kumar",
      medicine: "Sumatriptan",
      dosage: "50 mg",
      duration: "10 Days",
      date: "12 Aug 2026",
    },
    {
      id: 3,
      patient: "Akshitha",
      doctor: "Dr. Anjali Rao",
      medicine: "Paracetamol",
      dosage: "500 mg",
      duration: "5 Days",
      date: "11 Aug 2026",
    },
  ];

  return (
    <div className="prescriptions-page">

      <div className="prescriptions-header">
        <div>
          <h2>Prescriptions</h2>

          <p>
            Manage medicines prescribed to patients.
          </p>
        </div>

        <button className="add-prescription-button">
          + Add Prescription
        </button>
      </div>

      <div className="prescriptions-table-card">

        <div className="prescriptions-table">

          <div className="prescription-table-header">
            <span>Patient</span>
            <span>Doctor</span>
            <span>Medicine</span>
            <span>Dosage</span>
            <span>Duration</span>
            <span>Date</span>
            <span>Action</span>
          </div>

          {prescriptions.map((prescription) => (
            <div
              className="prescription-table-row"
              key={prescription.id}
            >
              <strong>{prescription.patient}</strong>

              <span>{prescription.doctor}</span>

              <span>{prescription.medicine}</span>

              <span>{prescription.dosage}</span>

              <span>{prescription.duration}</span>

              <span>{prescription.date}</span>

              <button>View</button>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default Prescriptions;