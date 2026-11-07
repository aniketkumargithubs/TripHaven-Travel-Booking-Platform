const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot book your own listing.");
        return res.redirect(`/listings/${id}`);
    }

    const adults = Math.max(1, parseInt(req.body.booking?.adults, 10) || 1);
    const children = Math.max(0, parseInt(req.body.booking?.children, 10) || 0);
    const checkIn = new Date(req.body.booking?.checkIn);
    const checkOut = new Date(req.body.booking?.checkOut);
    if (!Number.isNaN(checkIn.getTime()) && !Number.isNaN(checkOut.getTime()) && checkOut <= checkIn) {
        req.flash("error", "Check-out must be after check-in.");
        return res.redirect(`/listings/${id}`);
    }

    const booking = new Booking({
        listing: id,
        user: req.user._id,
        adults,
        children,
        checkIn: Number.isNaN(checkIn.getTime()) ? undefined : checkIn,
        checkOut: Number.isNaN(checkOut.getTime()) ? undefined : checkOut,
        roomType: req.body.booking?.roomType
    });

    await booking.save();

    req.flash("success", `Reservation saved for ${adults} adult(s) and ${children} child(ren). Complete payment from My Bookings.`);
    res.redirect("/bookings");
};

module.exports.indexBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id }).populate("listing");
    res.render("bookings/index.ejs", { bookings });
};

module.exports.deleteBooking = async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
        req.flash("error", "Reservation not found.");
        return res.redirect("/bookings");
    }

    if (!booking.user.equals(req.user._id)) {
        req.flash("error", "You are not authorized to cancel this reservation.");
        return res.redirect("/bookings");
    }

    if (booking.checkIn && booking.checkIn.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
        req.flash("error", "Bookings cannot be canceled within 24 hours of check-in.");
        return res.redirect("/bookings");
    }

    await Booking.findByIdAndDelete(id);
    req.flash("success", "Reservation canceled successfully.");
    res.redirect("/bookings");
};

module.exports.updateStatus = async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate("listing");
    if (!booking || !booking.listing || !booking.listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not authorized to manage this booking.");
        return res.redirect("/provider/dashboard");
    }
    const allowedStatuses = ["accepted", "rejected"];
    if (!allowedStatuses.includes(req.body.status)) {
        req.flash("error", "Invalid booking status.");
        return res.redirect("/provider/dashboard");
    }
    booking.status = req.body.status;
    if (req.body.status === "rejected") booking.confirmed = false;
    await booking.save();
    req.flash("success", `Booking ${req.body.status}.`);
    res.redirect("/provider/dashboard");
};
