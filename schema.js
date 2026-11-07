const Joi = require("joi");

module.exports.listingSchema=Joi.object({
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        image:Joi.string().allow("", null),
        price:Joi.number().required().min(0),
        country:Joi.string().required(),
        location:Joi.string().required(),
        category: Joi.string().required(),
        address: Joi.string().allow(""),
        amenities: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).allow(""),
        roomTypes: Joi.string().allow(""),
        checkIn: Joi.string().allow(""),
        checkOut: Joi.string().allow(""),
        houseRules: Joi.string().allow(""),
        contact: Joi.string().allow(""),
        available: Joi.boolean().default(true)

    }).required(),
});

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required()
    }).required(),
});
