const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

/* =======================
   INDEX (FILTER + BANNER)
   ======================= */
module.exports.index = async (req, res) => {
    const { category } = req.query;
    let allListings;

    if (category) {
        allListings = await Listing.find({ category });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", {
        allListings,
        queryCategory: category || null
    });
};

/* =======================
   NEW LISTING FORM
   ======================= */
module.exports.rendernewForm = (req, res) => {
    res.render("listings/new.ejs");
};

/* =======================
   SHOW LISTING
   ======================= */
module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: "author" })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you are trying to find does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

/* =======================
   CREATE LISTING
   ======================= */
module.exports.createListing = async (req, res) => {
    const geoResponse = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send();

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    /* IMAGE */
    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    /* GEOMETRY (SAFETY CHECK) */
    if (geoResponse.body.features.length > 0) {
        newListing.geometry = geoResponse.body.features[0].geometry;
    } else {
        req.flash("error", "Invalid location. Please enter a valid place.");
        return res.redirect("/listings/new");
    }

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

/* =======================
   EDIT FORM
   ======================= */
module.exports.renderEdit = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you are trying to find does not exist!");
        return res.redirect("/listings");
    }

    const originalImageUrl = listing.image?.url
        ? listing.image.url.replace("/upload", "/upload/w_250")
        : null;

    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl
    });
};

/* =======================
   UPDATE LISTING
   ======================= */
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true, runValidators: true }
    );

    /* UPDATE IMAGE IF NEW ONE PROVIDED */
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

/* =======================
   DELETE LISTING
   ======================= */
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
