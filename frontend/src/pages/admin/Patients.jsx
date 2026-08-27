import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import "./Patients.css";

const API_URL =
  "https://hospital-management-system-nvjt.onrender.com/api/patients";

function Patients() {
  const [patients, setPatients] = useState([]);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // View patient modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      console.log("Patients API response:", response.data);

      if (Array.isArray(response.data)) {
        setPatients(response.data);
      } else if (Array.isArray(response.data.patients)) {
        setPatients(response.data.patients);
      } else if (Array.isArray(response.data.data)) {
        setPatients(response.data.data);
      } else {
        setPatients([]);

        setError("Patient data format is invalid.");
      }
    } catch (error) {
      console.error("Error while getting patients:", error);

      setPatients([]);

      setError(
        error.response?.data?.message ||
          "Unable to load patient records."
      );
    } finally {
      setLoading(false);
    }
  }

  const roles = useMemo(() => {
    return [
      ...new Set(
        patients
          .map((patient) => patient.role)
          .filter(Boolean)
      ),
    ].sort();
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return patients.filter((patient) => {
      const matchesSearch =
        !searchText ||
        patient.fullName
          ?.toLowerCase()
          .includes(searchText) ||
        patient.email
          ?.toLowerCase()
          .includes(searchText) ||
        patient.phone
          ?.toLowerCase()
          .includes(searchText) ||
        patient.role
          ?.toLowerCase()
          .includes(searchText);

      const matchesRole =
        role === "all" ||
        patient.role?.toLowerCase() ===
          role.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [patients, search, role]);

  const totalPatients = filteredPatients.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalPatients / rowsPerPage)
  );

  const startIndex =
    (currentPage - 1) * rowsPerPage;

  const endIndex = Math.min(
    startIndex + rowsPerPage,
    totalPatients
  );

  const paginatedPatients =
    filteredPatients.slice(
      startIndex,
      endIndex
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, role, rowsPerPage]);
  function formatDate(date) {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN");
  }

  function handleView(patient) {
    setSelectedPatient(patient);
    setShowViewModal(true);
  }

  function closeViewModal() {
    setSelectedPatient(null);
    setShowViewModal(false);
  }
  function clearFilters() {
    setSearch("");
    setRole("all");
    setCurrentPage(1);
  }
  function getPageNumbers() {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      currentPage - 2
    );

    let endPage = Math.min(
      totalPages,
      startPage + maxVisiblePages - 1
    );

    if (
      endPage - startPage <
      maxVisiblePages - 1
    ) {
      startPage = Math.max(
        1,
        endPage - maxVisiblePages + 1
      );
    }

    for (
      let page = startPage;
      page <= endPage;
      page++
    ) {
      pages.push(page);
    }

    return pages;
  }
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

      <div className="patient-filters">

        <div className="search-box">

          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>


        <select
          value={role}
          onChange={(event) =>
            setRole(event.target.value)
          }
        >

          <option value="all">
            All Roles
          </option>

          {roles.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}

        </select>


        <button
          type="button"
          className="clear-filter-button"
          onClick={clearFilters}
        >
          Clear
        </button>

      </div>

      <div className="patients-pagination">

        <div className="pagination-left">

          <span className="pagination-result">

            Showing{" "}

            <strong>
              {totalPatients === 0
                ? 0
                : startIndex + 1}
            </strong>

            {" "}to{" "}

            <strong>
              {endIndex}
            </strong>

            {" "}of{" "}

            <strong>
              {totalPatients}
            </strong>

            {" "}patients

          </span>

        </div>


        <div className="pagination-right">

          <div className="rows-per-page">

            <span>
              Show
            </span>

            <select
              value={rowsPerPage}
              onChange={(event) =>
                setRowsPerPage(
                  Number(event.target.value)
                )
              }
            >

              <option value="5">
                5
              </option>

              <option value="10">
                10
              </option>

              <option value="20">
                20
              </option>

              <option value="50">
                50
              </option>

            </select>

          </div>


          <button
            type="button"
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(
                (page) => page - 1
              )
            }
          >
            ‹ Prev
          </button>


          <div className="pagination-pages">

            {getPageNumbers().map(
              (page) => (
                <button
                  type="button"
                  key={page}
                  className={`pagination-page ${
                    currentPage === page
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setCurrentPage(page)
                  }
                >
                  {page}
                </button>
              )
            )}

          </div>


          <button
            type="button"
            className="pagination-button"
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setCurrentPage(
                (page) => page + 1
              )
            }
          >
            Next ›
          </button>

        </div>

      </div>
      <div className="patients-card">

        <div className="patients-table-wrapper">

          <table className="patients-table">

            <thead>

              <tr>

                <th>
                  Patient Name
                </th>

                <th>
                  Email
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Role
                </th>

                <th>
                  Registered
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="table-message"
                  >
                    Loading patient records...
                  </td>

                </tr>

              ) : error ? (

                <tr>

                  <td
                    colSpan="6"
                    className="table-message"
                  >
                    {error}
                  </td>

                </tr>

              ) : paginatedPatients.length ===
                0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="table-message"
                  >
                    No patients found.
                  </td>

                </tr>

              ) : (

                paginatedPatients.map(
                  (patient) => (

                    <tr
                      key={patient._id}
                    >

                      <td>

                        <div className="patient-name-cell">

                          <div className="patient-avatar">

                            {patient.fullName
                              ?.charAt(0)
                              .toUpperCase() || "P"}

                          </div>

                          <strong>
                            {patient.fullName ||
                              "-"}
                          </strong>

                        </div>

                      </td>

                      <td>
                        {patient.email || "-"}
                      </td>

                      <td>
                        {patient.phone ||
                          "Not provided"}
                      </td>

                      <td>

                        <span className="patient-role">

                          {patient.role ||
                            "Patient"}

                        </span>

                      </td>

                      <td>
                        {formatDate(
                          patient.createdAt
                        )}
                      </td>

                      <td className="action-cell">

                        <button
                          type="button"
                          className="view-button"
                          onClick={() =>
                            handleView(
                              patient
                            )
                          }
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>
      {showViewModal &&
        selectedPatient && (

          <div
            className="patient-modal-overlay"
            onMouseDown={(event) => {

              if (
                event.target ===
                event.currentTarget
              ) {
                closeViewModal();
              }

            }}
          >

            <div className="patient-modal">

              {/* MODAL HEADER */}

              <div className="patient-modal-header">

                <div>

                  <h3>
                    Patient Details
                  </h3>

                  <p>
                    Complete patient information.
                  </p>

                </div>


                <button
                  type="button"
                  className="modal-close-button"
                  onClick={
                    closeViewModal
                  }
                >
                  ×
                </button>

              </div>
              <div className="patient-modal-body">

                <div className="patient-profile-header">

                  <div className="large-patient-avatar">

                    {selectedPatient.fullName
                      ?.charAt(0)
                      .toUpperCase() || "P"}

                  </div>


                  <div>

                    <h3>
                      {selectedPatient.fullName ||
                        "-"}
                    </h3>

                    <p>
                      {selectedPatient.email ||
                        "-"}
                    </p>

                    <span className="patient-role">

                      {selectedPatient.role ||
                        "Patient"}

                    </span>

                  </div>

                </div>

                <div className="patient-details-grid">

                  <div className="patient-detail-item">

                    <span>
                      Patient Name
                    </span>

                    <strong>
                      {selectedPatient.fullName ||
                        "-"}
                    </strong>

                  </div>


                  <div className="patient-detail-item">

                    <span>
                      Email
                    </span>

                    <strong>
                      {selectedPatient.email ||
                        "-"}
                    </strong>

                  </div>


                  <div className="patient-detail-item">

                    <span>
                      Phone
                    </span>

                    <strong>
                      {selectedPatient.phone ||
                        "Not provided"}
                    </strong>

                  </div>


                  <div className="patient-detail-item">

                    <span>
                      Role
                    </span>

                    <strong>
                      {selectedPatient.role ||
                        "Patient"}
                    </strong>

                  </div>


                  <div className="patient-detail-item">

                    <span>
                      Registered Date
                    </span>

                    <strong>
                      {formatDate(
                        selectedPatient.createdAt
                      )}
                    </strong>

                  </div>


                  <div className="patient-detail-item">

                    <span>
                      Last Updated
                    </span>

                    <strong>
                      {formatDate(
                        selectedPatient.updatedAt
                      )}
                    </strong>

                  </div>


                  <div className="patient-detail-item">

                    <span>
                      Patient ID
                    </span>

                    <strong>
                      {selectedPatient._id ||
                        "-"}
                    </strong>

                  </div>

                </div>

              </div>

              <div className="patient-modal-footer">

                <button
                  type="button"
                  className="modal-cancel-button"
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

export default Patients;