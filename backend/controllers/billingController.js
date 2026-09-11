const Billing = require("../models/Billing");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

function calculateBillTotals(
  items = [],
  discount = 0,
  tax = 0
) {
  const subtotal = items.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  const safeDiscount = Math.max(
    Number(discount || 0),
    0
  );

  const safeTax = Math.max(
    Number(tax || 0),
    0
  );

  const totalAmount = Math.max(
    subtotal -
      safeDiscount +
      safeTax,
    0
  );

  return {
    subtotal,
    discount: safeDiscount,
    tax: safeTax,
    totalAmount,
  };
}

function getPaymentStatus(
  totalAmount,
  amountPaid,
  requestedStatus
) {
  if (
    requestedStatus ===
    "Cancelled"
  ) {
    return "Cancelled";
  }

  if (
    amountPaid <= 0
  ) {
    return "Pending";
  }

  if (
    amountPaid >=
    totalAmount
  ) {
    return "Paid";
  }

  return "Partially Paid";
}

async function normalizeBillingRecord(
  billing
) {
  if (!billing) {
    return billing;
  }

  const totalAmount =
    Number(
      billing.totalAmount || 0
    );

  let amountPaid =
    Number(
      billing.amountPaid || 0
    );
  if (
    billing.paymentStatus ===
      "Paid" &&
    amountPaid <= 0
  ) {
    amountPaid =
      totalAmount;

    billing.amountPaid =
      amountPaid;

    billing.balanceAmount = 0;

    await billing.save();

    return billing;
  }

  if (
    billing.paymentStatus ===
    "Cancelled"
  ) {
    billing.balanceAmount =
      0;

    await billing.save();

    return billing;
  }
  if (
    !Number.isFinite(
      amountPaid
    ) ||
    amountPaid < 0
  ) {
    amountPaid = 0;
    billing.amountPaid = 0;
  }

  amountPaid =
    Math.min(
      amountPaid,
      totalAmount
    );

  const balanceAmount =
    Math.max(
      totalAmount -
        amountPaid,
      0
    );

  billing.amountPaid =
    amountPaid;

  billing.balanceAmount =
    balanceAmount;

  if (
    billing.paymentStatus !==
    "Cancelled"
  ) {
    billing.paymentStatus =
      getPaymentStatus(
        totalAmount,
        amountPaid
      );
  }

  await billing.save();

  return billing;
}
function populateBilling(
  query
) {
  return query
    .populate(
      "patient",
      "fullName email phone role"
    )
    .populate(
      "doctor",
      "fullName doctorId specialization department"
    )
    .populate(
      "appointment",
      "appointmentDate appointmentTime status department"
    );
}
const createBilling = async (
  req,
  res
) => {
  try {
    const {
      patient,
      doctor,
      appointment,
      invoiceNumber,
      invoiceDate,
      dueDate,
      items,
      discount,
      tax,
      paymentStatus,
      paymentMethod,
      notes,
    } = req.body;
    if (
      !patient ||
      !invoiceNumber ||
      !invoiceDate ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "Patient, invoice number, invoice date and at least one billing item are required.",
      });
    }
    const patientExists =
      await User.findById(
        patient
      );

    if (!patientExists) {
      return res.status(404).json({
        message:
          "Selected patient was not found.",
      });
    }
    if (doctor) {
      const doctorExists =
        await Doctor.findById(
          doctor
        );

      if (!doctorExists) {
        return res.status(404).json({
          message:
            "Selected doctor was not found.",
        });
      }
    }
    if (appointment) {
      const appointmentExists =
        await Appointment.findById(
          appointment
        );

      if (!appointmentExists) {
        return res.status(404).json({
          message:
            "Selected appointment was not found.",
        });
      }
    }
    const existingBill =
      await Billing.findOne({
        invoiceNumber:
          invoiceNumber.trim(),
      });

    if (existingBill) {
      return res.status(409).json({
        message:
          "Invoice number already exists.",
      });
    }
    const cleanItems =
      items.map(
        (item) => ({
          description:
            String(
              item.description ||
                ""
            ).trim(),

          category:
            String(
              item.category ||
                "Other"
            ).trim(),

          amount:
            Number(
              item.amount || 0
            ),
        })
      );

    const invalidItem =
      cleanItems.find(
        (item) =>
          !item.description ||
          !Number.isFinite(
            item.amount
          ) ||
          item.amount < 0
      );

    if (invalidItem) {
      return res.status(400).json({
        message:
          "Please provide valid billing items.",
      });
    }

    const totals =
      calculateBillTotals(
        cleanItems,
        discount,
        tax
      );
    const initialAmountPaid =
      0;

    const initialStatus =
      paymentStatus ===
      "Cancelled"
        ? "Cancelled"
        : "Pending";

    const billing =
      await Billing.create({
        patient,

        doctor:
          doctor || null,

        appointment:
          appointment || null,

        invoiceNumber:
          invoiceNumber.trim(),

        invoiceDate,

        dueDate:
          dueDate || null,

        items:
          cleanItems,

        subtotal:
          totals.subtotal,

        discount:
          totals.discount,

        tax:
          totals.tax,

        totalAmount:
          totals.totalAmount,

        amountPaid:
          initialAmountPaid,

        balanceAmount:
          initialStatus ===
          "Cancelled"
            ? 0
            : totals.totalAmount,

        paymentStatus:
          initialStatus,

        paymentMethod:
          paymentMethod ||
          "Cash",

        payments: [],

        notes:
          notes || "",
      });
    const populatedBilling =
      await populateBilling(
        Billing.findById(
          billing._id
        )
      );

    return res.status(201).json({
      message:
        "Bill created successfully.",

      billing:
        populatedBilling,
    });
  } catch (error) {
    console.error(
      "Create billing error:",
      error
    );

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        message:
          "Invoice number already exists.",
      });
    }

    return res.status(500).json({
      message:
        "Unable to create bill.",

      error:
        error.message,
    });
  }
};
const getBillings = async (
  req,
  res
) => {
  try {
    let billings =
      await populateBilling(
        Billing.find().sort({
          invoiceDate: -1,
          createdAt: -1,
        })
      );

    for (
      const billing of billings
    ) {
      await normalizeBillingRecord(
        billing
      );
    }

    billings =
      await populateBilling(
        Billing.find().sort({
          invoiceDate: -1,
          createdAt: -1,
        })
      );

    return res.status(200).json({
      message:
        "Billing records fetched successfully.",

      billings,
    });
  } catch (error) {
    console.error(
      "Get billings error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to fetch billing records.",

      error:
        error.message,
    });
  }
};
const getBillingById =
  async (req, res) => {
    try {
      let billing =
        await populateBilling(
          Billing.findById(
            req.params.id
          )
        );

      if (!billing) {
        return res.status(404).json({
          message:
            "Billing record not found.",
        });
      }

      // Correct old record if necessary
      await normalizeBillingRecord(
        billing
      );

      // Read corrected record
      billing =
        await populateBilling(
          Billing.findById(
            req.params.id
          )
        );

      return res.status(200).json({
        billing,
      });
    } catch (error) {
      console.error(
        "Get billing error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to fetch billing record.",

        error:
          error.message,
      });
    }
  };

