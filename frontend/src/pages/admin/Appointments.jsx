import "./Appointments.css";

function Appointments() {
    const appointments = [
        {
            id: 1,
            patient: "Akash Reddy",
            doctor: "Dr. Priya Sharma",
            department: "Cardiology",
            date: "13 Aug 2026",
            time: "10:30 AM",
            status: "Confirmed",
        },
        {
            id: 2,
            patient: "Bhavani",
            doctor: "Dr. Rahul Kumar",
            department: "Neurology",
            date: "13 Aug 2026",
            time: "11:00 AM",
            status: "Pending",
        },
        {
            id: 3,
            patient: "Akshitha",
            doctor: "Dr. Anjali Rao",
            department: "Pediatrics",
            date: "13 Aug 2026",
            time: "12:30 PM",
            status: "Completed",
        },
        {
            id: 4,
            patient: "Manvitha",
            doctor: "Dr. Suresh Reddy",
            department: "Orthopedics",
            date: "14 Aug 2026",
            time: "10:00 AM",
            status: "Confirmed",
        },
    ];

    return (
        <div className="appointments-page">

            <div className="appointments-header">
                <div>
                    <h2>Appointments</h2>

                    <p>
                        Schedule and manage patient appointments.
                    </p>
                </div>

                <button className="add-appointment-button">
                    + New Appointment
                </button>
            </div>

            <div className="appointment-filters">

                <input
                    type="text"
                    placeholder="Search appointments..."
                />

                <select defaultValue="all">
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                </select>

                <input type="date" />

            </div>

            <div className="appointments-table-card">

                <div className="appointments-table">

                    <div className="appointment-table-header">
                        <span>Patient</span>
                        <span>Doctor</span>
                        <span>Department</span>
                        <span>Date</span>
                        <span>Time</span>
                        <span>Status</span>
                        <span>Action</span>
                    </div>

                    {appointments.map((appointment) => (
                        <div
                            className="appointment-table-row"
                            key={appointment.id}
                        >
                            <strong>{appointment.patient}</strong>

                            <span>{appointment.doctor}</span>

                            <span>{appointment.department}</span>

                            <span>{appointment.date}</span>

                            <span>{appointment.time}</span>

                            <span
                                className={`appointment-status ${appointment.status.toLowerCase()}`}
                            >
                                {appointment.status}
                            </span>

                            <button className="appointment-view-button">
                                View
                            </button>
                        </div>
                    ))}

                </div>

            </div>

        </div>
    );
}

export default Appointments;