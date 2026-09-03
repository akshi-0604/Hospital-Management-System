import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Billing.css";

const API_BASE_URL =
  "https://hospital-management-system-nvjt.onrender.com/api";

const BILLING_URL =
  `${API_BASE_URL}/billing`;

const PATIENTS_URL =
  `${API_BASE_URL}/patients`;

const DOCTORS_URL =
  `${API_BASE_URL}/doctors`;

const APPOINTMENTS_URL =
  `${API_BASE_URL}/appointments`;

const emptyItem = {
  description: "",
  category: "Other",
  amount: "",
};

const emptyForm = {
  patient: "",
  doctor: "",
  appointment: "",
  invoiceNumber: "",
  invoiceDate: "",
  dueDate: "",
  items: [{ ...emptyItem }],
  discount: "",
  tax: "",
  paymentStatus: "Pending",
  paymentMethod: "Cash",
  notes: "",
};

function Billing() {
  const [billings, setBillings] =
    useState([]);

  const [patients, setPatients] =
    useState([]);

  const [doctors, setDoctors] =
    useState([]);

  const [appointments, setAppointments] =
    useState([]);

  const [search, setSearch] = useState("");

  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [selectedBilling, setSelectedBilling] =
    useState(null);

  const [formData, setFormData] =
    useState(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      axios.get(BILLING_URL),
      axios.get(PATIENTS_URL),
      axios.get(DOCTORS_URL),
      axios.get(APPOINTMENTS_URL),
    ]);

    if (results[0].status === "fulfilled") {
      setBillings(
        results[0].value.data?.billings || []
      );
    } else {
      setBillings([]);
      setError(
        results[0].reason?.response?.data?.message ||
          "Unable to load billing records."
      );
    }

    if (results[1].status === "fulfilled") {
      setPatients(
        results[1].value.data?.patients || []
      );
    }

    if (results[2].status === "fulfilled") {
      setDoctors(
        results[2].value.data?.doctors || []
      );
    }

    if (results[3].status === "fulfilled") {
      setAppointments(
        results[3].value.data?.appointments || []
      );
    }

    setLoading(false);
  }

  const filteredBillings = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return billings.filter((bill) => {
      const patientName =
        bill.patient?.fullName || "";

      const invoiceNumber =
        bill.invoiceNumber || "";

      const matchesSearch =
        !searchText ||
        patientName
          .toLowerCase()
          .includes(searchText) ||
        invoiceNumber
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        paymentStatusFilter === "All" ||
        bill.paymentStatus ===
          paymentStatusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    billings,
    search,
    paymentStatusFilter,
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

  function formatCurrency(value) {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  }

  function getToday() {
    return new Date()
      .toISOString()
      .split("T")[0];
  }

  function generateInvoiceNumber() {
    const randomNumber =
      Math.floor(
        1000 + Math.random() * 9000
      );

    return `INV-${Date.now()
      .toString()
      .slice(-6)}-${randomNumber}`;
  }

  function openAddModal() {
    setFormData({
      ...emptyForm,
      invoiceNumber:
        generateInvoiceNumber(),
      invoiceDate: getToday(),
      dueDate: getToday(),
      items: [{ ...emptyItem }],
    });

    setShowAddModal(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setShowAddModal(false);
    setFormData(emptyForm);
  }

  function openViewModal(billing) {
    setSelectedBilling(billing);
    setShowViewModal(true);
  }

  function closeViewModal() {
    setSelectedBilling(null);
    setShowViewModal(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleDoctorChange(event) {
    setFormData((previous) => ({
      ...previous,
      doctor: event.target.value,
      appointment: "",
    }));
  }

  function updateItem(
    index,
    field,
    value
  ) {
    setFormData((previous) => {
      const updatedItems = [
        ...previous.items,
      ];

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      return {
        ...previous,
        items: updatedItems,
      };
    });
  }

  function addItem() {
    setFormData((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        { ...emptyItem },
      ],
    }));
  }

  function removeItem(index) {
    setFormData((previous) => ({
      ...previous,
      items: previous.items.filter(
        (_, itemIndex) =>
          itemIndex !== index
      ),
    }));
  }

  const availableAppointments =
    useMemo(() => {
      if (
        !formData.patient ||
        !formData.doctor
      ) {
        return [];
      }

      return appointments.filter(
        (appointment) => {
          const patientId =
            appointment.patient?._id ||
            appointment.patient;

          const doctorId =
            appointment.doctor?._id ||
            appointment.doctor;

          return (
            patientId ===
              formData.patient &&
            doctorId ===
              formData.doctor
          );
        }
      );
    }, [
      appointments,
      formData.patient,
      formData.doctor,
    ]);

  const calculatedSubtotal =
    formData.items.reduce(
      (total, item) =>
        total +
        Number(item.amount || 0),
      0
    );

  const calculatedDiscount =
    Number(formData.discount || 0);

  const calculatedTax =
    Number(formData.tax || 0);

  const calculatedTotal = Math.max(
    calculatedSubtotal -
      calculatedDiscount +
      calculatedTax,
    0
  );

  async function handleSubmit(event) {
    event.preventDefault();

    const validItems =
      formData.items.filter(
        (item) =>
          item.description.trim() &&
          Number(item.amount || 0) >= 0
      );

    if (
      !formData.patient ||
      !formData.invoiceNumber.trim() ||
      !formData.invoiceDate ||
      validItems.length === 0
    ) {
      alert(
        "Patient, invoice number, invoice date and at least one billing item are required."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        patient: formData.patient,
        doctor:
          formData.doctor || null,
        appointment:
          formData.appointment || null,
        invoiceNumber:
          formData.invoiceNumber.trim(),
        invoiceDate:
          formData.invoiceDate,
        dueDate:
          formData.dueDate || null,
        items: validItems.map(
          (item) => ({
            description:
              item.description.trim(),
            category:
              item.category.trim() ||
              "Other",
            amount:
              Number(item.amount || 0),
          })
        ),
        discount:
          Number(formData.discount || 0),
        tax:
          Number(formData.tax || 0),
        paymentStatus:
          formData.paymentStatus,
        paymentMethod:
          formData.paymentMethod,
        notes:
          formData.notes.trim(),
      };

      await axios.post(
        BILLING_URL,
        payload
      );

      alert(
        "Bill created successfully."
      );

      closeModal();
      await loadData();
    } catch (error) {
      console.error(
        "Create billing error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to create bill."
      );
    } finally {
      setSaving(false);
    }
  }

  const totalBills =
    billings.length;

  const paidBills =
    billings.filter(
      (bill) =>
        bill.paymentStatus === "Paid"
    ).length;

  const pendingBills =
    billings.filter(
      (bill) =>
        bill.paymentStatus ===
        "Pending"
    ).length;

  const totalRevenue =
    billings
      .filter(
        (bill) =>
          bill.paymentStatus === "Paid"
      )
      .reduce(
        (total, bill) =>
          total +
          Number(
            bill.totalAmount || 0
          ),
        0
      );

  return (
    <div className="billing-page">
      <div className="billing-header">
        <div>
          <h1>Billing</h1>

          <p>
            Manage invoices, payments and
            patient billing records.
          </p>
        </div>

        <button
          type="button"
          className="add-bill-button"
          onClick={openAddModal}
        >
          + Create Bill
        </button>
      </div>

      <div className="billing-summary">
        <div className="billing-summary-card">
          <span>
            Total Bills
          </span>
          <strong>
            {totalBills}
          </strong>
        </div>

        <div className="billing-summary-card">
          <span>
            Paid Bills
          </span>
          <strong>
            {paidBills}
          </strong>
        </div>

        <div className="billing-summary-card">
          <span>
            Pending Bills
          </span>
          <strong>
            {pendingBills}
          </strong>
        </div>

        <div className="billing-summary-card">
          <span>
            Paid Revenue
          </span>
          <strong>
            {formatCurrency(
              totalRevenue
            )}
          </strong>
        </div>
      </div>

      <div className="billing-toolbar">
        <input
          type="text"
          placeholder="Search invoice or patient..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

        <select
          value={
            paymentStatusFilter
          }
          onChange={(event) =>
            setPaymentStatusFilter(
              event.target.value
            )
          }
        >
          <option value="All">
            All Payments
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Partially Paid">
            Partially Paid
          </option>

          <option value="Paid">
            Paid
          </option>

          <option value="Cancelled">
            Cancelled
          </option>
        </select>

        <button
          type="button"
          onClick={loadData}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="billing-error">
          {error}
        </div>
      )}

      <div className="billing-table-card">
        {loading ? (
          <div className="billing-empty">
            Loading billing records...
          </div>
        ) : filteredBillings.length ===
          0 ? (
          <div className="billing-empty">
            <strong>
              No billing records found
            </strong>

            <span>
              Create a bill to see real
              billing data here.
            </span>
          </div>
        ) : (
          <div className="billing-table-wrapper">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>
                    Invoice
                  </th>

                  <th>
                    Patient
                  </th>

                  <th>
                    Doctor
                  </th>

                  <th>
                    Invoice Date
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Method
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredBillings.map(
                  (bill) => (
                    <tr
                      key={bill._id}
                    >
                      <td>
                        <strong>
                          {
                            bill.invoiceNumber
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          bill.patient
                            ?.fullName ||
                          "Unknown Patient"
                        }
                      </td>

                      <td>
                        {bill.doctor
                          ?.fullName ||
                          "Not assigned"}
                      </td>

                      <td>
                        {formatDate(
                          bill.invoiceDate
                        )}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            bill.totalAmount
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`payment-status ${bill.paymentStatus
                            ?.toLowerCase()
                            .replaceAll(
                              " ",
                              "-"
                            )}`}
                        >
                          {
                            bill.paymentStatus
                          }
                        </span>
                      </td>

                      <td>
                        {
                          bill.paymentMethod
                        }
                      </td>

                      <td>
                        <button
                          type="button"
                          className="view-bill-button"
                          onClick={() =>
                            openViewModal(
                              bill
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

      {/* ADD BILL MODAL */}

      {showAddModal && (
        <div className="billing-modal-overlay">
          <div className="billing-modal">
            <div className="billing-modal-header">
              <div>
                <h2>
                  Create Bill
                </h2>

                <p>
                  Create a new patient
                  billing invoice.
                </p>
              </div>

              <button
                type="button"
                className="billing-close-button"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form
              className="billing-form"
              onSubmit={handleSubmit}
            >
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Patient *
                  </label>

                  <select
                    name="patient"
                    value={
                      formData.patient
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >
                    <option value="">
                      Select patient
                    </option>

                    {patients.map(
                      (patient) => (
                        <option
                          key={
                            patient._id
                          }
                          value={
                            patient._id
                          }
                        >
                          {
                            patient.fullName
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Doctor
                  </label>

                  <select
                    name="doctor"
                    value={
                      formData.doctor
                    }
                    onChange={
                      handleDoctorChange
                    }
                  >
                    <option value="">
                      Not assigned
                    </option>

                    {doctors.map(
                      (doctor) => (
                        <option
                          key={
                            doctor._id
                          }
                          value={
                            doctor._id
                          }
                        >
                          {
                            doctor.fullName
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Appointment
                  </label>

                  <select
                    name="appointment"
                    value={
                      formData.appointment
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      No appointment linked
                    </option>

                    {availableAppointments.map(
                      (
                        appointment
                      ) => (
                        <option
                          key={
                            appointment._id
                          }
                          value={
                            appointment._id
                          }
                        >
                          {formatDate(
                            appointment.appointmentDate
                          )}{" "}
                          -{" "}
                          {
                            appointment.appointmentTime
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Invoice Number *
                  </label>

                  <input
                    name="invoiceNumber"
                    value={
                      formData.invoiceNumber
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Invoice Date *
                  </label>

                  <input
                    type="date"
                    name="invoiceDate"
                    value={
                      formData.invoiceDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={
                      formData.dueDate
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>
              </div>

              <div className="billing-items-heading">
                <div>
                  <h3>
                    Billing Items
                  </h3>

                  <span>
                    Add consultation,
                    tests, medicines,
                    room charges, etc.
                  </span>
                </div>

                <button
                  type="button"
                  className="add-billing-item-button"
                  onClick={
                    addItem
                  }
                >
                  + Add Item
                </button>
              </div>

              <div className="billing-items-list">
                {formData.items.map(
                  (item, index) => (
                    <div
                      className="billing-item-card"
                      key={index}
                    >
                      <div className="billing-item-top">
                        <strong>
                          Item{" "}
                          {index + 1}
                        </strong>

                        {formData
                          .items.length >
                          1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                index
                              )
                            }
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="billing-item-grid">
                        <div className="form-group">
                          <label>
                            Description *
                          </label>

                          <input
                            value={
                              item.description
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "description",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Doctor Consultation"
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Category
                          </label>

                          <select
                            value={
                              item.category
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "category",
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            <option>
                              Consultation
                            </option>

                            <option>
                              Laboratory
                            </option>

                            <option>
                              Medicine
                            </option>

                            <option>
                              Room
                            </option>

                            <option>
                              Procedure
                            </option>

                            <option>
                              Other
                            </option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>
                            Amount *
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              item.amount
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "amount",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="1000"
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="billing-calculation">
                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatCurrency(
                      calculatedSubtotal
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Discount
                  </span>

                  <input
                    type="number"
                    min="0"
                    name="discount"
                    value={
                      formData.discount
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <span>
                    Tax
                  </span>

                  <input
                    type="number"
                    min="0"
                    name="tax"
                    value={
                      formData.tax
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="0"
                  />
                </div>

                <div className="billing-total">
                  <span>
                    Total Amount
                  </span>

                  <strong>
                    {formatCurrency(
                      calculatedTotal
                    )}
                  </strong>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Payment Status
                  </label>

                  <select
                    name="paymentStatus"
                    value={
                      formData.paymentStatus
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Partially Paid">
                      Partially Paid
                    </option>

                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Payment Method
                  </label>

                  <select
                    name="paymentMethod"
                    value={
                      formData.paymentMethod
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option>
                      Cash
                    </option>

                    <option>
                      UPI
                    </option>

                    <option>
                      Card
                    </option>

                    <option>
                      Net Banking
                    </option>

                    <option>
                      Insurance
                    </option>

                    <option>
                      Other
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={
                    formData.notes
                  }
                  onChange={
                    handleChange
                  }
                  rows="3"
                  placeholder="Billing notes..."
                />
              </div>

              <div className="billing-modal-footer">
                <button
                  type="button"
                  className="cancel-bill-button"
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-bill-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Create Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW BILL */}

      {showViewModal &&
        selectedBilling && (
          <div className="billing-modal-overlay">
            <div className="billing-modal view-billing-modal">
              <div className="billing-modal-header">
                <div>
                  <h2>
                    Invoice{" "}
                    {
                      selectedBilling.invoiceNumber
                    }
                  </h2>

                  <p>
                    Patient billing details.
                  </p>
                </div>

                <button
                  type="button"
                  className="billing-close-button"
                  onClick={
                    closeViewModal
                  }
                >
                  ×
                </button>
              </div>

              <div className="billing-details">
                <div className="billing-detail-grid">
                  <div>
                    <span>
                      Patient
                    </span>

                    <strong>
                      {selectedBilling
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
                      {selectedBilling
                        .doctor
                        ?.fullName ||
                        "Not assigned"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Invoice Date
                    </span>

                    <strong>
                      {formatDate(
                        selectedBilling.invoiceDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Due Date
                    </span>

                    <strong>
                      {formatDate(
                        selectedBilling.dueDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Payment Status
                    </span>

                    <strong>
                      {
                        selectedBilling.paymentStatus
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Payment Method
                    </span>

                    <strong>
                      {
                        selectedBilling.paymentMethod
                      }
                    </strong>
                  </div>
                </div>

                <div className="invoice-items">
                  <h3>
                    Billing Items
                  </h3>

                  {selectedBilling.items?.map(
                    (item, index) => (
                      <div
                        className="invoice-item-row"
                        key={
                          item._id ||
                          index
                        }
                      >
                        <div>
                          <strong>
                            {
                              item.description
                            }
                          </strong>

                          <span>
                            {
                              item.category
                            }
                          </span>
                        </div>

                        <strong>
                          {formatCurrency(
                            item.amount
                          )}
                        </strong>
                      </div>
                    )
                  )}
                </div>

                <div className="invoice-totals">
                  <div>
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBilling.subtotal
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Discount
                    </span>

                    <strong>
                      -
                      {formatCurrency(
                        selectedBilling.discount
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Tax
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBilling.tax
                      )}
                    </strong>
                  </div>

                  <div className="invoice-grand-total">
                    <span>
                      Total
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBilling.totalAmount
                      )}
                    </strong>
                  </div>
                </div>

                <div className="billing-view-notes">
                  <h3>
                    Notes
                  </h3>

                  <p>
                    {selectedBilling
                      .notes || "-"}
                  </p>
                </div>
              </div>

              <div className="billing-modal-footer">
                <button
                  type="button"
                  className="cancel-bill-button"
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

export default Billing;