const updateBilling =
  async (req, res) => {
    try {
      const billing =
        await Billing.findById(
          req.params.id
        );

      if (!billing) {
        return res.status(404).json({
          message:
            "Billing record not found.",
        });
      }

      const {
        patient,
        doctor,
        appointment,
        invoiceNumber,
        invoiceDate,
        dueDate,
        items,
        discount,
        tax,
        notes,
      } = req.body;
      if (
        patient !== undefined
      ) {
        const patientExists =
          await User.findById(
            patient
          );

        if (!patientExists) {
          return res.status(404).json({
            message:
              "Selected patient was not found.",
          });
        }

        billing.patient =
          patient;
      }
      if (
        doctor !== undefined
      ) {
        if (doctor) {
          const doctorExists =
            await Doctor.findById(
              doctor
            );

          if (!doctorExists) {
            return res.status(404).json({
              message:
                "Selected doctor was not found.",
            });
          }
        }

        billing.doctor =
          doctor || null;
      }
      if (
        appointment !==
        undefined
      ) {
        if (appointment) {
          const appointmentExists =
            await Appointment.findById(
              appointment
            );

          if (!appointmentExists) {
            return res.status(404).json({
              message:
                "Selected appointment was not found.",
            });
          }
        }

        billing.appointment =
          appointment || null;
      }
      if (
        invoiceNumber !==
        undefined
      ) {
        const cleanInvoiceNumber =
          String(
            invoiceNumber
          ).trim();

        const duplicate =
          await Billing.findOne({
            invoiceNumber:
              cleanInvoiceNumber,

            _id: {
              $ne:
                billing._id,
            },
          });

        if (duplicate) {
          return res.status(409).json({
            message:
              "Invoice number already exists.",
          });
        }

        billing.invoiceNumber =
          cleanInvoiceNumber;
      }
      if (
        invoiceDate !==
        undefined
      ) {
        billing.invoiceDate =
          invoiceDate;
      }
      if (
        dueDate !== undefined
      ) {
        billing.dueDate =
          dueDate || null;
      }
      if (
        Array.isArray(items)
      ) {
        const cleanItems =
          items.map(
            (item) => ({
              description:
                String(
                  item.description ||
                    ""
                ).trim(),

              category:
                String(
                  item.category ||
                    "Other"
                ).trim(),

              amount:
                Number(
                  item.amount || 0
                ),
            })
          );

        const invalidItem =
          cleanItems.find(
            (item) =>
              !item.description ||
              !Number.isFinite(
                item.amount
              ) ||
              item.amount < 0
          );

        if (invalidItem) {
          return res.status(400).json({
            message:
              "Please provide valid billing items.",
          });
        }

        billing.items =
          cleanItems;
      }
      if (
        discount !== undefined
      ) {
        billing.discount =
          Math.max(
            Number(
              discount || 0
            ),
            0
          );
      }
      if (
        tax !== undefined
      ) {
        billing.tax =
          Math.max(
            Number(
              tax || 0
            ),
            0
          );
      }
      if (
        notes !== undefined
      ) {
        billing.notes =
          notes || "";
      }
      const totals =
        calculateBillTotals(
          billing.items,
          billing.discount,
          billing.tax
        );

      billing.subtotal =
        totals.subtotal;

      billing.discount =
        totals.discount;

      billing.tax =
        totals.tax;

      billing.totalAmount =
        totals.totalAmount;
      let paid =
        Number(
          billing.amountPaid || 0
        );

      if (
        billing.paymentStatus ===
          "Paid" &&
        paid <= 0
      ) {
        /*
         * Old Paid bill.
         */
        paid =
          totals.totalAmount;
      }

      paid = Math.min(
        Math.max(
          paid,
          0
        ),
        totals.totalAmount
      );

      billing.amountPaid =
        paid;
      if (
        billing.paymentStatus ===
        "Cancelled"
      ) {
        billing.balanceAmount =
          0;
      } else {
        billing.balanceAmount =
          Math.max(
            totals.totalAmount -
              paid,
            0
          );
      }
      if (
        billing.paymentStatus !==
        "Cancelled"
      ) {
        billing.paymentStatus =
          getPaymentStatus(
            totals.totalAmount,
            paid
          );
      }

      await billing.save();

      const populatedBilling =
        await populateBilling(
          Billing.findById(
            billing._id
          )
        );

      return res.status(200).json({
        message:
          "Billing record updated successfully.",

        billing:
          populatedBilling,
      });
    } catch (error) {
      console.error(
        "Update billing error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to update billing record.",

        error:
          error.message,
      });
    }
  };

