import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "./PatientBilling.css";

function PatientBilling() {
  const [billings, setBillings] = useState([]);

  const [search, setSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBilling, setSelectedBilling] =
    useState(null);

  const [showViewModal, setShowViewModal] =
    useState(false);

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
        setBillings([]);
        setError(
          "Unable to identify the logged-in patient."
        );
        setLoading(false);
        return;
      }

      const response = await api.get("/billing");

      let billingData = [];

      if (Array.isArray(response.data)) {
        billingData = response.data;
      } else if (
        Array.isArray(response.data?.billings)
      ) {
        billingData = response.data.billings;
      } else if (
        Array.isArray(response.data?.data)
      ) {
        billingData = response.data.data;
      }

      const patientBillings = billingData.filter(
        (bill) => {
          const billingPatientId =
            bill.patient?._id ||
            bill.patient?.id ||
            bill.patient ||
            bill.patientId;

          return (
            String(billingPatientId) ===
            String(patientId)
          );
        }
      );

      setBillings(patientBillings);
    } catch (error) {
      console.error(
        "Load patient billing error:",
        error
      );

      setBillings([]);

      setError(
        error.response?.data?.message ||
          "Unable to load billing records."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredBillings = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return billings.filter((bill) => {
      const invoiceNumber =
        bill.invoiceNumber || "";

      const doctorName =
        bill.doctor?.fullName || "";

      const matchesSearch =
        !searchText ||
        invoiceNumber
          .toLowerCase()
          .includes(searchText) ||
        doctorName
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

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatCurrency(value) {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
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
      bill.paymentStatus === "Paid" ||
      bill.paymentStatus === "Cancelled"
    ) {
      return 0;
    }

    const totalAmount = Number(
      bill.totalAmount || 0
    );

    const amountPaid = Number(
      bill.amountPaid || 0
    );

    return Math.max(
      totalAmount - amountPaid,
      0
    );
  }

  function getPaymentHistory(billing) {
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

  const totalBills = billings.length;

  const paidBills = billings.filter(
    (bill) =>
      bill.paymentStatus === "Paid"
  ).length;

  const partiallyPaidBills =
    billings.filter(
      (bill) =>
        bill.paymentStatus ===
        "Partially Paid"
    ).length;

  const pendingBills = billings.filter(
    (bill) =>
      bill.paymentStatus === "Pending"
  ).length;

  const totalPaidRevenue =
    billings.reduce(
      (total, bill) =>
        total + getAmountPaid(bill),
      0
    );

  function openViewModal(billing) {
    setSelectedBilling(billing);
    setShowViewModal(true);
  }

  function closeViewModal() {
    setSelectedBilling(null);
    setShowViewModal(false);
  }

  return (
    <div className="patient-billing-page">

      <div className="patient-billing-header">
        <div>
          <h1>My Billing</h1>

          <p>
            View your invoices, payments
            and billing records.
          </p>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="patient-billing-summary">

        <div className="patient-billing-summary-card">
          <span>Total Bills</span>

          <strong>
            {totalBills}
          </strong>

          <small>
            All invoices
          </small>
        </div>

        <div className="patient-billing-summary-card">
          <span>Paid Bills</span>

          <strong>
            {paidBills}
          </strong>

          <small>
            Fully paid
          </small>
        </div>

        <div className="patient-billing-summary-card">
          <span>Partially Paid</span>

          <strong>
            {partiallyPaidBills}
          </strong>

          <small>
            Balance remaining
          </small>
        </div>

        <div className="patient-billing-summary-card">
          <span>Pending Bills</span>

          <strong>
            {pendingBills}
          </strong>

          <small>
            No payment yet
          </small>
        </div>

        <div className="patient-billing-summary-card">
          <span>Paid Amount</span>

          <strong>
            {formatCurrency(
              totalPaidRevenue
            )}
          </strong>

          <small>
            Total amount paid
          </small>
        </div>

      </div>

      {/* TOOLBAR */}

      <div className="patient-billing-toolbar">

        <input
          type="text"
          placeholder="Search invoice or doctor..."
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
        <div className="patient-billing-error">
          {error}
        </div>
      )}

      {/* TABLE */}

      <div className="patient-billing-table-card">

        {loading ? (
          <div className="patient-billing-empty">
            Loading your billing records...
          </div>
        ) : filteredBillings.length === 0 ? (
          <div className="patient-billing-empty">

            <strong>
              No billing records found
            </strong>

            <span>
              Your billing records will
              appear here when available.
            </span>

          </div>
        ) : (
          <div className="patient-billing-table-wrapper">

            <table className="patient-billing-table">

              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Doctor</th>
                  <th>Invoice Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Payment</th>
                  <th>Method</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredBillings.map(
                  (bill) => (
                    <tr key={bill._id}>

                      <td>
                        <strong>
                          {
                            bill.invoiceNumber
                          }
                        </strong>
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

                      <td className="patient-paid-amount-cell">
                        <strong>
                          {formatCurrency(
                            getAmountPaid(
                              bill
                            )
                          )}
                        </strong>
                      </td>

                      <td className="patient-balance-amount-cell">
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
                          className={`patient-payment-status ${String(
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
                            bill.paymentStatus ||
                            "-"
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

                        <button
                          type="button"
                          className="patient-view-bill-button"
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

      {/* VIEW BILL MODAL */}

      {showViewModal &&
        selectedBilling && (
          <div
            className="patient-billing-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeViewModal();
              }
            }}
          >

            <div className="patient-billing-modal">

              <div className="patient-billing-modal-header">

                <div>
                  <h2>
                    Invoice{" "}
                    {
                      selectedBilling.invoiceNumber
                    }
                  </h2>

                  <p>
                    Your billing details
                    and payment history.
                  </p>
                </div>

                <button
                  type="button"
                  className="patient-billing-close-button"
                  onClick={
                    closeViewModal
                  }
                >
                  ×
                </button>

              </div>

              <div className="patient-billing-details">

                {/* BASIC DETAILS */}

                <div className="patient-billing-detail-grid">

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

                    <strong className="patient-view-paid-amount">
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

                    <strong className="patient-view-balance-amount">
                      {formatCurrency(
                        getBalanceAmount(
                          selectedBilling
                        )
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Payment Method
                    </span>

                    <strong>
                      {
                        selectedBilling
                          .paymentMethod ||
                        "-"
                      }
                    </strong>
                  </div>

                </div>

                {/* BILLING ITEMS */}

                <div className="patient-invoice-items">

                  <h3>
                    Billing Items
                  </h3>

                  {Array.isArray(
                    selectedBilling.items
                  ) &&
                    selectedBilling.items.map(
                      (item, index) => (
                        <div
                          className="patient-invoice-item-row"
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

                <div className="patient-invoice-totals">

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

                  <div className="patient-invoice-grand-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBilling.totalAmount
                      )}
                    </strong>

                  </div>

                  <div className="patient-invoice-paid-total">

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

                  <div className="patient-invoice-balance-total">

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

                <div className="patient-payment-history-section">

                  <div className="patient-payment-history-heading">

                    <div>

                      <h3>
                        Payment History
                      </h3>

                      <p>
                        All payments received
                        for this invoice.
                      </p>

                    </div>

                  </div>

                  {getPaymentHistory(
                    selectedBilling
                  ).length === 0 ? (
                    <div className="patient-no-payment-history">
                      No payment has been
                      recorded yet.
                    </div>
                  ) : (
                    <div className="patient-payment-history-list">

                      {getPaymentHistory(
                        selectedBilling
                      ).map(
                        (
                          payment,
                          index
                        ) => (
                          <div
                            className="patient-payment-history-card"
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

                              <strong className="patient-payment-history-amount">
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

                <div className="patient-billing-view-notes">

                  <h3>
                    Notes
                  </h3>

                  <p>
                    {
                      selectedBilling.notes ||
                      "-"
                    }
                  </p>

                </div>

              </div>

              <div className="patient-billing-modal-footer">

                <button
                  type="button"
                  className="patient-cancel-bill-button"
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

export default PatientBilling;

