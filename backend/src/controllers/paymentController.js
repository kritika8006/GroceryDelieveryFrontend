import Stripe from "stripe";

// POST /api/payments/create-intent  — body: { amount }  (amount in your currency's main unit, e.g. dollars)
// Called right before the customer enters their card. Stripe wants the amount
// in the smallest currency unit (cents for USD), hence the *100.
export const createPaymentIntent = async (req, res, next) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // created per-call: see note in paymentRoutes.js
    const { amount } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "A valid amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: { userId: req.user._id.toString() },
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    next(err);
  }
};