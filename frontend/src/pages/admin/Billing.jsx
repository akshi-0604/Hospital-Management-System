import "./Billing.css";

function Billing() {
  const bills = [
    {
      id: 1,
      billNumber: "HMS-1001",
      patient: "Akash Reddy",
      services: "Consultation + Blood Test",
      amount: "₹2,500",
      date: "13 Aug 2026",
      status: "Paid",
    },
    {
      id: 2,
      billNumber: "HMS-1002",
      patient: "Bhavani",
      services: "Consultation + MRI",
      amount: "₹5,800",
      date: "13 Aug 2026",
      status: "Pending",
    },
    {
      id: 3,
      billNumber: "HMS-1003",
      patient: "Akshitha",
      services: "Consultation + Medicines",
      amount: "₹1,750",
      date: "12 Aug 2026",
      status: "Paid",
    },
  ];

  return (
    <div className="billing-page">

      <div className="billing-header">
        <div>
          <h2>Billing</h2>

          <p>
            Manage hospital bills and patient payments.
          </p>
        </div>

        <button className="create-bill-button">
          + Create Bill
        </button>
      </div>

      <div className="billing-summary">

        <div className="billing-summary-card">
          <span>Total Revenue</span>
          <strong>₹85,400</strong>
          <p>Today's collection</p>
        </div>

        <div className="billing-summary-card">
          <span>Paid Bills</span>
          <strong>32</strong>
          <p>Successfully paid</p>
        </div>

        <div className="billing-summary-card">
          <span>Pending Bills</span>
          <strong>8</strong>
          <p>Payment pending</p>
        </div>

      </div>

      <div className="billing-table-card">

        <div className="billing-table">

          <div className="billing-table-header">
            <span>Bill Number</span>
            <span>Patient</span>
            <span>Services</span>
            <span>Amount</span>
            <span>Date</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {bills.map((bill) => (
            <div
              className="billing-table-row"
              key={bill.id}
            >
              <strong>{bill.billNumber}</strong>

              <span>{bill.patient}</span>

              <span>{bill.services}</span>

              <strong>{bill.amount}</strong>

              <span>{bill.date}</span>

              <span
                className={`bill-status ${bill.status.toLowerCase()}`}
              >
                {bill.status}
              </span>

              <button>View</button>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default Billing;