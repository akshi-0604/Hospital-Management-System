import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./PatientProfile.css";

function PatientProfile() {
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!storedUser) {
        setError("User information not found. Please login again.");
        return;
      }

      setUser(storedUser);

      const patientId =
        storedUser._id ||
        storedUser.id ||
        storedUser.userId;

      if (!patientId) {
        setError("Unable to identify the logged-in patient.");
        return;
      }

      const response = await api.get("/patients");

      const patients = response.data?.patients || [];

      const loggedInPatient = patients.find((item) => {
        return String(item._id) === String(patientId);
      });

      if (loggedInPatient) {
        setPatient(loggedInPatient);
      } else {
        // If patient details are not found in /patients,
        // still show the information available in localStorage.
        setPatient(storedUser);
      }
    } catch (error) {
      console.error("Load patient profile error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load profile details."
      );

      // Fallback to localStorage user
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (storedUser) {
        setUser(storedUser);
        setPatient(storedUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const getValue = (value) => {
    return value && String(value).trim()
      ? value
      : "Not provided";
  };

  const getFullName = () => {
    if (patient?.fullName) {
      return patient.fullName;
    }

    if (patient?.firstName || patient?.lastName) {
      return `${patient.firstName || ""} ${
        patient.lastName || ""
      }`.trim();
    }

    if (user?.fullName) {
      return user.fullName;
    }

    return "Patient";
  };

  const getInitials = () => {
    const name = getFullName();

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not provided";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="patient-profile-page">
        <div className="patient-profile-loading">
          <div className="patient-profile-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-profile-page">
      <div className="patient-profile-header">
        <div>
          <h1>My Profile</h1>
          <p>View your personal and contact information.</p>
        </div>

        <button
          className="patient-profile-refresh"
          onClick={loadProfile}
          type="button"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="patient-profile-error">
          {error}
        </div>
      )}

      {/* Profile Overview */}
      <div className="patient-profile-overview">
        <div className="patient-profile-avatar">
          {getInitials()}
        </div>

        <div className="patient-profile-main-info">
          <h2>{getFullName()}</h2>

          <p>
            {getValue(
              patient?.email || user?.email
            )}
          </p>

          <span className="patient-profile-role">
            Patient
          </span>
        </div>
      </div>

      {/* Personal Information */}
      <div className="patient-profile-card">
        <div className="patient-profile-card-header">
          <div>
            <h3>Personal Information</h3>
            <p>Your basic personal details</p>
          </div>
        </div>

        <div className="patient-profile-grid">
          <div className="patient-profile-field">
            <span className="patient-profile-label">
              Full Name
            </span>
            <strong>{getFullName()}</strong>
          </div>

          <div className="patient-profile-field">
            <span className="patient-profile-label">
              Gender
            </span>
            <strong>
              {getValue(patient?.gender)}
            </strong>
          </div>

          <div className="patient-profile-field">
            <span className="patient-profile-label">
              Date of Birth
            </span>
            <strong>
              {formatDate(patient?.dateOfBirth)}
            </strong>
          </div>

          <div className="patient-profile-field">
            <span className="patient-profile-label">
              Age
            </span>
            <strong>
              {getValue(patient?.age)}
            </strong>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="patient-profile-card">
        <div className="patient-profile-card-header">
          <div>
            <h3>Contact Information</h3>
            <p>Your phone and email details</p>
          </div>
        </div>

        <div className="patient-profile-grid">
          <div className="patient-profile-field">
            <span className="patient-profile-label">
              Email Address
            </span>
            <strong>
              {getValue(
                patient?.email || user?.email
              )}
            </strong>
          </div>

          <div className="patient-profile-field">
            <span className="patient-profile-label">
              Phone Number
            </span>
            <strong>
              {getValue(
                patient?.phone ||
                  patient?.phoneNumber ||
                  user?.phone
              )}
            </strong>
          </div>

          <div className="patient-profile-field patient-profile-full-width">
            <span className="patient-profile-label">
              Address
            </span>
            <strong>
              {getValue(patient?.address)}
            </strong>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="patient-profile-card">
        <div className="patient-profile-card-header">
          <div>
            <h3>Additional Information</h3>
            <p>Other patient information</p>
          </div>
        </div>

        <div className="patient-profile-grid">
          <div className="patient-profile-field">
            <span className="patient-profile-label">
              Blood Group
            </span>
            <strong>
              {getValue(patient?.bloodGroup)}
            </strong>
          </div>

          <div className="patient-profile-field">
            <span className="patient-profile-label">
              Emergency Contact
            </span>
            <strong>
              {getValue(
                patient?.emergencyContact
              )}
            </strong>
          </div>

          <div className="patient-profile-field patient-profile-full-width">
            <span className="patient-profile-label">
              Medical History
            </span>
            <strong>
              {getValue(
                patient?.medicalHistory
              )}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
