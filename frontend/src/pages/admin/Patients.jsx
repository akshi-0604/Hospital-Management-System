import { useEffect, useState } from "react";
import axios from "axios";

import "./Patients.css";


function Patients() {
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  async function loadPatients() {
    try {
      setLoading(true);

      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/patients"
      );

      setPatients(
        response.data.patients
      );
    } catch (error) {
      console.error(
        "Unable to load patients:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load patient records"
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadPatients();
  }, []);


  return (
    <div className="patients-page">

      <div className="patients-header">
        <div>
          <h2>Patients</h2>

          <p>
            Manage registered patient
            information.
          </p>
        </div>

        <div className="patient-count">
          Total Patients: {patients.length}
        </div>
      </div>


      <div className="patients-card">

        {loading && (
          <div className="patients-message">
            Loading patient records...
          </div>
        )}


        {error && (
          <div className="patients-error">
            {error}
          </div>
        )}


        {!loading &&
          !error &&
          patients.length === 0 && (
            <div className="patients-message">
              No patients registered yet.
            </div>
          )}


        {!loading &&
          !error &&
          patients.length > 0 && (

            <div className="patients-table">

              <div className="patients-table-header">
                <span>Patient Name</span>
                <span>Email</span>
                <span>Phone</span>
                <span>Registered</span>
              </div>


              {patients.map((patient) => (

                <div
                  className="patients-table-row"
                  key={patient._id}
                >

                  <span>
                    {patient.fullName}
                  </span>

                  <span>
                    {patient.email}
                  </span>

                  <span>
                    {patient.phone || "Not provided"}
                  </span>

                  <span>
                    {new Date(
                      patient.createdAt
                    ).toLocaleDateString()}
                  </span>

                </div>

              ))}

            </div>

          )}

      </div>

    </div>
  );
}


export default Patients;