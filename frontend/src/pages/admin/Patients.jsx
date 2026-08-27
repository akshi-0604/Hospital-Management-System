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

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

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
  function getInitial(name) {
    if (!name) {
      return "?";
    }

    return name.charAt(0).toUpperCase();
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
            Manage registered patients and their
            information.
          </p>
        </div>

        <div className="patient-count">
          Total Patients: {patients.length}
        </div>

      </div>
      <div className="patients-filter-card">

        <div className="patients-search-wrapper">

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, email, phone..."
            className="patients-search"
          />

        </div>


        <select
          value={role}
          onChange={(event) =>
            setRole(event.target.value)
          }
          className="patients-role-select"
        >

          <option value="all">
            All Roles
          </option>

          {roles.map((patientRole) => (
            <option
              key={patientRole}
              value={patientRole}
            >
              {patientRole.charAt(0).toUpperCase() +
                patientRole.slice(1)}
            </option>
          ))}

        </select>


        <button
          type="button"
          className="patients-clear-button"
          onClick={clearFilters}
        >
          Clear
        </button>

      </div>
      <div className="patients-pagination-card">

        <div className="patients-result-info">

          {totalPatients === 0 ? (
            "Showing 0 patients"
          ) : (
            <>
              Showing{" "}
              <strong>{startIndex + 1}</strong>
              {" "}to{" "}
              <strong>{endIndex}</strong>
              {" "}of{" "}
              <strong>{totalPatients}</strong>
              {" "}patients
            </>
          )}

        </div>


        <div className="patients-pagination-controls">

          <label htmlFor="rowsPerPage">
            Show
          </label>

          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={(event) =>
              setRowsPerPage(
                Number(event.target.value)
              )
            }
            className="patients-page-size"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>


          <button
            type="button"
            className="patients-page-button"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(
                (page) => page - 1
              )
            }
          >
            ‹ Prev
          </button>


          {getPageNumbers().map((page) => (
            <button
              type="button"
              key={page}
              className={`patients-page-number ${
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
          ))}


          <button
            type="button"
            className="patients-page-button"
            disabled={currentPage === totalPages}
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
      <div className="patients-table-card">

        {loading && (
          <div className="patients-message">
            Loading patient records...
          </div>
        )}


        {!loading && error && (
          <div className="patients-error">
            {error}
          </div>
        )}


        {!loading &&
          !error &&
          totalPatients === 0 && (
            <div className="patients-message">
              No patients found.
            </div>
          )}


        {!loading &&
          !error &&
          totalPatients > 0 && (

            <div className="patients-table">

              <div className="patients-table-header">

                <span>
                  Full Name
                </span>

                <span>
                  Email
                </span>

                <span>
                  Phone
                </span>

                <span>
                  Role
                </span>

                <span>
                  Registered
                </span>

                <span>
                  Action
                </span>

              </div>
              {paginatedPatients.map(
                (patient) => (

                  <div
                    className="patients-table-row"
                    key={patient._id}
                  >
                    <div className="patient-name-cell">

                      <div className="patient-avatar">
                        {getInitial(
                          patient.fullName
                        )}
                      </div>

                      <strong>
                        {patient.fullName ||
                          "Unknown Patient"}
                      </strong>

                    </div>

                    <span className="patient-email">
                      {patient.email ||
                        "Not provided"}
                    </span>

                    <span>
                      {patient.phone ||
                        "Not provided"}
                    </span>

                    <span className="patient-role">

                      {patient.role
                        ? patient.role
                            .charAt(0)
                            .toUpperCase() +
                          patient.role.slice(1)
                        : "Patient"}

                    </span>

                    <span className="patient-date">
                      {formatDate(
                        patient.createdAt
                      )}
                    </span>
                    <div className="patient-action-cell">

                      <button
                        type="button"
                        className="patient-view-button"
                        onClick={() =>
                          handleView(patient)
                        }
                      >
                        View
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

      </div>

      {showViewModal &&
        selectedPatient && (

          <div
            className="patient-modal-overlay"
            onClick={closeViewModal}
          >

            <div
              className="patient-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="patient-modal-header">

                <div>
                  <h3>
                    Patient Details
                  </h3>

                  <p>
                    Registered patient information
                  </p>
                </div>

                <button
                  type="button"
                  className="patient-modal-close"
                  onClick={closeViewModal}
                >
                  ×
                </button>

              </div>


              <div className="patient-modal-profile">

                <div className="patient-modal-avatar">
                  {getInitial(
                    selectedPatient.fullName
                  )}
                </div>

                <div>
                  <h4>
                    {selectedPatient.fullName ||
                      "Unknown Patient"}
                  </h4>

                  <span>
                    {selectedPatient.role
                      ? selectedPatient.role
                          .charAt(0)
                          .toUpperCase() +
                        selectedPatient.role.slice(1)
                      : "Patient"}
                  </span>
                </div>

              </div>


              <div className="patient-details-grid">

                <div className="patient-detail-item">
                  <label>
                    Full Name
                  </label>

                  <p>
                    {selectedPatient.fullName ||
                      "Not provided"}
                  </p>
                </div>


                <div className="patient-detail-item">
                  <label>
                    Email
                  </label>

                  <p>
                    {selectedPatient.email ||
                      "Not provided"}
                  </p>
                </div>


                <div className="patient-detail-item">
                  <label>
                    Phone
                  </label>

                  <p>
                    {selectedPatient.phone ||
                      "Not provided"}
                  </p>
                </div>


                <div className="patient-detail-item">
                  <label>
                    Role
                  </label>

                  <p>
                    {selectedPatient.role ||
                      "patient"}
                  </p>
                </div>


                <div className="patient-detail-item">
                  <label>
                    Registered
                  </label>

                  <p>
                    {formatDate(
                      selectedPatient.createdAt
                    )}
                  </p>
                </div>


                <div className="patient-detail-item">
                  <label>
                    Patient ID
                  </label>

                  <p className="patient-id">
                    {selectedPatient._id ||
                      "Not available"}
                  </p>
                </div>

              </div>


              <div className="patient-modal-footer">

                <button
                  type="button"
                  className="patient-modal-done"
                  onClick={closeViewModal}
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