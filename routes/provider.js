const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isProvider } = require("../middleware.js");
const providerController = require("../controllers/providers.js");

router.get("/dashboard", isProvider, wrapAsync(providerController.dashboard));
router.delete("/listings/:id", isProvider, wrapAsync(providerController.deleteListing));

module.exports = router;
