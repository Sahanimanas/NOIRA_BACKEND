// backend/routes/payment.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Booking = require("../models/Booking");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Secret Key from Stripe Dashboard

// Create PaymentIntent
router.post("/create-intent", async (req, res) => {
  try {
    const { bookingId } = req.body;

    // ✅ Fetch booking from DB
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const amount = booking.price.amount * 100; // Convert ₹50 → 5000 paise

    // ✅ Create PaymentIntent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: booking.price.currency || "inr",
      metadata: { bookingId: booking._id.toString() },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment creation failed" });
  }
});

module.exports = router;
