const Listing=require("../models/listing.js");
const Review=require("../models/review.js");

module.exports.reviewRoute=async(req,res)=>{
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    await newReview.save();

    // Push the new review's id onto the listing reviews array without
    // re-saving the full listing document (avoids triggering listing validation)
    await Listing.findByIdAndUpdate(id, { $push: { reviews: newReview._id } });

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteReview=async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");

    res.redirect(`/listings/${id}`);
};