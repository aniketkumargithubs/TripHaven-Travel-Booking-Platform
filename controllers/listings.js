const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

/* =======================
   INDEX (FILTER + SEARCH + BANNER)
   ======================= */
module.exports.index = async (req, res) => {
    const { category, search, location, minPrice, maxPrice, amenity } = req.query;
    let allListings;
    const filters = {};

    if (category) filters.category = category;
    if (location) filters.location = new RegExp(location, "i");
    if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = Number(minPrice);
        if (maxPrice) filters.price.$lte = Number(maxPrice);
    }
    if (amenity) filters.amenities = new RegExp(amenity, "i");

    if (search) {
        // Search by title, location, or country (case-insensitive)
        const searchRegex = new RegExp(search, 'i');
        filters.$or = [
            { title: searchRegex },
            { location: searchRegex },
            { country: searchRegex },
            { description: searchRegex }
        ];
    }
    allListings = await Listing.find(filters);

    res.render("listings/index.ejs", {
        allListings,
        queryCategory: category || null,
        searchQuery: search || null
    });
};

/* =======================
   NEW LISTING FORM
   ======================= */
module.exports.rendernewForm = (req, res) => {
    res.render("listings/new.ejs", { searchQuery: null });
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

    res.render("listings/show.ejs", { listing, searchQuery: null });
};

/* =======================
   CREATE LISTING
   ======================= */
module.exports.createListing = async (req, res) => {
    // Check for duplicate listings if any of title, location, or description match
    const existingListing = await Listing.findOne({
        $or: [
            { title: req.body.listing.title },
            { location: req.body.listing.location },
            { description: req.body.listing.description }
        ]
    });

    if (existingListing) {
        req.flash("error", "Duplicate entry detected! A listing with the same title, location, or description already exists.");
        return res.redirect("/listings/new");
    }

    const geoResponse = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send();

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if (typeof req.body.listing.amenities === "string") {
        newListing.amenities = req.body.listing.amenities.split(",").map((item) => item.trim()).filter(Boolean);
    }
    if (typeof req.body.listing.roomTypes === "string") {
        newListing.roomTypes = req.body.listing.roomTypes.split("\n").map((line) => {
            const [name, price, availability] = line.split(":").map((item) => item.trim());
            return { name, price: Number(price) || newListing.price, availability: Number(availability) || 1 };
        }).filter((room) => room.name);
    }

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
        originalImageUrl,
        searchQuery: null
    });
};

/* =======================
   UPDATE LISTING
   ======================= */
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body.listing };
    if (typeof updates.amenities === "string") {
        updates.amenities = updates.amenities.split(",").map((item) => item.trim()).filter(Boolean);
    }
    if (typeof updates.roomTypes === "string") {
        updates.roomTypes = updates.roomTypes.split("\n").map((line) => {
            const [name, price, availability] = line.split(":").map((item) => item.trim());
            return { name, price: Number(price) || 0, availability: Number(availability) || 1 };
        }).filter((room) => room.name);
    }

    const listing = await Listing.findByIdAndUpdate(
        id,
        updates,
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
