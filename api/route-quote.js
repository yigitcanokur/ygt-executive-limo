const fixedPricing = {
  "mia-miami-beach": {"Luxury Sedan":105,"Chevrolet Suburban":120,"Cadillac Escalade ESV":145,"Mercedes-Benz S-Class":180,"Passenger Sprinter":250,"Executive Sprinter":295},
  "mia-portmiami": {"Luxury Sedan":105,"Chevrolet Suburban":120,"Cadillac Escalade ESV":145,"Mercedes-Benz S-Class":180,"Passenger Sprinter":250,"Executive Sprinter":295},
  "mia-fll": {"Luxury Sedan":139,"Chevrolet Suburban":168,"Cadillac Escalade ESV":205,"Mercedes-Benz S-Class":240,"Passenger Sprinter":340,"Executive Sprinter":395},
  "fll-miami-beach": {"Luxury Sedan":150,"Chevrolet Suburban":170,"Cadillac Escalade ESV":215,"Mercedes-Benz S-Class":250,"Passenger Sprinter":355,"Executive Sprinter":410},
  "fll-portmiami": {"Luxury Sedan":150,"Chevrolet Suburban":170,"Cadillac Escalade ESV":215,"Mercedes-Benz S-Class":250,"Passenger Sprinter":355,"Executive Sprinter":410},
  "mia-boca": {"Luxury Sedan":170,"Chevrolet Suburban":210,"Cadillac Escalade ESV":245,"Mercedes-Benz S-Class":295,"Passenger Sprinter":430,"Executive Sprinter":485},
  "fll-boca": {"Luxury Sedan":135,"Chevrolet Suburban":165,"Cadillac Escalade ESV":195,"Mercedes-Benz S-Class":235,"Passenger Sprinter":350,"Executive Sprinter":395},
  "mia-west-palm": {"Luxury Sedan":205,"Chevrolet Suburban":230,"Cadillac Escalade ESV":300,"Mercedes-Benz S-Class":350,"Passenger Sprinter":450,"Executive Sprinter":595},
  "fll-west-palm": {"Luxury Sedan":175,"Chevrolet Suburban":220,"Cadillac Escalade ESV":255,"Mercedes-Benz S-Class":300,"Passenger Sprinter":470,"Executive Sprinter":540},
  "mia-orlando": {"Luxury Sedan":525,"Chevrolet Suburban":650,"Cadillac Escalade ESV":750,"Mercedes-Benz S-Class":850,"Passenger Sprinter":1150,"Executive Sprinter":1300}
};

function normalize(value){ return String(value || "").toLowerCase(); }
function detectZone(value){
  const v=normalize(value);
  if(v.includes("miami international airport")||v.includes("(mia)")||v.includes("2100 nw 42nd"))return "mia";
  if(v.includes("fort lauderdale-hollywood international airport")||v.includes("(fll)")||v.includes("100 terminal dr")||v.includes("fort lauderdale beach")||v.includes("w fort lauderdale")||v.includes("w hotel fort lauderdale")||v.includes("las olas")||v.includes("seabreeze boulevard")||v.includes("seabreeze blvd")||v.includes("north fort lauderdale beach boulevard")||v.includes("n fort lauderdale beach blvd")||v.includes("fort lauderdale, fl"))return "fll";
  if(v.includes("portmiami")||v.includes("port of miami")||v.includes("dodge island")||v.includes("cruise terminal"))return "portmiami";
  if(v.includes("miami beach")||v.includes("fontainebleau")||v.includes("faena")||v.includes("w south beach")||v.includes("1 hotel south beach")||v.includes("loews miami beach")||v.includes("eden roc")||v.includes("collins avenue")||v.includes("collins ave"))return "miami-beach";
  if(v.includes("boca raton")||v.includes("mizner park"))return "boca";
  if(v.includes("west palm beach")||v.includes("palm beach international airport")||v.includes("(pbi)")||v.includes("palm beach, fl"))return "west-palm";
  if(v.includes("orlando")||v.includes("orlando international airport")||v.includes("(mco)")||v.includes("disney world")||v.includes("universal orlando"))return "orlando";
  return "";
}
function detectFixedRoute(body){
  const pair=[detectZone(body.pickupAddress),detectZone(body.dropoffAddress)].sort().join("|");
  const routeMap={
    "mia|miami-beach":"mia-miami-beach","mia|portmiami":"mia-portmiami","fll|mia":"mia-fll",
    "fll|miami-beach":"fll-miami-beach","fll|portmiami":"fll-portmiami","boca|mia":"mia-boca",
    "boca|fll":"fll-boca","mia|west-palm":"mia-west-palm","fll|west-palm":"fll-west-palm",
    "mia|orlando":"mia-orlando"
  };
  return routeMap[pair]||"";
}


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
  const fixedRouteKey = detectFixedRoute(body);
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
      fixedRouteKey,
      basePrices: fixedRouteKey && fixedPricing[fixedRouteKey] ? fixedPricing[fixedRouteKey] : basePrices
    });
  } catch (error) {
    res.status(500).json({error:error.message || "Route calculation failed"});
  }
};
