const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isGuest, isProvider } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

router.get("/", isGuest, wrapAsync(bookingController.indexBookings));
router.delete("/:id", isGuest, wrapAsync(bookingController.deleteBooking));
router.patch("/:id/status", isProvider, wrapAsync(bookingController.updateStatus));

module.exports = router;
