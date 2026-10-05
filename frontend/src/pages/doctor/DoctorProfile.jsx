import { useEffect, useState } from "react";
import api from "../../api/axios";

import "./DoctorProfile.css";

function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("Logged-in doctor information was not found.");
        return;
      }

      const loggedInUser = JSON.parse(storedUser);

      const response = await api.get("/doctors");

      let doctors = [];

      if (Array.isArray(response.data)) {
        doctors = response.data;
      } else if (Array.isArray(response.data?.doctors)) {
        doctors = response.data.doctors;
      } else if (Array.isArray(response.data?.data)) {
        doctors = response.data.data;
      }

      const matchedDoctor = doctors.find(
        (item) =>
          String(item.email || "").toLowerCase() ===
          String(loggedInUser.email || "").toLowerCase()
      );

      if (!matchedDoctor) {
        setError("Doctor profile could not be found.");
        return;
      }

      setDoctor(matchedDoctor);
    } catch (err) {
      console.error("Doctor profile error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load doctor profile."
      );
    } finally {
      setLoading(false);
    }
  }

  function displayValue(value) {
    return value || "Not available";
  }

  return (
    <div className="doctor-profile-page">
      <div className="doctor-profile-header">
        <div>
          <h1>Doctor Profile</h1>
          <p>
            View your professional and personal information.
          </p>
        </div>

        <button
          type="button"
          className="doctor-profile-refresh"
          onClick={loadProfile}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="doctor-profile-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="doctor-profile-loading">
          Loading profile...
        </div>
      ) : doctor ? (
        <div className="doctor-profile-content">
          <div className="doctor-profile-card doctor-profile-main">
            <div className="doctor-profile-avatar">
              {(doctor.fullName || "D")
                .charAt(0)
                .toUpperCase()}
            </div>

            <h2>
              {displayValue(doctor.fullName)}
            </h2>

            <p>
              {displayValue(
                doctor.specialization
              )}
            </p>

            <span className="doctor-profile-role">
              Doctor
            </span>
          </div>

          <div className="doctor-profile-card">
            <h3>Professional Information</h3>

            <div className="doctor-profile-grid">
              <div>
                <span>Full Name</span>
                <strong>
                  {displayValue(doctor.fullName)}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {displayValue(doctor.email)}
                </strong>
              </div>

              <div>
                <span>Specialization</span>
                <strong>
                  {displayValue(
                    doctor.specialization
                  )}
                </strong>
              </div>

              <div>
                <span>Department</span>
                <strong>
                  {displayValue(
                    doctor.department?.name ||
                      doctor.department
                  )}
                </strong>
              </div>

              <div>
                <span>Qualification</span>
                <strong>
                  {displayValue(
                    doctor.qualification
                  )}
                </strong>
              </div>

              <div>
                <span>Experience</span>
                <strong>
                  {displayValue(
                    doctor.experience
                  )}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {displayValue(
                    doctor.phone ||
                      doctor.phoneNumber
                  )}
                </strong>
              </div>

              <div>
                <span>Gender</span>
                <strong>
                  {displayValue(doctor.gender)}
                </strong>
              </div>
            </div>
          </div>

          <div className="doctor-profile-card">
            <h3>Additional Information</h3>

            <div className="doctor-profile-grid">
              <div>
                <span>License Number</span>
                <strong>
                  {displayValue(
                    doctor.licenseNumber
                  )}
                </strong>
              </div>

              <div>
                <span>Consultation Fee</span>
                <strong>
                  {doctor.consultationFee !==
                  undefined
                    ? `₹${doctor.consultationFee}`
                    : "Not available"}
                </strong>
              </div>

              <div>
                <span>Availability</span>
                <strong>
                  {displayValue(
                    doctor.availability
                  )}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {displayValue(doctor.status)}
                </strong>
              </div>

              <div className="doctor-profile-full">
                <span>Address</span>
                <strong>
                  {displayValue(doctor.address)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DoctorProfile;