
const Stripe = require("stripe");

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

function detectZone(value) {
  const v = normalize(value);

  if (v.includes("miami international airport") || v.includes("(mia)") || v.includes("2100 nw 42nd")) return "mia";
  if (v.includes("fort lauderdale-hollywood international airport") || v.includes("(fll)") || v.includes("100 terminal dr") || v.includes("fort lauderdale beach") || v.includes("w fort lauderdale") || v.includes("w hotel fort lauderdale") || v.includes("las olas") || v.includes("seabreeze boulevard") || v.includes("seabreeze blvd") || v.includes("north fort lauderdale beach boulevard") || v.includes("n fort lauderdale beach blvd") || v.includes("fort lauderdale, fl")) return "fll";
  if (v.includes("portmiami") || v.includes("port of miami") || v.includes("dodge island") || v.includes("cruise terminal")) return "portmiami";
  if (v.includes("miami beach") || v.includes("fontainebleau") || v.includes("faena") || v.includes("w south beach") || v.includes("1 hotel south beach") || v.includes("loews miami beach") || v.includes("eden roc") || v.includes("collins avenue") || v.includes("collins ave")) return "miami-beach";
  if (v.includes("boca raton") || v.includes("mizner park")) return "boca";
  if (v.includes("west palm beach") || v.includes("palm beach international airport") || v.includes("(pbi)") || v.includes("palm beach, fl")) return "west-palm";
  if (v.includes("orlando") || v.includes("orlando international airport") || v.includes("(mco)") || v.includes("disney world") || v.includes("universal orlando")) return "orlando";
  if (v.includes("miami, fl") || v.includes("el portal") || v.includes("north miami") || v.includes("miami shores") || v.includes("little river") || v.includes("upper eastside") || v.includes("downtown miami") || v.includes("brickell") || v.includes("coral gables") || v.includes("coconut grove")) return "miami";
  return "";
}

function detectFixedRoute(body) {
  const pickupZone = detectZone(body.pickupAddress);
  const dropoffZone = detectZone(body.dropoffAddress);
  const pair = [pickupZone, dropoffZone].sort().join("|");

  const routeMap = {
    "mia|miami-beach":"mia-miami-beach",
    "mia|portmiami":"mia-portmiami",
    "fll|mia":"mia-fll",
    "fll|miami-beach":"fll-miami-beach",
    "fll|portmiami":"fll-portmiami",
    "boca|mia":"mia-boca",
    "boca|fll":"fll-boca",
    "mia|west-palm":"mia-west-palm","miami|west-palm":"mia-west-palm",
    "fll|west-palm":"fll-west-palm",
    "mia|orlando":"mia-orlando"
  };

  return routeMap[pair] || "";
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
        amountUsd:String(total),
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
      },
      payment_intent_data:{
        metadata:{
          reservationId,
          vehicle:String(body.vehicle || ""),
          pickupAddress:String(body.pickupAddress || "").slice(0,300),
          dropoffAddress:String(body.dropoffAddress || "").slice(0,300)
        }
      }
    });

    res.status(200).json({url:session.url});
  } catch (error) {
    res.status(500).json({error:error.message || "Checkout failed"});
  }
};
