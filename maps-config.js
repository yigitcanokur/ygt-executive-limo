
module.exports = function handler(req, res) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return res.status(503).json({ error: "Google Maps is not configured" });
  res.status(200).json({ key });
};
