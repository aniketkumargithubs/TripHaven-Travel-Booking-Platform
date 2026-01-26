const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    image: {
        url: String,
        filename: String
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    location: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function (v) {
                    return (
                        v.length === 2 &&
                        v[0] >= -180 && v[0] <= 180 &&
                        v[1] >= -90 && v[1] <= 90
                    );
                },
                message: "Coordinates must be [longitude, latitude]"
            }
        }
    },

    /* ======================
       CATEGORY (IMPORTANT)
       ====================== */
    category: {
        type: String,
        required: true,
        enum: [
            "trending",
            "rooms",
            "cities",
            "mountains",
            "castles",
            "pools",
            "camping",
            "farms",
            "arctic",
            "domes",
            "boats"
        ],
        index: true
    }
});

/* ======================
   CASCADE DELETE REVIEWS
   ====================== */
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
