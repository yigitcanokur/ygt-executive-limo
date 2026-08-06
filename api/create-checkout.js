
const Stripe = require("stripe");

const fixedPricing = {
  "mia-miami-beach": {
    "Luxury Sedan":105,
    "Chevrolet Suburban":118,
    "Cadillac Escalade ESV":149,
    "Mercedes-Benz S-Class":199,
    "Passenger Sprinter":205,
    "Executive Sprinter":260
  },
  "mia-fll": {
    "Luxury Sedan":145,
    "Chevrolet Suburban":169,
    "Cadillac Escalade ESV":215,
    "Mercedes-Benz S-Class":199,
    "Passenger Sprinter":245,
    "Executive Sprinter":280
  },
  "fll-local": {
    "Luxury Sedan":104,
    "Chevrolet Suburban":117,
    "Cadillac Escalade ESV":149,
    "Mercedes-Benz S-Class":179,
    "Passenger Sprinter":195,
    "Executive Sprinter":225
  }
};

const hourly3 = {
  "Luxury Sedan":299,
  "Chevrolet Suburban":339,
  "Cadillac Escalade ESV":379,
  "Mercedes-Benz S-Class":499,
  "Passenger Sprinter":525,
  "Executive Sprinter":615
};

const vehicleMultipliers = {
  "Luxury Sedan":0.88,
  "Chevrolet Suburban":1,
  "Cadillac Escalade ESV":1.28,
  "Mercedes-Benz S-Class":1.45,
  "Passenger Sprinter":1.55,
  "Executive Sprinter":1.82
};


function normalize(value) {
  return String(value || "").toLowerCase();
}

function detectFixedRoute(body) {
  const pickup = normalize(body.pickupAddress);
  const dropoff = normalize(body.dropoffAddress);

  const isMia = value =>
    value.includes("miami international airport") ||
    value.includes("(mia)") ||
    value.includes("2100 nw 42nd");

  const isFll = value =>
    value.includes("fort lauderdale-hollywood international airport") ||
    value.includes("(fll)") ||
    value.includes("100 terminal dr");

  const isMiamiBeach = value =>
    value.includes("miami beach") ||
    value.includes("fontainebleau") ||
    value.includes("collins avenue") ||
    value.includes("collins ave");

  const isFortLauderdale = value =>
    value.includes("fort lauderdale") ||
    value.includes("las olas") ||
    value.includes("hollywood, fl");

  if ((isMia(pickup) && isMiamiBeach(dropoff)) || (isMia(dropoff) && isMiamiBeach(pickup))) return "mia-miami-beach";
  if ((isMia(pickup) && isFll(dropoff)) || (isMia(dropoff) && isFll(pickup))) return "mia-fll";
  if ((isFll(pickup) && isFortLauderdale(dropoff)) || (isFll(dropoff) && isFortLauderdale(pickup))) return "fll-local";
  return "";
}

async function customRoutePrice(body) {
  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!key) throw new Error("Google route pricing is not configured");
  if (!body.pickupPlaceId || !body.dropoffPlaceId) throw new Error("Please select both locations from Google");

  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "X-Goog-Api-Key":key,
      "X-Goog-FieldMask":"routes.distanceMeters"
    },
    body:JSON.stringify({
      origin:{placeId:body.pickupPlaceId},
      destination:{placeId:body.dropoffPlaceId},
      travelMode:"DRIVE",
      routingPreference:"TRAFFIC_AWARE"
    })
  });

  const data = await response.json();
  if (!response.ok || !data.routes?.[0]) throw new Error("Route could not be priced");

  const miles = data.routes[0].distanceMeters / 1609.344;
  const minimum = Number(process.env.CUSTOM_ROUTE_SUBURBAN_MINIMUM || 95);
  const perMile = Number(process.env.CUSTOM_ROUTE_SUBURBAN_PER_MILE || 4.25);
  const suburbanBase = Math.max(minimum, minimum + miles * perMile);
  return Math.round(suburbanBase * vehicleMultipliers[body.vehicle]);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({error:"Stripe is not connected yet"});

  try {
    const body = req.body || {};
    if (body.vehicle === "Rolls-Royce Ghost") {
      throw new Error("Rolls-Royce Ghost requires an availability request");
    }

    let total;
    let description;

    if (body.serviceType === "hourly") {
      const hours = Math.max(3, Number(body.hours || 3));
      if (!hourly3[body.vehicle]) throw new Error("Unsupported hourly vehicle");
      total = Math.round((hourly3[body.vehicle] / 3) * hours);
      description = `${hours} hour ${body.vehicle} service`;
    } else {
      if (!body.pickupPlaceId || !body.dropoffPlaceId) {
        throw new Error("Please select pickup and drop-off from Google");
      }

      const verifiedRouteKey = detectFixedRoute(body) || body.routeKey || "";

      if (verifiedRouteKey && fixedPricing[verifiedRouteKey]?.[body.vehicle]) {
        total = fixedPricing[verifiedRouteKey][body.vehicle];
        body.routeKey = verifiedRouteKey;
      } else {
        total = await customRoutePrice(body);
      }

      if (body.roundTrip) total *= 2;
      description = `${body.pickupAddress} → ${body.dropoffAddress} · ${body.vehicle}${body.roundTrip ? " · Round trip" : ""}`;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const reservationId = `YGT-${Date.now().toString().slice(-8)}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode:"payment",
      customer_email:body.email,
      success_url:`${siteUrl}/success.html?reservation=${reservationId}`,
      cancel_url:`${siteUrl}/cancelled.html`,
      line_items:[{
        quantity:1,
        price_data:{
          currency:"usd",
          unit_amount:Math.round(total * 100),
          product_data:{
            name:"YGT Executive Limo Reservation",
            description
          }
        }
      }],
      metadata:{
        reservationId,
        serviceType:String(body.serviceType || ""),
        routeKey:String(body.routeKey || ""),
        vehicle:String(body.vehicle || ""),
        pickupAddress:String(body.pickupAddress || "").slice(0,300),
        dropoffAddress:String(body.dropoffAddress || "").slice(0,300),
        pickupPlaceId:String(body.pickupPlaceId || ""),
        dropoffPlaceId:String(body.dropoffPlaceId || ""),
        date:String(body.date || ""),
        time:String(body.time || ""),
        returnDate:String(body.returnDate || ""),
        returnTime:String(body.returnTime || ""),
        name:String(body.name || ""),
        phone:String(body.phone || ""),
        flight:String(body.flight || ""),
        airline:String(body.airline || ""),
        pickupStyle:String(body.pickupStyle || ""),
        childSeat:String(body.childSeat || ""),
        passengers:String(body.passengers || ""),
        luggage:String(body.luggage || ""),
        notes:String(body.notes || "").slice(0,450)
      }
    });

    res.status(200).json({url:session.url});
  } catch (error) {
    res.status(500).json({error:error.message || "Checkout failed"});
  }
};
