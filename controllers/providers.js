const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

module.exports.dashboard = async (req, res) => {
    const listings = await Listing.find({ owner: req.user._id });
    const listingIds = listings.map((listing) => listing._id);
    const bookings = await Booking.find({ listing: { $in: listingIds } })
        .populate("listing")
        .populate("user")
        .sort({ createdAt: -1 });
    res.render("provider/dashboard.ejs", { listings, bookings, searchQuery: null });
};

module.exports.deleteListing = async (req, res) => {
    await Listing.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    req.flash("success", "Property removed successfully.");
    res.redirect("/provider/dashboard");
};
