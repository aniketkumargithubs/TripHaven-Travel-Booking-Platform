const Booking = require("../models/booking.js");
const Payment = require("../models/payment.js");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

function paypalClient() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;
    const environment = new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment);
}

module.exports.checkoutPage = async (req, res) => {
    const { bookingId } = req.query;
    if (!bookingId) {
        req.flash("error", "Missing booking reference.");
        return res.redirect("/listings");
    }

    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/listings");
    }
    if (!booking.user.equals(req.user._id)) {
        req.flash("error", "You are not authorized to pay for this booking.");
        return res.redirect("/bookings");
    }

    const paypal = paypalClient();
    if (!paypal) {
        req.flash("error", "Payment provider not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.");
        return res.redirect(`/bookings`);
    }

    const amount = Math.max(0, booking.listing.price).toFixed(2);
    const currency = "USD";

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [{
            amount: {
                currency_code: currency,
                value: amount
            },
            description: `Reservation for ${booking.listing.title}`
        }],
        application_context: {
            brand_name: "TripHaven_ Travel Booking Platform",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
            return_url: "http://localhost:8080/bookings",
            cancel_url: "http://localhost:8080/bookings"
        }
    });

    const order = await paypal.execute(request);

    const payment = new Payment({
        booking: booking._id,
        user: req.user._id,
        amount: parseFloat(amount),
        currency,
        providerPaymentId: order.result.id,
        status: "pending",
        metadata: { raw: order.result }
    });
    await payment.save();

    res.render("payments/checkout.ejs", {
        clientId: process.env.PAYPAL_CLIENT_ID,
        orderId: order.result.id,
        booking,
        amount,
        currency
    });
};

module.exports.captureOrder = async (req, res) => {
    const { orderId } = req.body;
    if (!orderId) {
        return res.status(400).json({ error: "Missing orderId" });
    }

    const paypal = paypalClient();
    if (!paypal) {
        return res.status(500).json({ error: "PayPal client not configured." });
    }

    const captureRequest = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    captureRequest.requestBody({});
    const capture = await paypal.execute(captureRequest);

    if (!capture.result || capture.result.status !== "COMPLETED") {
        return res.status(400).json({ error: "Payment capture failed." });
    }

    const payment = await Payment.findOne({ providerPaymentId: orderId });
    if (payment) {
        payment.status = "succeeded";
        payment.metadata = payment.metadata || {};
        payment.metadata.raw = capture.result;
        await payment.save();

        await Booking.findByIdAndUpdate(
            payment.booking,
            { $set: { confirmed: true, status: "accepted" } },
            { new: true }
        );
    }

    res.json({ success: true });
};

module.exports.webhook = async (req, res) => {
    res.status(200).json({ received: true });
};
