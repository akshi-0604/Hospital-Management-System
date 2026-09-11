const express = require("express");

const {
  createBilling,
  getBillings,
  getBillingById,
  updateBilling,
  recordPayment,
  deleteBilling,
} = require("../controllers/billingController");

const router =
  express.Router();

router.post(
  "/",
  createBilling
);

router.get(
  "/",
  getBillings
);

router.get(
  "/:id",
  getBillingById
);

router.put(
  "/:id",
  updateBilling
);

router.patch(
  "/:id/payment",
  recordPayment
);

router.delete(
  "/:id",
  deleteBilling
);

module.exports = router;