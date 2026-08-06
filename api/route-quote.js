
const vehicleMultipliers = {
  "Luxury Sedan": 0.88,
  "Chevrolet Suburban": 1,
  "Cadillac Escalade ESV": 1.28,
  "Mercedes-Benz S-Class": 1.45,
  "Passenger Sprinter": 1.55,
  "Executive Sprinter": 1.82
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!key) return res.status(503).json({error:"Routes API is not configured"});

  const body = req.body || {};
  if (!body.pickupPlaceId || !body.dropoffPlaceId) {
    return res.status(400).json({error:"Google pickup and drop-off selections are required"});
  }

  try {
    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "X-Goog-Api-Key":key,
        "X-Goog-FieldMask":"routes.distanceMeters,routes.duration"
      },
      body:JSON.stringify({
        origin:{placeId:body.pickupPlaceId},
        destination:{placeId:body.dropoffPlaceId},
        travelMode:"DRIVE",
        routingPreference:"TRAFFIC_AWARE"
      })
    });

    const data = await response.json();
    if (!response.ok || !data.routes?.[0]) {
      throw new Error(data.error?.message || "Route unavailable");
    }

    const miles = data.routes[0].distanceMeters / 1609.344;
    const seconds = Number(String(data.routes[0].duration).replace("s",""));
    const minutes = Math.max(1, Math.round(seconds / 60));

    const minimum = Number(process.env.CUSTOM_ROUTE_SUBURBAN_MINIMUM || 95);
    const perMile = Number(process.env.CUSTOM_ROUTE_SUBURBAN_PER_MILE || 4.25);
    const suburbanBase = Math.max(minimum, minimum + miles * perMile);

    const basePrices = {};
    for (const [vehicle, multiplier] of Object.entries(vehicleMultipliers)) {
      basePrices[vehicle] = Math.round(suburbanBase * multiplier);
    }

    res.status(200).json({
      distanceMiles:Number(miles.toFixed(1)),
      durationMinutes:minutes,
      distanceText:`${miles.toFixed(1)} mi`,
      durationText:minutes >= 60 ? `${Math.floor(minutes/60)} hr ${minutes%60} min` : `${minutes} min`,
      basePrices
    });
  } catch (error) {
    res.status(500).json({error:error.message || "Route calculation failed"});
  }
};
