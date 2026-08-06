YGT EXECUTIVE LIMO — WIZARD V8

Changes:
- Quick Route / Custom Address selector removed
- Pickup and drop-off must be selected from Google suggestions
- Typing after selecting a location clears the verified Google place
- Distance and estimated drive time displayed
- Known routes use fixed competitor-based prices
- Other Google-selected routes use distance-based pricing
- Price is recalculated securely on the server before Stripe Checkout
- Selecting a vehicle advances directly to Step 3
- Rolls-Royce Ghost remains availability-only

Required Vercel Environment Variables:
STRIPE_SECRET_KEY
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
GOOGLE_MAPS_SERVER_API_KEY

Optional custom-route controls:
CUSTOM_ROUTE_SUBURBAN_MINIMUM=95
CUSTOM_ROUTE_SUBURBAN_PER_MILE=4.25

Google Cloud APIs to enable:
Maps JavaScript API
Places API
Routes API

Upload all files and folders to the GitHub repository root.
