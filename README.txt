YGT EXECUTIVE LIMO — MAPS V5

Included:
- Google Places address autocomplete
- Pickup and drop-off inputs
- Google Routes distance and estimated drive time
- Existing fixed-route prices
- Configurable pricing for custom routes
- Server-side price recalculation before Stripe Checkout
- Larger logo, calendar picker, time selector and reservation summary
- Sample/fake testimonials removed

Required Vercel environment variables:
STRIPE_SECRET_KEY
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
GOOGLE_MAPS_SERVER_API_KEY

For automatic custom-route pricing also add:
CUSTOM_ROUTE_SUV_MINIMUM
CUSTOM_ROUTE_SUV_PER_MILE

Google Cloud:
Enable Maps JavaScript API, Places API and Routes API.
Restrict the browser key by HTTP referrer to your Vercel/domain URLs.
Restrict the server key to Routes API.

Upload all contents of this extracted folder to the GitHub repository root.
