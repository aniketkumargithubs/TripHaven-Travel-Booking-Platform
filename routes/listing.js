const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");

const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");

const listingController=require("../controllers/listings.js");
const multer  = require('multer');
const {storage}=require("../cloudconfig.js");
const upload = multer({ storage });

//Index Route
router.get("/", wrapAsync(listingController.index));

// New Route
router.get("/new", isLoggedIn, listingController.rendernewForm);

//Show Route
router.get("/:id", wrapAsync(listingController.showListing));

//Create Route
// app.post("/listings", wrapAsync(async (req, res, next) => {
//     if (!req.body.listing) {
//         throw new ExpressError(400, "Invalid form submission");
//     }

//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");

// }));
router.post("/", isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing));


//Edit Route
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(listingController.renderEdit));

//Update Route
router.put("/:id", isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing));

//Delete Route
router.delete("/:id", isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));

module.exports=router;