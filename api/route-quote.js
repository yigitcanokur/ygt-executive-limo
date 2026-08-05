
const adjustments = {"Luxury Sedan":-15,"Luxury SUV":0,"Passenger Van":40,"Executive Van":80};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!key) return res.status(503).json({error:"Routes API is not configured"});

  const b = req.body || {};
  if (!b.pickupAddress || !b.dropoffAddress) return res.status(400).json({error:"Pickup and drop-off are required"});

  const origin = b.pickupPlaceId ? {placeId:b.pickupPlaceId} : {address:b.pickupAddress};
  const destination = b.dropoffPlaceId ? {placeId:b.dropoffPlaceId} : {address:b.dropoffAddress};

  try {
    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "X-Goog-Api-Key":key,
        "X-Goog-FieldMask":"routes.distanceMeters,routes.duration"
      },
      body:JSON.stringify({
        origin,
        destination,
        travelMode:"DRIVE",
        routingPreference:"TRAFFIC_AWARE"
      })
    });
    const data = await response.json();
    if (!response.ok || !data.routes?.[0]) throw new Error(data.error?.message || "Route unavailable");

    const meters = data.routes[0].distanceMeters;
    const miles = meters / 1609.344;
    const seconds = Number(String(data.routes[0].duration).replace("s",""));
    const minutes = Math.max(1, Math.round(seconds / 60));

    const minimum = Number(process.env.CUSTOM_ROUTE_SUV_MINIMUM || 0);
    const perMile = Number(process.env.CUSTOM_ROUTE_SUV_PER_MILE || 0);
    if (!minimum || !perMile) {
      return res.status(422).json({
        error:"Custom route pricing is not configured",
        distanceText:`${miles.toFixed(1)} mi`,
        durationText:`${minutes} min`
      });
    }

    let total = Math.max(minimum, minimum + miles * perMile) + (adjustments[b.vehicle] || 0);
    if (b.roundTrip) total *= 2;
    total = Math.round(total);

    res.status(200).json({
      total,
      distanceMiles:Number(miles.toFixed(1)),
      durationMinutes:minutes,
      distanceText:`${miles.toFixed(1)} mi`,
      durationText: minutes >= 60 ? `${Math.floor(minutes/60)} hr ${minutes%60} min` : `${minutes} min`
    });
  } catch (e) {
    res.status(500).json({error:e.message || "Route calculation failed"});
  }
};
