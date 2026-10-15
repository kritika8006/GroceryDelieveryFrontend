import { loadStripe } from "@stripe/stripe-js";

// loadStripe() only ever reads the publishable key, which is safe to expose
// in frontend code — unlike the secret key, which only ever lives on the backend.
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);