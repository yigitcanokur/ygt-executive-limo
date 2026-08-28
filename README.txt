YGT Executive Limo — V18 Email Confirmation

Adds:
- Customer Booking Confirmed email
- Owner New Paid Reservation email
- Premium black/gold email template
- Raw-body Stripe webhook verification
- Sends only after checkout.session.completed with payment_status=paid

Vercel Production variables required:
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
BOOKING_FROM_EMAIL

Optional:
BOOKING_NOTIFICATION_EMAIL
(default: yigitcanflorida@gmail.com)

After upload:
1. Redeploy
2. Make one Stripe Sandbox payment
3. Check customer inbox
4. Check owner inbox
5. Check Stripe webhook delivery = HTTP 200
6. Check Resend Logs
