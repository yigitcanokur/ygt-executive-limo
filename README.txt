YGT EXECUTIVE LIMO — WIZARD V13 OPERATIONS

New:
- Paid Stripe reservations stored in Supabase
- Admin dashboard at /admin.html
- Dashboard search and status filters
- Booking status: New / Confirmed / Completed / Cancelled
- Revenue summary
- CSV export
- Stripe webhook remains the source of truth
- Customer and owner confirmation emails retained
- Existing zone pricing, Google Places, calendar and vehicle wizard retained

Required:
1. Create a Supabase project
2. Run SUPABASE-SETUP.sql in Supabase SQL Editor
3. Add these Vercel variables:
   SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY
   ADMIN_DASHBOARD_TOKEN

Admin URL:
https://ygt-executive-limo.vercel.app/admin.html

Important:
Never place SUPABASE_SERVICE_ROLE_KEY in GitHub or browser code.
Upload all files/folders to the GitHub repository root.
