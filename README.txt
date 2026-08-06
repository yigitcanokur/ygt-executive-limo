YGT EXECUTIVE LIMO — WIZARD V10

What changed:
- Custom black-and-gold calendar replaces the browser date field
- Clicking the date field or calendar icon opens the same styled calendar on desktop and mobile
- Past dates are disabled
- Return date cannot be earlier than pickup date
- Today and selected date are highlighted
- Google Places and Routes integration retained
- New /setup.html page shows whether Google Maps and Stripe variables are connected
- Larger cropped logo and mobile booking bar retained

Google Maps still requires these Vercel Environment Variables:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
GOOGLE_MAPS_SERVER_API_KEY

Stripe requires:
STRIPE_SECRET_KEY

Site URL:
NEXT_PUBLIC_SITE_URL=https://ygt-executive-limo.vercel.app

After adding environment variables, redeploy the Vercel project.
Upload all files/folders in this package to the GitHub repository root.
