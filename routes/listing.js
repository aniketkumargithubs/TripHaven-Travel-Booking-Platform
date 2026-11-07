const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");

const Listing=require("../models/listing.js");
const {isLoggedIn,isProvider,isOwner,validateListing}=require("../middleware.js");

const listingController=require("../controllers/listings.js");
const bookingController = require("../controllers/bookings.js");
const multer  = require('multer');
const {storage}=require("../cloudconfig.js");
const upload = multer({ storage });

//Index Route
router.get("/", wrapAsync(listingController.index));

// New Route
router.get("/new", isProvider, listingController.rendernewForm);

//Show Route
router.get("/:id", wrapAsync(listingController.showListing));

// Booking Route
router.post("/:id/book", isLoggedIn, wrapAsync(bookingController.createBooking));

//Create Route
// app.post("/listings", wrapAsync(async (req, res, next) => {
//     if (!req.body.listing) {
//         throw new ExpressError(400, "Invalid form submission");
//     }

//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");

// }));
router.post("/", isProvider,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing));


//Edit Route
router.get("/:id/edit", isProvider,isOwner,wrapAsync(listingController.renderEdit));

//Update Route
router.put("/:id", isProvider,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing));

//Delete Route
router.delete("/:id", isProvider,isOwner,wrapAsync(listingController.deleteListing));

module.exports=router;