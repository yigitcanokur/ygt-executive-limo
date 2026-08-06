YGT EXECUTIVE LIMO — WIZARD V10.2

Fixed:
- MIA → Fontainebleau / Miami Beach now correctly uses the fixed route prices
- Vehicle prices no longer reset to “Call for availability” after form changes
- Route detection recognizes Fontainebleau, Collins Avenue, MIA and FLL variants
- Server independently verifies the route before creating Stripe Checkout
- Passenger Sprinter hourly minimum remains $525
- Executive Sprinter hourly minimum remains $615

You only need to replace:
- script.js
- api/create-checkout.js
- index.html

Or upload the entire package to the GitHub repository root.