const recordPayment =
  async (req, res) => {
    try {
      const billing =
        await Billing.findById(
          req.params.id
        );

      if (!billing) {
        return res.status(404).json({
          message:
            "Billing record not found.",
        });
      }

      if (
        billing.paymentStatus ===
        "Cancelled"
      ) {
        return res.status(400).json({
          message:
            "Cancelled bills cannot receive payments.",
        });
      }
      if (
        billing.paymentStatus ===
          "Paid" &&
        Number(
          billing.amountPaid || 0
        ) <= 0
      ) {
        billing.amountPaid =
          Number(
            billing.totalAmount || 0
          );

        billing.balanceAmount =
          0;

        await billing.save();

        return res.status(400).json({
          message:
            "This bill is already fully paid and has no remaining balance.",
        });
      }

      const {
        amount,
        paymentDate,
        paymentMethod,
        referenceNumber,
        notes,
      } = req.body;

      const paymentAmount =
        Number(amount);

      if (
        !Number.isFinite(
          paymentAmount
        ) ||
        paymentAmount <= 0
      ) {
        return res.status(400).json({
          message:
            "Please enter a valid payment amount.",
        });
      }
      const currentPaid =
        Number(
          billing.amountPaid || 0
        );

      const totalAmount =
        Number(
          billing.totalAmount || 0
        );

      const currentBalance =
        Math.max(
          totalAmount -
            currentPaid,
          0
        );

      if (
        paymentAmount >
        currentBalance
      ) {
        return res.status(400).json({
          message:
            `Payment cannot exceed the remaining balance of ₹${currentBalance.toLocaleString(
              "en-IN"
            )}.`,
        });
      }
      const finalPaymentDate =
        paymentDate
          ? new Date(
              paymentDate
            )
          : new Date();

      if (
        Number.isNaN(
          finalPaymentDate.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid payment date.",
        });
      }

      billing.payments.push({
        amount:
          paymentAmount,

        paymentDate:
          finalPaymentDate,

        paymentMethod:
          paymentMethod ||
          "Cash",

        referenceNumber:
          String(
            referenceNumber ||
              ""
          ).trim(),

        notes:
          String(
            notes || ""
          ).trim(),
      });
      billing.amountPaid =
        currentPaid +
        paymentAmount;
      billing.balanceAmount =
        Math.max(
          totalAmount -
            billing.amountPaid,
          0
        );

      billing.paymentStatus =
        getPaymentStatus(
          totalAmount,
          billing.amountPaid
        );

      billing.paymentMethod =
        paymentMethod ||
        billing.paymentMethod ||
        "Cash";

      await billing.save();

      const populatedBilling =
        await populateBilling(
          Billing.findById(
            billing._id
          )
        );

      return res.status(200).json({
        message:
          "Payment recorded successfully.",

        billing:
          populatedBilling,
      });
    } catch (error) {
      console.error(
        "Record payment error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to record payment.",

        error:
          error.message,
      });
    }
  };

const deleteBilling =
  async (req, res) => {
    try {
      const billing =
        await Billing.findByIdAndDelete(
          req.params.id
        );

      if (!billing) {
        return res.status(404).json({
          message:
            "Billing record not found.",
        });
      }

      return res.status(200).json({
        message:
          "Billing record deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete billing error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to delete billing record.",

        error:
          error.message,
      });
    }
  };
module.exports = {
  createBilling,
  getBillings,
  getBillingById,
  updateBilling,
  recordPayment,
  deleteBilling,
};