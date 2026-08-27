
module.exports = function handler(req, res) {
  res.status(200).json({
    googleBrowserKey: Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
    googleServerKey: Boolean(process.env.GOOGLE_MAPS_SERVER_API_KEY),
    stripeKey: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    resendKey: Boolean(process.env.RESEND_API_KEY),
    siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    adminToken: Boolean(process.env.ADMIN_DASHBOARD_TOKEN)
  });
};
