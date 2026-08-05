
const Stripe = require("stripe");

const routes = {
  "mia-miami-beach": ["MIA → Miami Beach", 110],
  "mia-brickell": ["MIA → Downtown / Brickell", 100],
  "mia-fll": ["MIA → FLL", 130],
  "mia-boca": ["MIA → Boca Raton", 180],
  "mia-west-palm": ["MIA → West Palm Beach", 240],
  "port-mia": ["PortMiami → MIA", 100]
};

const adjustments = {
  "Luxury Sedan": -15,
  "Luxury SUV": 0,
  "Passenger Van": 40,
  "Executive Van": 80
};

const hourly = {
  "Luxury Sedan": 85,
  "Luxury SUV": 100,
  "Passenger Van": 140,
  "Executive Van": 180
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({error:"Stripe is not connected yet"});

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const b = req.body || {};
    let total = 0;
    let description = "";

    if (b.serviceType === "hourly") {
      const hours = Math.max(3, Number(b.hours || 3));
      total = hourly[b.vehicle] * hours;
      description = `${hours} hour ${b.vehicle} service`;
    } else {
      if (!routes[b.route]) throw new Error("Unsupported route");
      total = routes[b.route][1] + adjustments[b.vehicle];
      if (b.roundTrip) total *= 2;
      description = `${routes[b.route][0]} · ${b.vehicle}${b.roundTrip ? " · Round trip" : ""}`;
    }

    const reservationId = `YGT-${Date.now().toString().slice(-8)}`;
    const site = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: b.email,
      success_url: `${site}/success.html?reservation=${reservationId}`,
      cancel_url: `${site}/cancelled.html`,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(total * 100),
          product_data: { name: "YGT Executive Limo Reservation", description }
        }
      }],
      metadata: {
        reservationId,
        name: String(b.name || ""),
        phone: String(b.phone || ""),
        serviceType: String(b.serviceType || ""),
        route: String(b.route || ""),
        vehicle: String(b.vehicle || ""),
        date: String(b.date || ""),
        time: String(b.time || ""),
        returnDate: String(b.returnDate || ""),
        returnTime: String(b.returnTime || ""),
        time: String(b.time || ""),
        flight: String(b.flight || ""),
        airline: String(b.airline || ""),
        pickupStyle: String(b.pickupStyle || ""),
        childSeat: String(b.childSeat || ""),
        passengers: String(b.passengers || ""),
        luggage: String(b.luggage || ""),
        notes: String(b.notes || "").slice(0, 450)
      }
    });

    res.status(200).json({url: session.url});
  } catch (e) {
    res.status(500).json({error:e.message || "Checkout failed"});
  }
};
