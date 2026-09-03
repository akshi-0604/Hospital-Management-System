const Billing = require("../models/Billing");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const populateBilling = (query) => {
  return query
    .populate("patient", "fullName email phone")
    .populate(
      "doctor",
      "fullName doctorId specialization department"
    )
    .populate(
      "appointment",
      "appointmentDate appointmentTime department"
    );
};

function calculateAmounts(
  items = [],
  discount = 0,
  tax = 0
) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const safeDiscount = Number(discount || 0);
  const safeTax = Number(tax || 0);

  const totalAmount =
    subtotal - safeDiscount + safeTax;

  return {
    subtotal,
    discount: safeDiscount,
    tax: safeTax,
    totalAmount: Math.max(totalAmount, 0),
  };
}

const createBilling = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      appointment,
      invoiceNumber,
      invoiceDate,
      dueDate,
      items,
      discount = 0,
      tax = 0,
      paymentStatus = "Pending",
      paymentMethod = "Cash",
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
        success: false,
        message:
          "Patient, invoice number, invoice date and billing items are required",
      });
    }

    const patientExists = await User.findById(patient);

    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (doctor) {
      const doctorExists = await Doctor.findById(
        doctor
      );

      if (!doctorExists) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }
    }

    if (appointment) {
      const appointmentExists =
        await Appointment.findById(appointment);

      if (!appointmentExists) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }
    }

    const existingInvoice =
      await Billing.findOne({
        invoiceNumber: invoiceNumber.trim(),
      });

    if (existingInvoice) {
      return res.status(409).json({
        success: false,
        message:
          "An invoice with this number already exists",
      });
    }

    const amounts = calculateAmounts(
      items,
      discount,
      tax
    );

    const billing = await Billing.create({
      patient,
      doctor: doctor || null,
      appointment: appointment || null,
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate,
      dueDate: dueDate || null,
      items,
      ...amounts,
      paymentStatus,
      paymentMethod,
      notes: notes || "",
    });

    const result = await populateBilling(
      Billing.findById(billing._id)
    );

    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      billing: result,
    });
  } catch (error) {
    console.error("Create Billing Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to create bill",
    });
  }
};

const getBillings = async (req, res) => {
  try {
    const billings =
      await populateBilling(
        Billing.find().sort({
          invoiceDate: -1,
        })
      );

    res.status(200).json({
      success: true,
      message: "Billing records fetched successfully",
      billings,
    });
  } catch (error) {
    console.error("Get Billings Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to fetch billing records",
    });
  }
};

const getBillingById = async (req, res) => {
  try {
    const billing =
      await populateBilling(
        Billing.findById(req.params.id)
      );

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: "Billing record not found",
      });
    }

    res.status(200).json({
      success: true,
      billing,
    });
  } catch (error) {
    console.error(
      "Get Billing By ID Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to fetch billing record",
    });
  }
};

const updateBilling = async (req, res) => {
  try {
    const billing =
      await Billing.findById(req.params.id);

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: "Billing record not found",
      });
    }

    if (
      req.body.invoiceNumber &&
      req.body.invoiceNumber !==
        billing.invoiceNumber
    ) {
      const duplicate =
        await Billing.findOne({
          invoiceNumber:
            req.body.invoiceNumber.trim(),
          _id: { $ne: billing._id },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Another invoice already uses this number",
        });
      }

      billing.invoiceNumber =
        req.body.invoiceNumber.trim();
    }

    const fields = [
      "patient",
      "doctor",
      "appointment",
      "invoiceDate",
      "dueDate",
      "paymentStatus",
      "paymentMethod",
      "notes",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        billing[field] =
          req.body[field] === ""
            ? null
            : req.body[field];
      }
    });

    if (Array.isArray(req.body.items)) {
      billing.items = req.body.items;
    }

    const amounts = calculateAmounts(
      billing.items,
      req.body.discount !== undefined
        ? req.body.discount
        : billing.discount,
      req.body.tax !== undefined
        ? req.body.tax
        : billing.tax
    );

    billing.subtotal = amounts.subtotal;
    billing.discount = amounts.discount;
    billing.tax = amounts.tax;
    billing.totalAmount = amounts.totalAmount;

    await billing.save();

    const result = await populateBilling(
      Billing.findById(billing._id)
    );

    res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      billing: result,
    });
  } catch (error) {
    console.error("Update Billing Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update bill",
    });
  }
};

const deleteBilling = async (req, res) => {
  try {
    const billing =
      await Billing.findByIdAndDelete(
        req.params.id
      );

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: "Billing record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Billing record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Billing Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to delete billing record",
    });
  }
};

module.exports = {
  createBilling,
  getBillings,
  getBillingById,
  updateBilling,
  deleteBilling,
};