
const Stripe = require("stripe");
const { Resend } = require("resend");

function money(cents) {
  return new Intl.NumberFormat("en-US", {
    style:"currency",
    currency:"USD"
  }).format((cents || 0) / 100);
}

function row(label, value) {
  if (!value) return "";
  return `<tr><td style="padding:8px 12px;color:#777;border-bottom:1px solid #eee">${label}</td><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #eee">${value}</td></tr>`;
}

function reservationTable(session) {
  const m = session.metadata || {};
  return `
    <table style="width:100%;border-collapse:collapse;margin:22px 0">
      ${row("Reservation", m.reservationId)}
      ${row("Customer", m.name)}
      ${row("Phone", m.phone)}
      ${row("Service", m.serviceType)}
      ${row("Vehicle", m.vehicle)}
      ${row("Pickup", m.pickupAddress)}
      ${row("Drop-off", m.dropoffAddress)}
      ${row("Pickup date", `${m.date || ""} ${m.time || ""}`.trim())}
      ${row("Return", `${m.returnDate || ""} ${m.returnTime || ""}`.trim())}
      ${row("Flight", `${m.airline || ""} ${m.flight || ""}`.trim())}
      ${row("Pickup preference", m.pickupStyle)}
      ${row("Child seat", m.childSeat)}
      ${row("Passengers", m.passengers)}
      ${row("Luggage", m.luggage)}
      ${row("Special requests", m.notes)}
      ${row("Paid", money(session.amount_total))}
    </table>`;
}

async function sendEmails(session) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY is missing; payment confirmed without email.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const m = session.metadata || {};
  const customerEmail = session.customer_details?.email || session.customer_email;
  const ownerEmail = process.env.BOOKING_NOTIFICATION_EMAIL || "yigitcanflorida@gmail.com";
  const fromEmail = process.env.BOOKING_FROM_EMAIL || "YGT Executive Limo <bookings@resend.dev>";

  if (customerEmail) {
    await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: `Reservation Confirmed — ${m.reservationId || "YGT Executive Limo"}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111">
          <div style="background:#090909;color:#fff;padding:28px;text-align:center">
            <h1 style="margin:0;color:#e1b85b;font-family:Georgia,serif">Your ride is confirmed.</h1>
          </div>
          <div style="padding:30px;border:1px solid #eee">
            <p>Thank you for choosing YGT Executive Limo. Your payment was successful and the reservation is confirmed.</p>
            ${reservationTable(session)}
            <p>Your chauffeur information and final pickup instructions will be provided before service.</p>
            <p style="color:#777;font-size:13px">Questions? Call (201) 897-1912 or reply to your booking contact.</p>
          </div>
        </div>`
    });
  }

  await resend.emails.send({
    from: fromEmail,
    to: ownerEmail,
    subject: `New Paid Booking — ${m.reservationId || "YGT"}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto">
        <h1>New paid reservation</h1>
        ${reservationTable(session)}
        <p>Stripe Checkout Session: ${session.id}</p>
      </div>`
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send("Stripe webhook is not configured");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid") {
        await sendEmails(session);
        console.log("PAID RESERVATION", session.metadata?.reservationId);
      }
    }
    res.status(200).json({received:true});
  } catch (error) {
    console.error(error);
    res.status(500).json({error:"Webhook processing failed"});
  }
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};
