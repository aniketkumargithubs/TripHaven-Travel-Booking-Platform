const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const paymentsController = require("../controllers/payments.js");
const { isGuest, isLoggedIn } = require("../middleware.js");

// Checkout page - server creates PayPal order and returns order ID
router.get("/checkout", isGuest, wrapAsync(paymentsController.checkoutPage));

// Capture order after PayPal approval
router.post("/capture", isGuest, express.json(), wrapAsync(paymentsController.captureOrder));

// Webhook endpoint placeholder
router.post("/webhook", express.raw({ type: 'application/json' }), wrapAsync(paymentsController.webhook));

module.exports = router;
