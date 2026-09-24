const express = require("express");

const {
  createBilling,
  getBillings,
  getBillingById,
  updateBilling,
  recordPayment,
  deleteBilling,
} = require("../controllers/billingController");

const {
  protectRoute,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protectRoute,
  createBilling
);

router.get(
  "/",
  protectRoute,
  getBillings
);

router.get(
  "/:id",
  protectRoute,
  getBillingById
);

router.put(
  "/:id",
  protectRoute,
  updateBilling
);

router.patch(
  "/:id/payment",
  protectRoute,
  recordPayment
);

router.delete(
  "/:id",
  protectRoute,
  deleteBilling
);

module.exports = router;
