YGT Executive Limo — V17 Premium Confirmation

New:
- Stripe success URL now includes Checkout Session ID.
- Secure server endpoint retrieves the paid Stripe session.
- Premium confirmation page displays:
  reservation number
  pickup / drop-off
  date and time
  vehicle
  passengers
  luggage
  flight when applicable
  pickup preference
  total paid
- Improved next-step guidance.
- Existing Stripe test/live logic is unchanged.

Replace:
- success.html
- styles.css
- api/create-checkout.js
- add api/checkout-session.js
