import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";``

import "./Billing.css";

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

const emptyPaymentForm = {
  amount: "",
  paymentDate: "",
  paymentMethod: "Cash",
  referenceNumber: "",
  notes: "",
};

function Billing() {
  const [billings, setBillings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [search, setSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPayment, setSavingPayment] =
    useState(false);

  const [error, setError] = useState("");

  // Create bill
  const [showAddModal, setShowAddModal] =
    useState(false);

  // View bill
  const [showViewModal, setShowViewModal] =
    useState(false);

  // Record payment
  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [selectedBilling, setSelectedBilling] =
    useState(null);

  const [formData, setFormData] =
    useState(emptyForm);

  const [paymentForm, setPaymentForm] =
    useState(emptyPaymentForm);
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const results =
      await Promise.allSettled([
        api.get("/billing"),
        api.get("/patients"),
        api.get("/doctors"),
        api.get("/appointments"),
      ]);

    // Billing
    if (
      results[0].status ===
      "fulfilled"
    ) {
      const response =
        results[0].value.data;

      if (
        Array.isArray(response)
      ) {
        setBillings(response);
      } else if (
        Array.isArray(
          response?.billings
        )
      ) {
        setBillings(
          response.billings
        );
      } else if (
        Array.isArray(
          response?.data
        )
      ) {
        setBillings(
          response.data
        );
      } else {
        setBillings([]);
      }
    } else {
      setBillings([]);

      setError(
        results[0].reason?.response
          ?.data?.message ||
        "Unable to load billing records."
      );
    }

    // Patients
    if (
      results[1].status ===
      "fulfilled"
    ) {
      const response =
        results[1].value.data;

      if (
        Array.isArray(response)
      ) {
        setPatients(response);
      } else if (
        Array.isArray(
          response?.patients
        )
      ) {
        setPatients(
          response.patients
        );
      } else if (
        Array.isArray(
          response?.data
        )
      ) {
        setPatients(
          response.data
        );
      }
    }

    // Doctors
    if (
      results[2].status ===
      "fulfilled"
    ) {
      const response =
        results[2].value.data;

      if (
        Array.isArray(response)
      ) {
        setDoctors(response);
      } else if (
        Array.isArray(
          response?.doctors
        )
      ) {
        setDoctors(
          response.doctors
        );
      } else if (
        Array.isArray(
          response?.data
        )
      ) {
        setDoctors(
          response.data
        );
      }
    }

    // Appointments
    if (
      results[3].status ===
      "fulfilled"
    ) {
      const response =
        results[3].value.data;

      if (
        Array.isArray(response)
      ) {
        setAppointments(response);
      } else if (
        Array.isArray(
          response?.appointments
        )
      ) {
        setAppointments(
          response.appointments
        );
      } else if (
        Array.isArray(
          response?.data
        )
      ) {
        setAppointments(
          response.data
        );
      }
    }

    setLoading(false);
  }

  const filteredBillings =
    useMemo(() => {
      const searchText =
        search.trim().toLowerCase();

      return billings.filter(
        (bill) => {
          const patientName =
            bill.patient
              ?.fullName || "";

          const invoiceNumber =
            bill.invoiceNumber ||
            "";

          const matchesSearch =
            !searchText ||
            patientName
              .toLowerCase()
              .includes(
                searchText
              ) ||
            invoiceNumber
              .toLowerCase()
              .includes(
                searchText
              );

          const matchesStatus =
            paymentStatusFilter ===
            "All" ||
            bill.paymentStatus ===
            paymentStatusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      billings,
      search,
      paymentStatusFilter,
    ]);

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
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
        1000 +
        Math.random() * 9000
      );

    return `INV-${Date.now()
      .toString()
      .slice(-6)}-${randomNumber}`;
  }

  function getAmountPaid(bill) {
    return Number(
      bill?.amountPaid || 0
    );
  }

  function getBalanceAmount(bill) {
    if (!bill) {
      return 0;
    }
    if (
      bill.paymentStatus ===
      "Paid" ||
      bill.paymentStatus ===
      "Cancelled"
    ) {
      return 0;
    }

    const totalAmount =
      Number(
        bill.totalAmount || 0
      );

    const amountPaid =
      Number(
        bill.amountPaid || 0
      );
    return Math.max(
      totalAmount -
      amountPaid,
      0
    );
  }

  function isToday(value) {
    if (!value) {
      return false;
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return false;
    }

    const today =
      new Date();

    return (
      date.getDate() ===
      today.getDate() &&
      date.getMonth() ===
      today.getMonth() &&
      date.getFullYear() ===
      today.getFullYear()
    );
  }

  const calculatedSubtotal =
    formData.items.reduce(
      (total, item) =>
        total +
        Number(
          item.amount || 0
        ),
      0
    );

  const calculatedDiscount =
    Number(
      formData.discount || 0
    );

  const calculatedTax =
    Number(
      formData.tax || 0
    );

  const calculatedTotal =
    Math.max(
      calculatedSubtotal -
      calculatedDiscount +
      calculatedTax,
      0
    );
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
            appointment.patient
              ?._id ||
            appointment.patient;

          const doctorId =
            appointment.doctor
              ?._id ||
            appointment.doctor;

          return (
            String(patientId) ===
            String(
              formData.patient
            ) &&
            String(doctorId) ===
            String(
              formData.doctor
            )
          );
        }
      );
    }, [
      appointments,
      formData.patient,
      formData.doctor,
    ]);
  const totalBills =
    billings.length;

  const paidBills =
    billings.filter(
      (bill) =>
        bill.paymentStatus ===
        "Paid"
    ).length;

  const partiallyPaidBills =
    billings.filter(
      (bill) =>
        bill.paymentStatus ===
        "Partially Paid"
    ).length;

  const pendingBills =
    billings.filter(
      (bill) =>
        bill.paymentStatus ===
        "Pending"
    ).length;

  const totalPaidRevenue =
    billings.reduce(
      (total, bill) =>
        total +
        getAmountPaid(bill),
      0
    );

  const todaysRevenue =
    billings.reduce(
      (total, bill) => {
        if (
          !Array.isArray(
            bill.payments
          )
        ) {
          return total;
        }

        const todayPayments =
          bill.payments.reduce(
            (
              paymentTotal,
              payment
            ) => {
              if (
                isToday(
                  payment.paymentDate
                )
              ) {
                return (
                  paymentTotal +
                  Number(
                    payment.amount ||
                    0
                  )
                );
              }

              return paymentTotal;
            },
            0
          );

        return (
          total +
          todayPayments
        );
      },
      0
    );
  function openAddModal() {
    setFormData({
      ...emptyForm,

      invoiceNumber:
        generateInvoiceNumber(),

      invoiceDate:
        getToday(),

      dueDate:
        getToday(),

      items: [
        { ...emptyItem },
      ],
    });

    setError("");

    setShowAddModal(true);
  }

  function closeAddModal() {
    if (saving) {
      return;
    }

    setShowAddModal(false);
    setFormData(emptyForm);
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  }

  function handleDoctorChange(
    event
  ) {
    setFormData(
      (previous) => ({
        ...previous,
        doctor:
          event.target.value,
        appointment: "",
      })
    );
  }

  function updateItem(
    index,
    field,
    value
  ) {
    setFormData(
      (previous) => {
        const updatedItems =
          [
            ...previous.items,
          ];

        updatedItems[index] =
        {
          ...updatedItems[
          index
          ],
          [field]: value,
        };

        return {
          ...previous,
          items:
            updatedItems,
        };
      }
    );
  }

  function addItem() {
    setFormData(
      (previous) => ({
        ...previous,
        items: [
          ...previous.items,
          { ...emptyItem },
        ],
      })
    );
  }

  function removeItem(
    index
  ) {
    setFormData(
      (previous) => ({
        ...previous,
        items:
          previous.items.filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              index
          ),
      })
    );
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    const validItems =
      formData.items.filter(
        (item) =>
          item.description.trim() &&
          Number(
            item.amount || 0
          ) >= 0
      );

    if (
      !formData.patient ||
      !formData.invoiceNumber.trim() ||
      !formData.invoiceDate ||
      validItems.length ===
      0
    ) {
      alert(
        "Patient, invoice number, invoice date and at least one billing item are required."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        patient:
          formData.patient,

        doctor:
          formData.doctor ||
          null,

        appointment:
          formData.appointment ||
          null,

        invoiceNumber:
          formData.invoiceNumber.trim(),

        invoiceDate:
          formData.invoiceDate,

        dueDate:
          formData.dueDate ||
          null,

        items:
          validItems.map(
            (item) => ({
              description:
                item.description.trim(),

              category:
                item.category.trim() ||
                "Other",

              amount:
                Number(
                  item.amount || 0
                ),
            })
          ),

        discount:
          Number(
            formData.discount || 0
          ),

        tax:
          Number(
            formData.tax || 0
          ),

        paymentStatus:
          "Pending",

        paymentMethod:
          formData.paymentMethod,

        notes:
          formData.notes.trim(),
      };

      await api.post(
  "/billing",
  payload
);

      alert(
        "Bill created successfully. You can record the patient's payment using Edit."
      );

      closeAddModal();
      await loadData();
    } catch (error) {
      console.error(
        "Create billing error:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
        "Unable to create bill."
      );
    } finally {
      setSaving(false);
    }
  }

  function openViewModal(
    billing
  ) {
    setSelectedBilling(
      billing
    );
    setShowViewModal(true);
  }

  function closeViewModal() {
    setSelectedBilling(null);
    setShowViewModal(false);
  }

  function openPaymentModal(
    billing
  ) {
    const balance =
      getBalanceAmount(
        billing
      );

    if (balance <= 0) {
      alert(
        "This bill has no remaining balance."
      );
      return;
    }

    setSelectedBilling(
      billing
    );

    setPaymentForm({
      amount: "",
      paymentDate:
        getToday(),
      paymentMethod:
        billing.paymentMethod ||
        "Cash",
      referenceNumber: "",
      notes: "",
    });

    setError("");

    setShowPaymentModal(
      true
    );
  }

  function closePaymentModal() {
    if (savingPayment) {
      return;
    }

    setShowPaymentModal(
      false
    );

    setSelectedBilling(
      null
    );

    setPaymentForm(
      emptyPaymentForm
    );
  }

  function handlePaymentChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setPaymentForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  }

  async function handleRecordPayment(
    event
  ) {
    event.preventDefault();

    if (!selectedBilling) {
      return;
    }

    const paymentAmount =
      Number(
        paymentForm.amount
      );

    const balance =
      getBalanceAmount(
        selectedBilling
      );

    if (
      !Number.isFinite(
        paymentAmount
      ) ||
      paymentAmount <= 0
    ) {
      alert(
        "Please enter a valid payment amount."
      );
      return;
    }

    if (
      paymentAmount >
      balance
    ) {
      alert(
        `Payment cannot exceed the remaining balance of ${formatCurrency(
          balance
        )}.`
      );
      return;
    }

    try {
      setSavingPayment(
        true
      );

      const response =
  await api.patch(
    `/billing/${selectedBilling._id}/payment`,
    {
            amount:
              paymentAmount,

            paymentDate:
              paymentForm.paymentDate,

            paymentMethod:
              paymentForm.paymentMethod,

            referenceNumber:
              paymentForm.referenceNumber.trim(),

            notes:
              paymentForm.notes.trim(),
          }
        );

      alert(
        response.data?.message ||
        "Payment recorded successfully."
      );

      closePaymentModal();

      await loadData();
    } catch (error) {
      console.error(
        "Record payment error:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
        "Unable to record payment."
      );
    } finally {
      setSavingPayment(
        false
      );
    }
  }

  function getPaymentHistory(
    billing
  ) {
    if (
      !Array.isArray(
        billing?.payments
      )
    ) {
      return [];
    }

    return [
      ...billing.payments,
    ].sort(
      (a, b) =>
        new Date(
          b.paymentDate
        ).getTime() -
        new Date(
          a.paymentDate
        ).getTime()
    );
  }
  return (
    <div className="billing-page">

      <div className="billing-header">

        <div>
          <h1>
            Billing
          </h1>

          <p>
            Manage invoices,
            payments and patient
            billing records.
          </p>
        </div>

        <button
          type="button"
          className="add-bill-button"
          onClick={
            openAddModal
          }
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

          <small>
            All invoices
          </small>
        </div>


        <div className="billing-summary-card">
          <span>
            Paid Bills
          </span>

          <strong>
            {paidBills}
          </strong>

          <small>
            Fully paid
          </small>
        </div>


        <div className="billing-summary-card">
          <span>
            Partially Paid
          </span>

          <strong>
            {partiallyPaidBills}
          </strong>

          <small>
            Balance remaining
          </small>
        </div>


        <div className="billing-summary-card">
          <span>
            Pending Bills
          </span>

          <strong>
            {pendingBills}
          </strong>

          <small>
            No payment yet
          </small>
        </div>


        <div className="billing-summary-card">
          <span>
            Paid Revenue
          </span>

          <strong>
            {formatCurrency(
              totalPaidRevenue
            )}
          </strong>

          <small>
            Total collected
          </small>
        </div>


        <div className="billing-summary-card">
          <span>
            Today's Revenue
          </span>

          <strong>
            {formatCurrency(
              todaysRevenue
            )}
          </strong>

          <small>
            Payments received today
          </small>
        </div>

      </div>

      <div className="billing-toolbar">

        <input
          type="text"
          placeholder="Search invoice or patient..."
          value={search}
          onChange={(
            event
          ) =>
            setSearch(
              event.target.value
            )
          }
        />

        <select
          value={
            paymentStatusFilter
          }
          onChange={(
            event
          ) =>
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
          onClick={
            loadData
          }
        >
          ↻ Refresh
        </button>

      </div>


      {error && (
        <div className="billing-error">
          {error}
        </div>
      )}


      {/* TABLE */}

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
              Create a bill to see
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
                    Total
                  </th>

                  <th>
                    Paid
                  </th>

                  <th>
                    Balance
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
                      key={
                        bill._id
                      }
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
                        {
                          bill.doctor
                            ?.fullName ||
                          "Not assigned"
                        }
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


                      <td className="paid-amount-cell">
                        <strong>
                          {formatCurrency(
                            getAmountPaid(
                              bill
                            )
                          )}
                        </strong>
                      </td>


                      <td className="balance-amount-cell">
                        <strong>
                          {formatCurrency(
                            getBalanceAmount(
                              bill
                            )
                          )}
                        </strong>
                      </td>


                      <td>
                        <span
                          className={`payment-status ${String(
                            bill.paymentStatus ||
                            ""
                          )
                            .toLowerCase()
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
                          bill.paymentMethod ||
                          "-"
                        }
                      </td>


                      <td>

                        <div className="billing-action-buttons">

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


                          {bill.paymentStatus !==
                            "Paid" &&
                            bill.paymentStatus !==
                            "Cancelled" && (
                              <button
                                type="button"
                                className="edit-bill-button"
                                onClick={() =>
                                  openPaymentModal(
                                    bill
                                  )
                                }
                              >
                                Edit
                              </button>
                            )}

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {showAddModal && (
        <div
          className="billing-modal-overlay"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeAddModal();
            }
          }}
        >

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
                onClick={
                  closeAddModal
                }
              >
                ×
              </button>

            </div>


            <form
              className="billing-form"
              onSubmit={
                handleSubmit
              }
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
                    Consultation,
                    tests, medicines,
                    room charges,
                    procedures, etc.
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
                  (
                    item,
                    index
                  ) => (
                    <div
                      className="billing-item-card"
                      key={index}
                    >

                      <div className="billing-item-top">

                        <strong>
                          Item{" "}
                          {index + 1}
                        </strong>

                        {formData.items
                          .length >
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
                            required
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
                            required
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
                    value="Pending"
                    disabled
                  >
                    <option value="Pending">
                      Pending
                    </option>
                  </select>

                  <small className="form-help-text">
                    Create the invoice first,
                    then use Edit to record
                    the patient's payment.
                  </small>

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
                    closeAddModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-bill-button"
                  disabled={
                    saving
                  }
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

      {showViewModal &&
        selectedBilling && (
          <div
            className="billing-modal-overlay"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeViewModal();
              }
            }}
          >

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
                    Patient billing
                    details and payment
                    history.
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
                      {
                        selectedBilling
                          .patient
                          ?.fullName ||
                        "-"
                      }
                    </strong>
                  </div>


                  <div>
                    <span>
                      Doctor
                    </span>

                    <strong>
                      {
                        selectedBilling
                          .doctor
                          ?.fullName ||
                        "Not assigned"
                      }
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
                      Total Amount
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBilling.totalAmount
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
                      Amount Paid
                    </span>

                    <strong className="view-paid-amount">
                      {formatCurrency(
                        getAmountPaid(
                          selectedBilling
                        )
                      )}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Balance Due
                    </span>

                    <strong className="view-balance-amount">
                      {formatCurrency(
                        getBalanceAmount(
                          selectedBilling
                        )
                      )}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Last Payment Method
                    </span>

                    <strong>
                      {
                        selectedBilling.paymentMethod ||
                        "-"
                      }
                    </strong>
                  </div>

                </div>


                {/* ITEMS */}

                <div className="invoice-items">

                  <h3>
                    Billing Items
                  </h3>

                  {selectedBilling.items?.map(
                    (
                      item,
                      index
                    ) => (
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


                {/* TOTALS */}

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


                  <div className="invoice-paid-total">
                    <span>
                      Paid
                    </span>

                    <strong>
                      {formatCurrency(
                        getAmountPaid(
                          selectedBilling
                        )
                      )}
                    </strong>
                  </div>


                  <div className="invoice-balance-total">
                    <span>
                      Balance Due
                    </span>

                    <strong>
                      {formatCurrency(
                        getBalanceAmount(
                          selectedBilling
                        )
                      )}
                    </strong>
                  </div>

                </div>


                {/* PAYMENT HISTORY */}

                <div className="payment-history-section">

                  <div className="payment-history-heading">

                    <div>
                      <h3>
                        Payment History
                      </h3>

                      <p>
                        All payments received
                        for this invoice.
                      </p>
                    </div>

                    {selectedBilling.paymentStatus !==
                      "Paid" &&
                      selectedBilling.paymentStatus !==
                      "Cancelled" && (
                        <button
                          type="button"
                          className="record-payment-button"
                          onClick={() => {
                            closeViewModal();

                            setTimeout(
                              () =>
                                openPaymentModal(
                                  selectedBilling
                                ),
                              0
                            );
                          }}
                        >
                          + Record Payment
                        </button>
                      )}

                  </div>


                  {getPaymentHistory(
                    selectedBilling
                  ).length === 0 ? (
                    <div className="no-payment-history">
                      No payment has been
                      recorded yet.
                    </div>
                  ) : (
                    <div className="payment-history-list">

                      {getPaymentHistory(
                        selectedBilling
                      ).map(
                        (
                          payment,
                          index
                        ) => (
                          <div
                            className="payment-history-card"
                            key={
                              payment._id ||
                              index
                            }
                          >

                            <div>

                              <strong>
                                Payment{" "}
                                {getPaymentHistory(
                                  selectedBilling
                                ).length -
                                  index}
                              </strong>

                              <span>
                                {formatDateTime(
                                  payment.paymentDate
                                )}
                              </span>

                            </div>


                            <div>

                              <strong className="payment-history-amount">
                                {formatCurrency(
                                  payment.amount
                                )}
                              </strong>

                              <span>
                                {
                                  payment.paymentMethod
                                }

                                {payment.referenceNumber &&
                                  ` • ${payment.referenceNumber}`}
                              </span>

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>


                {/* NOTES */}

                <div className="billing-view-notes">

                  <h3>
                    Notes
                  </h3>

                  <p>
                    {
                      selectedBilling
                        .notes || "-"
                    }
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

                {selectedBilling.paymentStatus !==
                  "Paid" &&
                  selectedBilling.paymentStatus !==
                  "Cancelled" && (
                    <button
                      type="button"
                      className="save-bill-button"
                      onClick={() => {
                        closeViewModal();

                        setTimeout(
                          () =>
                            openPaymentModal(
                              selectedBilling
                            ),
                          0
                        );
                      }}
                    >
                      Record Payment
                    </button>
                  )}

              </div>

            </div>

          </div>
        )}

      {showPaymentModal &&
        selectedBilling && (
          <div
            className="billing-modal-overlay"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closePaymentModal();
              }
            }}
          >

            <div className="billing-modal payment-modal">

              <div className="billing-modal-header">

                <div>
                  <h2>
                    Record Payment
                  </h2>

                  <p>
                    Add a payment to
                    invoice{" "}
                    <strong>
                      {
                        selectedBilling.invoiceNumber
                      }
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="billing-close-button"
                  onClick={
                    closePaymentModal
                  }
                  disabled={
                    savingPayment
                  }
                >
                  ×
                </button>

              </div>


              <form
                className="billing-form"
                onSubmit={
                  handleRecordPayment
                }
              >

                {/* PAYMENT SUMMARY */}

                <div className="payment-summary-box">

                  <div>
                    <span>
                      Total Bill
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBilling.totalAmount
                      )}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Already Paid
                    </span>

                    <strong className="summary-paid">
                      {formatCurrency(
                        getAmountPaid(
                          selectedBilling
                        )
                      )}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Balance Due
                    </span>

                    <strong className="summary-balance">
                      {formatCurrency(
                        getBalanceAmount(
                          selectedBilling
                        )
                      )}
                    </strong>
                  </div>

                </div>


                <div className="form-group">

                  <label>
                    Payment Amount *
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={getBalanceAmount(
                      selectedBilling
                    )}
                    name="amount"
                    value={
                      paymentForm.amount
                    }
                    onChange={
                      handlePaymentChange
                    }
                    placeholder="Enter amount received"
                    required
                  />

                  <small className="form-help-text">
                    Maximum payable now:{" "}
                    {formatCurrency(
                      getBalanceAmount(
                        selectedBilling
                      )
                    )}
                  </small>

                </div>


                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Payment Date *
                    </label>

                    <input
                      type="date"
                      name="paymentDate"
                      value={
                        paymentForm.paymentDate
                      }
                      onChange={
                        handlePaymentChange
                      }
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Payment Method *
                    </label>

                    <select
                      name="paymentMethod"
                      value={
                        paymentForm.paymentMethod
                      }
                      onChange={
                        handlePaymentChange
                      }
                      required
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
                    Reference Number
                  </label>

                  <input
                    type="text"
                    name="referenceNumber"
                    value={
                      paymentForm.referenceNumber
                    }
                    onChange={
                      handlePaymentChange
                    }
                    placeholder="UPI / Card / transaction reference"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Payment Notes
                  </label>

                  <textarea
                    name="notes"
                    value={
                      paymentForm.notes
                    }
                    onChange={
                      handlePaymentChange
                    }
                    rows="3"
                    placeholder="Optional payment notes..."
                  />

                </div>


                <div className="payment-after-box">

                  <span>
                    Balance after this
                    payment
                  </span>

                  <strong>
                    {formatCurrency(
                      Math.max(
                        getBalanceAmount(
                          selectedBilling
                        ) -
                        Number(
                          paymentForm.amount ||
                          0
                        ),
                        0
                      )
                    )}
                  </strong>

                </div>


                <div className="billing-modal-footer">

                  <button
                    type="button"
                    className="cancel-bill-button"
                    onClick={
                      closePaymentModal
                    }
                    disabled={
                      savingPayment
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-bill-button"
                    disabled={
                      savingPayment
                    }
                  >
                    {savingPayment
                      ? "Recording..."
                      : "Record Payment"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  );
}

export default Billing;