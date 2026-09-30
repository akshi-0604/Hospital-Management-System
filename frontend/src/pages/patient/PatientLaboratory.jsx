import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "./PatientLaboratory.css";

function PatientLaboratory() {
  const [laboratories, setLaboratories] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLaboratory, setSelectedLaboratory] =
    useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      const patientId =
        user?._id ||
        user?.id ||
        user?.userId;

      if (!patientId) {
        setLaboratories([]);
        setError(
          "Unable to identify the logged-in patient."
        );
        setLoading(false);
        return;
      }

      const response = await api.get("/laboratory");

      const allLaboratories =
        response.data?.laboratories || [];

      const patientLaboratories =
        allLaboratories.filter((item) => {
          const laboratoryPatientId =
            item.patient?._id ||
            item.patient ||
            item.patientId;

          return (
            String(laboratoryPatientId) ===
            String(patientId)
          );
        });

      setLaboratories(patientLaboratories);
    } catch (error) {
      console.error(
        "Load patient laboratory records error:",
        error
      );

      setLaboratories([]);

      setError(
        error.response?.data?.message ||
          "Unable to load laboratory records."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredLaboratories = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return laboratories.filter((item) => {
      const doctorName =
        item.doctor?.fullName || "";

      const testName =
        item.testName || "";

      const category =
        item.category || "";

      const result =
        item.result || "";

      const matchesSearch =
        !searchText ||
        doctorName
          .toLowerCase()
          .includes(searchText) ||
        testName
          .toLowerCase()
          .includes(searchText) ||
        category
          .toLowerCase()
          .includes(searchText) ||
        result
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    laboratories,
    search,
    statusFilter,
  ]);

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusClass(status) {
    return (
      status
        ?.toLowerCase()
        .replaceAll(" ", "-") || ""
    );
  }

  function openViewModal(laboratory) {
    setSelectedLaboratory(laboratory);
    setShowViewModal(true);
  }

  function closeViewModal() {
    setSelectedLaboratory(null);
    setShowViewModal(false);
  }

  const totalTests =
    laboratories.length;

  const completedTests =
    laboratories.filter(
      (item) =>
        item.status === "Completed"
    ).length;

  const processingTests =
    laboratories.filter(
      (item) =>
        item.status === "Processing" ||
        item.status ===
          "Sample Collected"
    ).length;

  return (
    <div className="patient-laboratory-page">

      <div className="patient-laboratory-header">
        <div>
          <h1>Laboratory</h1>

          <p>
            View your laboratory tests and
            results.
          </p>
        </div>
      </div>

      <div className="patient-lab-summary">

        <div className="patient-lab-summary-card">
          <span>
            Total Tests
          </span>

          <strong>
            {totalTests}
          </strong>
        </div>

        <div className="patient-lab-summary-card">
          <span>
            Completed
          </span>

          <strong>
            {completedTests}
          </strong>
        </div>

        <div className="patient-lab-summary-card">
          <span>
            Processing
          </span>

          <strong>
            {processingTests}
          </strong>
        </div>

      </div>

      <div className="patient-lab-toolbar">

        <input
          type="text"
          placeholder="Search doctor, test, category or result..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="All">
            All Status
          </option>

          <option value="Ordered">
            Ordered
          </option>

          <option value="Sample Collected">
            Sample Collected
          </option>

          <option value="Processing">
            Processing
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Cancelled">
            Cancelled
          </option>
        </select>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>

      {error && (
        <div className="patient-lab-error">
          {error}
        </div>
      )}

      <div className="patient-laboratory-table-card">

        {loading ? (
          <div className="patient-lab-empty">
            Loading laboratory records...
          </div>
        ) : filteredLaboratories.length ===
          0 ? (
          <div className="patient-lab-empty">

            <strong>
              No laboratory records found
            </strong>

            <span>
              Your laboratory test records
              will appear here.
            </span>

          </div>
        ) : (
          <div className="patient-laboratory-table-wrapper">

            <table className="patient-laboratory-table">

              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Test</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Result</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredLaboratories.map(
                  (item) => (
                    <tr
                      key={item._id}
                    >

                      <td>
                        <strong>
                          {item.doctor
                            ?.fullName ||
                            "Unknown Doctor"}
                        </strong>
                      </td>

                      <td>
                        {item.testName ||
                          "-"}
                      </td>

                      <td>
                        {item.category ||
                          "-"}
                      </td>

                      <td>
                        {formatDate(
                          item.testDate
                        )}
                      </td>

                      <td>
                        {item.result ||
                          "Pending"}

                        {item.unit
                          ? ` ${item.unit}`
                          : ""}
                      </td>

                      <td>
                        <span
                          className={`patient-lab-status ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status ||
                            "-"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="patient-view-lab-button"
                          onClick={() =>
                            openViewModal(
                              item
                            )
                          }
                        >
                          View
                        </button>
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {showViewModal &&
        selectedLaboratory && (
          <div className="patient-lab-modal-overlay">

            <div className="patient-lab-modal view-patient-lab-modal">

              <div className="patient-lab-modal-header">

                <div>
                  <h2>
                    Laboratory Result
                  </h2>

                  <p>
                    Your laboratory test
                    details.
                  </p>
                </div>

                <button
                  type="button"
                  className="patient-lab-close-button"
                  onClick={
                    closeViewModal
                  }
                >
                  ×
                </button>

              </div>

              <div className="patient-lab-details">

                <div className="patient-lab-detail-grid">

                  <div>
                    <span>
                      Patient
                    </span>

                    <strong>
                      {selectedLaboratory
                        .patient
                        ?.fullName ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Doctor
                    </span>

                    <strong>
                      {selectedLaboratory
                        .doctor
                        ?.fullName ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Department
                    </span>

                    <strong>
                      {selectedLaboratory
                        .doctor
                        ?.department ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Test
                    </span>

                    <strong>
                      {
                        selectedLaboratory.testName
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Category
                    </span>

                    <strong>
                      {
                        selectedLaboratory.category
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Date
                    </span>

                    <strong>
                      {formatDate(
                        selectedLaboratory.testDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Status
                    </span>

                    <strong>
                      {
                        selectedLaboratory.status ||
                        "-"
                      }
                    </strong>
                  </div>

                </div>

                <div className="patient-lab-result-card">

                  <span>
                    Result
                  </span>

                  <strong>
                    {selectedLaboratory.result ||
                      "Pending"}
                  </strong>

                  {selectedLaboratory.unit && (
                    <small>
                      {
                        selectedLaboratory.unit
                      }
                    </small>
                  )}

                </div>

                <div className="patient-lab-info-section">

                  <h3>
                    Reference Range
                  </h3>

                  <p>
                    {
                      selectedLaboratory.referenceRange ||
                      "-"
                    }
                  </p>

                </div>

                <div className="patient-lab-info-section">

                  <h3>
                    Notes
                  </h3>

                  <p>
                    {
                      selectedLaboratory.notes ||
                      "-"
                    }
                  </p>

                </div>

              </div>

              <div className="patient-lab-modal-footer">

                <button
                  type="button"
                  className="patient-cancel-lab-button"
                  onClick={
                    closeViewModal
                  }
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

export default PatientLaboratory;