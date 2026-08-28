
const Stripe = require("stripe");
const { Resend } = require("resend");

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function esc(v) {
  return String(v ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function money(cents, currency="usd") {
  return new Intl.NumberFormat("en-US",{style:"currency",currency:String(currency).toUpperCase()})
    .format((Number(cents)||0)/100);
}
function row(label, value) {
  if (!value) return "";
  return `<tr><td style="padding:10px 12px;color:#777;border-bottom:1px solid #eee;width:34%">${esc(label)}</td><td style="padding:10px 12px;font-weight:600;border-bottom:1px solid #eee">${esc(value)}</td></tr>`;
}
function table(session) {
  const m = session.metadata || {};
  return `<table style="width:100%;border-collapse:collapse;border:1px solid #eee">
    ${row("Reservation",m.reservationId)}
    ${row("Passenger",m.name)}
    ${row("Phone",m.phone)}
    ${row("Vehicle",m.vehicle)}
    ${row("Pickup",m.pickupAddress)}
    ${row("Drop-off",m.dropoffAddress)}
    ${row("Date & Time",[m.date,m.time].filter(Boolean).join(" "))}
    ${row("Return",[m.returnDate,m.returnTime].filter(Boolean).join(" "))}
    ${row("Flight",[m.airline,m.flight].filter(Boolean).join(" "))}
    ${row("Pickup Preference",m.pickupStyle)}
    ${row("Passengers",m.passengers)}
    ${row("Luggage",m.luggage)}
    ${row("Child Seat",m.childSeat)}
    ${row("Special Requests",m.notes)}
    ${row("Total Paid",money(session.amount_total,session.currency))}
  </table>`;
}
function shell(title, eyebrow, body) {
  return `<!doctype html><html><body style="margin:0;background:#f5f3ee;font-family:Arial,sans-serif;color:#111">
  <div style="max-width:720px;margin:auto;padding:28px 14px">
    <div style="background:#080808;padding:30px;text-align:center;border-top:4px solid #d8ad52">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#d8ad52;margin-bottom:12px">${esc(eyebrow)}</div>
      <h1 style="margin:0;color:#fff;font-family:Georgia,serif;font-weight:400;font-size:38px">${esc(title)}</h1>
    </div>
    <div style="background:#fff;padding:30px;border:1px solid #e9e5dc;border-top:0">${body}</div>
    <div style="text-align:center;padding:20px;color:#888;font-size:12px;line-height:1.6">
      YGT Executive Limo · (201) 897-1912 · ygtexecutivelimo.com
    </div>
  </div></body></html>`;
}

async function sendEmails(session) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const m = session.metadata || {};
  const reservation = m.reservationId || "YGT Reservation";
  const from = process.env.BOOKING_FROM_EMAIL || "YGT Executive Limo <reservations@ygtexecutivelimo.com>";
  const owner = process.env.BOOKING_NOTIFICATION_EMAIL || "yigitcanflorida@gmail.com";
  const customer = session.customer_details?.email || session.customer_email || m.email || "";

  if (customer) {
    await resend.emails.send({
      from, to: customer,
      subject: `Reservation Confirmed — ${reservation}`,
      html: shell("Your ride is confirmed.","Booking Confirmed",
        `<p style="font-size:15px;line-height:1.7">Thank you for choosing YGT Executive Limo. Your payment was successful and your reservation is confirmed.</p>
        ${table(session)}
        <div style="margin-top:24px;padding:18px;background:#faf8f3;border-left:3px solid #d8ad52">
          <strong>What happens next</strong><div style="margin-top:7px;color:#666;font-size:13px;line-height:1.6">We will coordinate your trip and provide final pickup instructions and chauffeur information before service.</div>
        </div>`)
    });
  }

  await resend.emails.send({
    from, to: owner,
    subject: `New Paid Reservation — ${reservation}`,
    html: shell("New paid reservation.","YGT Booking Alert",
      `<p style="font-size:15px;line-height:1.7">A new website reservation has been paid.</p>${table(session)}
      <p style="color:#777;font-size:12px;margin-top:18px">Stripe Session: ${esc(session.id)}</p>`)
  });
}

module.exports = async function handler(req,res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(500).send("Stripe webhook is not configured");

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const raw = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(raw, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid") await sendEmails(session);
    }
    return res.status(200).json({received:true});
  } catch (err) {
    console.error(err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

module.exports.config = { api: { bodyParser: false } };
