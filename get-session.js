const Stripe = require('stripe');
const { calculatePrice, VEHICLES } = require('./pricing');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe is not configured yet.' });

  try {
    const data = req.body || {};
    const required = ['service', 'vehicle', 'date', 'time', 'name', 'email', 'phone'];
    for (const key of required) {
      if (!String(data[key] || '').trim()) throw new Error(`Missing ${key}.`);
    }
    if (data.service !== 'hourly' && !data.route) throw new Error('Select a route.');

    const quote = calculatePrice(data);
    const reservationId = `YGT-${Date.now().toString(36).toUpperCase()}`;
    const siteUrl = process.env.SITE_URL || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const metadata = {
      reservation_id: reservationId,
      service: String(data.service).slice(0, 100),
      trip_type: String(data.tripType || 'one_way').slice(0, 100),
      route: String(quote.routeLabel).slice(0, 500),
      vehicle: String(VEHICLES[data.vehicle].label).slice(0, 100),
      pickup: String(data.pickup || '').slice(0, 500),
      dropoff: String(data.dropoff || '').slice(0, 500),
      date: String(data.date).slice(0, 100),
      time: String(data.time).slice(0, 100),
      return_date: String(data.returnDate || '').slice(0, 100),
      return_time: String(data.returnTime || '').slice(0, 100),
      hours: String(data.hours || '').slice(0, 100),
      passengers: String(data.passengers || '').slice(0, 100),
      luggage: String(data.luggage || '').slice(0, 100),
      flight_number: String(data.flightNumber || '').slice(0, 100),
      airline: String(data.airline || '').slice(0, 100),
      pickup_style: String(data.pickupStyle || '').slice(0, 100),
      child_seats: String(data.childSeats || 'None').slice(0, 200),
      fbo: String(data.fbo || '').slice(0, 200),
      customer_name: String(data.name).slice(0, 200),
      customer_phone: String(data.phone).slice(0, 100),
      special_requests: String(data.specialRequests || '').slice(0, 500)
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: data.email,
      client_reference_id: reservationId,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: true },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: quote.amount * 100,
          product_data: {
            name: 'YGT Executive Limo Reservation',
            description: quote.description
          }
        }
      }],
      payment_intent_data: {
        description: `${reservationId} · ${quote.description}`,
        metadata
      },
      metadata,
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cancel.html`
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message || 'Unable to start checkout.' });
  }
};
