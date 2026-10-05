import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

import "./DoctorLaboratory.css";

function DoctorLaboratory() {
  const [doctor, setDoctor] = useState(null);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadLaboratory();
  }, []);

  async function loadLaboratory() {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setError("Logged-in doctor information was not found.");
        return;
      }

      const loggedInUser = JSON.parse(storedUser);

      const doctorResponse = await api.get("/doctors");

      let doctors = [];

      if (Array.isArray(doctorResponse.data)) {
        doctors = doctorResponse.data;
      } else if (Array.isArray(doctorResponse.data?.doctors)) {
        doctors = doctorResponse.data.doctors;
      } else if (Array.isArray(doctorResponse.data?.data)) {
        doctors = doctorResponse.data.data;
      }

      const loggedInDoctor = doctors.find(
        (item) =>
          String(item.email || "").toLowerCase() ===
          String(loggedInUser.email || "").toLowerCase()
      );

      if (!loggedInDoctor) {
        setError("Doctor profile could not be found.");
        return;
      }

      setDoctor(loggedInDoctor);

      const response = await api.get("/laboratory");

      let laboratoryData = [];

      if (Array.isArray(response.data)) {
        laboratoryData = response.data;
      } else if (Array.isArray(response.data?.laboratory)) {
        laboratoryData = response.data.laboratory;
      } else if (Array.isArray(response.data?.reports)) {
        laboratoryData = response.data.reports;
      } else if (Array.isArray(response.data?.data)) {
        laboratoryData = response.data.data;
      }

      const doctorId = String(
        loggedInDoctor._id || loggedInDoctor.id || ""
      );

      const doctorReports = laboratoryData.filter(
        (report) => {
          const reportDoctor =
            report.doctor?._id ||
            report.doctor?.id ||
            report.doctor;

          return String(reportDoctor || "") === doctorId;
        }
      );

      setReports(doctorReports);
    } catch (err) {
      console.error("Doctor laboratory error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load laboratory reports."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredReports = useMemo(() => {
    const value = search.trim().toLowerCase();

    return reports.filter((report) => {
      const patient =
        report.patient?.fullName ||
        report.patient?.name ||
        report.patientName ||
        "";

      const test =
        report.testName ||
        report.test ||
        "";

      const category =
        report.category || "";

      const result =
        report.result || "";

      const status =
        report.status || "Ordered";

      const matchesSearch =
        !value ||
        patient.toLowerCase().includes(value) ||
        test.toLowerCase().includes(value) ||
        category.toLowerCase().includes(value) ||
        result.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  function formatDate(value) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="doctor-lab-page">
      <div className="doctor-lab-header">
        <div>
          <h1>Laboratory</h1>
          <p>
            Review laboratory reports related to your patients.
          </p>
        </div>

        <button
          type="button"
          className="doctor-lab-refresh"
          onClick={loadLaboratory}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="doctor-lab-error">
          {error}
        </div>
      )}

      <div className="doctor-lab-summary">
        <div>
          <span>Total Reports</span>
          <strong>{reports.length}</strong>
        </div>

        <div>
          <span>Completed</span>
          <strong>
            {
              reports.filter(
                (item) => item.status === "Completed"
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Doctor</span>
          <strong>
            {doctor?.fullName || "Doctor"}
          </strong>
        </div>
      </div>

      <div className="doctor-lab-toolbar">
        <input
          type="text"
          placeholder="Search patient, test, category, result..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">All Status</option>
          <option value="Ordered">Ordered</option>
          <option value="Sample Collected">
            Sample Collected
          </option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="doctor-lab-table-card">
        {loading ? (
          <div className="doctor-lab-empty">
            Loading laboratory reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="doctor-lab-empty">
            <strong>No laboratory reports found</strong>
            <span>
              Reports related to your patients will appear here.
            </span>
          </div>
        ) : (
          <div className="doctor-lab-table-wrapper">
            <table className="doctor-lab-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Test</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Result</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report._id}>
                    <td>
                      <strong>
                        {report.patient?.fullName ||
                          report.patient?.name ||
                          report.patientName ||
                          "Unknown Patient"}
                      </strong>
                    </td>

                    <td>
                      {report.testName ||
                        report.test ||
                        "Not available"}
                    </td>

                    <td>
                      {report.category ||
                        "Not available"}
                    </td>

                    <td>
                      {formatDate(
                        report.testDate ||
                          report.date ||
                          report.createdAt
                      )}
                    </td>

                    <td>
                      {report.result || "Pending"}
                    </td>

                    <td>
                      <span className="doctor-lab-status">
                        {report.status || "Ordered"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="doctor-lab-view-button"
                        onClick={() =>
                          setSelectedReport(report)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedReport && (
        <div className="doctor-lab-modal-overlay">
          <div className="doctor-lab-modal">
            <div className="doctor-lab-modal-header">
              <div>
                <h2>Laboratory Report</h2>
                <p>
                  {selectedReport.patient?.fullName ||
                    selectedReport.patient?.name ||
                    selectedReport.patientName ||
                    "Patient"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
              >
                ×
              </button>
            </div>

            <div className="doctor-lab-details">
              <div>
                <span>Patient</span>
                <strong>
                  {selectedReport.patient?.fullName ||
                    selectedReport.patient?.name ||
                    selectedReport.patientName ||
                    "Unknown"}
                </strong>
              </div>

              <div>
                <span>Test</span>
                <strong>
                  {selectedReport.testName ||
                    selectedReport.test ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Category</span>
                <strong>
                  {selectedReport.category ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Date</span>
                <strong>
                  {formatDate(
                    selectedReport.testDate ||
                      selectedReport.date ||
                      selectedReport.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>Result</span>
                <strong>
                  {selectedReport.result || "Pending"}
                </strong>
              </div>

              <div>
                <span>Unit</span>
                <strong>
                  {selectedReport.unit || "Not available"}
                </strong>
              </div>

              <div>
                <span>Reference Range</span>
                <strong>
                  {selectedReport.referenceRange ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedReport.status || "Ordered"}
                </strong>
              </div>

              <div className="doctor-lab-full">
                <span>Notes</span>
                <strong>
                  {selectedReport.notes ||
                    "No notes available."}
                </strong>
              </div>
            </div>

            <div className="doctor-lab-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorLaboratory;