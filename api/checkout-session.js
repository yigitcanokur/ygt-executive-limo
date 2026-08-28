
const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: "Stripe is not configured" });

  const sessionId = req.query?.session_id;
  if (!sessionId || !String(sessionId).startsWith("cs_")) {
    return res.status(400).json({ error: "Invalid session" });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(403).json({ error: "Payment is not complete" });
    }

    const m = session.metadata || {};
    return res.status(200).json({
      reservationId: m.reservationId || "",
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total || 0,
      currency: session.currency || "usd",
      customerEmail: session.customer_details?.email || session.customer_email || "",
      customerName: m.name || "",
      phone: m.phone || "",
      serviceType: m.serviceType || "",
      vehicle: m.vehicle || "",
      pickupAddress: m.pickupAddress || "",
      dropoffAddress: m.dropoffAddress || "",
      date: m.date || "",
      time: m.time || "",
      returnDate: m.returnDate || "",
      returnTime: m.returnTime || "",
      airline: m.airline || "",
      flight: m.flight || "",
      pickupStyle: m.pickupStyle || "",
      passengers: m.passengers || "",
      luggage: m.luggage || "",
      childSeat: m.childSeat || "",
      notes: m.notes || ""
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to load confirmation" });
  }
};
