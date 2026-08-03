YGT EXECUTIVE LIMO — STRIPE BOOKING V3

WHAT THIS VERSION DOES
- Fixed-route and hourly instant pricing
- 3-hour minimum for hourly bookings
- One-way and round-trip pricing
- Full Stripe Checkout payment
- Reservation ID and confirmation page
- Flight, airline, curbside/meet-and-greet, child seat, FBO and special-request fields
- Stripe Dashboard stores all reservation details in metadata
- Optional owner/customer email confirmations through Resend
- Larger header logo

UPLOAD
Replace the current repository contents with everything inside this folder, preserving the same root structure.
The repository root must contain index.html, package.json, api/, assets/, styles.css and script.js.

VERCEL ENVIRONMENT VARIABLES
Required for payment:
STRIPE_SECRET_KEY
SITE_URL

Required for webhook confirmation emails:
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
BOOKING_EMAIL
EMAIL_FROM

STRIPE WEBHOOK URL
https://YOUR-DOMAIN.com/api/webhook
Subscribe to: checkout.session.completed

IMPORTANT
Use Stripe test keys first. Never put a Stripe secret key into index.html, script.js, GitHub, or messages.
