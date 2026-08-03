const Stripe = require('stripe');
const { Resend } = require('resend');

exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function reservationHtml(session) {
  const m = session.metadata || {};
  const rows = [
    ['Reservation', m.reservation_id], ['Customer', m.customer_name], ['Phone', m.customer_phone],
    ['Email', session.customer_details?.email], ['Service', m.service], ['Trip type', m.trip_type],
    ['Route', m.route], ['Pickup', m.pickup], ['Drop-off', m.dropoff], ['Date', m.date], ['Time', m.time],
    ['Return', [m.return_date, m.return_time].filter(Boolean).join(' ')], ['Hours', m.hours], ['Vehicle', m.vehicle],
    ['Passengers', m.passengers], ['Luggage', m.luggage], ['Flight', [m.airline, m.flight_number].filter(Boolean).join(' ')],
    ['Pickup style', m.pickup_style], ['Child seats', m.child_seats], ['FBO', m.fbo], ['Special requests', m.special_requests],
    ['Paid', `$${(session.amount_total / 100).toFixed(2)}`]
  ].filter(([, value]) => value);
  return `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto"><h1>YGT Executive Limo</h1><h2>Paid reservation confirmed</h2><table style="width:100%;border-collapse:collapse">${rows.map(([k,v])=>`<tr><td style="padding:9px;border-bottom:1px solid #ddd;font-weight:bold">${escapeHtml(k)}</td><td style="padding:9px;border-bottom:1px solid #ddd">${escapeHtml(v)}</td></tr>`).join('')}</table><p style="margin-top:25px">Payment was processed securely by Stripe.</p></div>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(500).send('Webhook not configured');

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const rawBody = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(rawBody, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.payment_status === 'paid' && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const html = reservationHtml(session);
        const from = process.env.EMAIL_FROM || 'YGT Executive Limo <onboarding@resend.dev>';
        const bookingEmail = process.env.BOOKING_EMAIL || 'yigitcanflorida@gmail.com';
        const customerEmail = session.customer_details?.email;
        await resend.emails.send({ from, to: bookingEmail, subject: `Paid reservation ${session.client_reference_id}`, html });
        if (customerEmail) {
          await resend.emails.send({ from, to: customerEmail, subject: `Your YGT reservation is confirmed — ${session.client_reference_id}`, html });
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error(error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
