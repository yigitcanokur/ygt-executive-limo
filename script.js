
const fixedPricing = {
  "mia-miami-beach": {
    "Luxury Sedan": 105,
    "Chevrolet Suburban": 118,
    "Cadillac Escalade ESV": 149,
    "Mercedes-Benz S-Class": 199,
    "Passenger Sprinter": 205,
    "Executive Sprinter": 260
  },
  "mia-fll": {
    "Luxury Sedan": 145,
    "Chevrolet Suburban": 169,
    "Cadillac Escalade ESV": 215,
    "Mercedes-Benz S-Class": 199,
    "Passenger Sprinter": 245,
    "Executive Sprinter": 280
  },
  "fll-local": {
    "Luxury Sedan": 104,
    "Chevrolet Suburban": 117,
    "Cadillac Escalade ESV": 149,
    "Mercedes-Benz S-Class": 179,
    "Passenger Sprinter": 195,
    "Executive Sprinter": 225
  }
};

const hourly3 = {
  "Luxury Sedan": 299,
  "Chevrolet Suburban": 339,
  "Cadillac Escalade ESV": 379,
  "Mercedes-Benz S-Class": 499,
  "Passenger Sprinter": 389,
  "Executive Sprinter": 479
};

const vehicles = [
  {name:"Luxury Sedan", image:"assets/sedan.jpg", passengers:2, bags:3, subtitle:"Premium made accessible"},
  {name:"Chevrolet Suburban", image:"assets/suburban.jpg", passengers:6, bags:6, subtitle:"Full-size luxury SUV", popular:true},
  {name:"Cadillac Escalade ESV", image:"assets/escalade.jpg", passengers:6, bags:6, subtitle:"Flagship luxury SUV"},
  {name:"Mercedes-Benz S-Class", image:"assets/sclass.jpg", passengers:2, bags:3, subtitle:"First-class executive sedan"},
  {name:"Passenger Sprinter", image:"assets/passenger-van.jpg", passengers:10, bags:10, subtitle:"Comfortable group transportation"},
  {name:"Executive Sprinter", image:"assets/executive-van.jpg", passengers:14, bags:14, subtitle:"Premium group travel"},
  {name:"Rolls-Royce Ghost", image:"assets/rolls-royce-ghost.jpg", passengers:2, bags:2, subtitle:"Ultra-luxury chauffeur experience", customQuote:true}
];

let currentStep = 1;
let selectedVehicle = "";
let routeQuote = null;
let routeKey = "";
let quoteTimer = null;

const form = document.getElementById("bookingForm");
const vehicleInput = document.getElementById("vehicleInput");
const pickupAddress = document.getElementById("pickupAddress");
const dropoffAddress = document.getElementById("dropoffAddress");
const pickupPlaceId = document.getElementById("pickupPlaceId");
const dropoffPlaceId = document.getElementById("dropoffPlaceId");
const routeInfo = document.getElementById("routeInfo");

function fillTimes(id) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">Select time</option>';
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const value = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
      const label = `${h % 12 || 12}:${String(m).padStart(2,"0")} ${h < 12 ? "AM" : "PM"}`;
      select.insertAdjacentHTML("beforeend", `<option value="${value}">${label}</option>`);
    }
  }
}
fillTimes("pickupTime");
fillTimes("returnTime");

const today = new Date().toISOString().split("T")[0];
document.getElementById("pickupDate").min = today;
document.getElementById("returnDate").min = today;

function serviceType() {
  return form.querySelector('input[name="serviceType"]:checked').value;
}

function normalize(value) {
  return String(value || "").toLowerCase();
}

function detectFixedRoute() {
  const pickup = normalize(pickupAddress.value);
  const dropoff = normalize(dropoffAddress.value);
  const pickupIsMia = pickup.includes("miami international airport") || pickup.includes("(mia)");
  const dropoffIsMia = dropoff.includes("miami international airport") || dropoff.includes("(mia)");
  const pickupIsFll = pickup.includes("fort lauderdale-hollywood") || pickup.includes("(fll)");
  const dropoffIsFll = dropoff.includes("fort lauderdale-hollywood") || dropoff.includes("(fll)");
  const pickupMiamiBeach = pickup.includes("miami beach");
  const dropoffMiamiBeach = dropoff.includes("miami beach");
  const pickupFortLauderdale = pickup.includes("fort lauderdale");
  const dropoffFortLauderdale = dropoff.includes("fort lauderdale");

  if ((pickupIsMia && dropoffMiamiBeach) || (dropoffIsMia && pickupMiamiBeach)) return "mia-miami-beach";
  if ((pickupIsMia && dropoffIsFll) || (dropoffIsMia && pickupIsFll)) return "mia-fll";
  if ((pickupIsFll && dropoffFortLauderdale) || (dropoffIsFll && pickupFortLauderdale)) return "fll-local";
  return "";
}

async function requestRouteQuote() {
  if (serviceType() !== "transfer" || !pickupPlaceId.value || !dropoffPlaceId.value) {
    routeQuote = null;
    routeKey = "";
    routeInfo.hidden = true;
    updateSummary();
    return;
  }

  routeKey = detectFixedRoute();
  try {
    const response = await fetch("/api/route-quote", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        pickupAddress: pickupAddress.value,
        dropoffAddress: dropoffAddress.value,
        pickupPlaceId: pickupPlaceId.value,
        dropoffPlaceId: dropoffPlaceId.value
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Route could not be calculated");
    routeQuote = result;
    document.getElementById("distanceText").textContent = result.distanceText;
    document.getElementById("durationText").textContent = result.durationText;
    routeInfo.hidden = false;
  } catch (error) {
    routeQuote = null;
    routeInfo.hidden = true;
  }
  renderVehicles();
  updateSummary();
}

function scheduleRouteQuote() {
  clearTimeout(quoteTimer);
  quoteTimer = setTimeout(requestRouteQuote, 250);
}

function tripPrice(vehicle) {
  if (vehicle === "Rolls-Royce Ghost") return null;

  if (serviceType() === "hourly") {
    const hours = Math.max(3, Number(form.hours.value || 3));
    return Math.round((hourly3[vehicle] / 3) * hours);
  }

  if (routeKey && fixedPricing[routeKey]) return fixedPricing[routeKey][vehicle] ?? null;
  if (routeQuote?.basePrices?.[vehicle] != null) return routeQuote.basePrices[vehicle];
  return null;
}

function renderVehicles() {
  const grid = document.getElementById("vehicleGrid");
  grid.innerHTML = "";

  vehicles.forEach(vehicle => {
    const price = tripPrice(vehicle.name);
    const card = document.createElement("article");
    card.className = "vehicleCard";
    card.innerHTML = `
      <div class="vehicleImage"><img src="${vehicle.image}" alt="${vehicle.name}"></div>
      <div class="vehicleBody">
        <div class="vehicleTop">
          <h4>${vehicle.name}</h4>
          ${vehicle.popular ? '<span class="badge">Most Popular</span>' : ''}
        </div>
        <div class="vehicleSubtitle">${vehicle.subtitle}</div>
        <div class="vehiclePrice">
          ${price != null ? `$${price.toFixed(2)}` : "Call for availability"}
          <small>${price != null ? "All-inclusive price" : "Custom quote"}</small>
        </div>
        <div class="green">${price != null ? "✓ Final Price – No Hidden Fees" : "Exclusive vehicle · availability required"}</div>
        <div class="capacity">
          <span>Up to ${vehicle.passengers} passengers</span>
          <span>Up to ${vehicle.bags} bags</span>
        </div>
        <div class="included">
          ✓ Flight tracking<br>
          ✓ Complimentary water<br>
          ✓ Phone charger<br>
          ✓ Airport wait time<br>
          ✓ Child seat on request
        </div>
        <button class="selectVehicle" type="button">${vehicle.customQuote ? "Check Availability" : "Select Vehicle"}</button>
      </div>`;

    card.querySelector("button").addEventListener("click", () => {
      selectedVehicle = vehicle.name;
      vehicleInput.value = vehicle.name;
      updateSummary();
      showStep(3);
    });

    grid.appendChild(card);
  });
}

function showStep(step) {
  if (step === 2 && !validateStep1()) return;
  if (step === 3 && !selectedVehicle) {
    alert("Please select a vehicle.");
    return;
  }

  currentStep = step;
  document.querySelectorAll(".wizardStep").forEach(section => {
    section.classList.toggle("active", Number(section.dataset.step) === step);
  });
  document.querySelectorAll(".stepDot").forEach((dot, index) => {
    dot.classList.toggle("active", index + 1 === step);
    dot.classList.toggle("done", index + 1 < step);
  });
  document.getElementById("progressFill").style.width = `${(step - 1) * 50}%`;

  if (step === 2) renderVehicles();
  updateSummary();
  document.getElementById("booking").scrollIntoView({behavior:"smooth", block:"start"});
}

function validateStep1() {
  if (serviceType() === "transfer") {
    if (!pickupAddress.value || !dropoffAddress.value) {
      alert("Please select pickup and drop-off locations.");
      return false;
    }
    if (!pickupPlaceId.value || !dropoffPlaceId.value) {
      alert("Please choose both locations from the Google suggestions.");
      return false;
    }
  }

  if (!document.getElementById("pickupDate").value || !document.getElementById("pickupTime").value) {
    alert("Please choose a pickup date and time.");
    return false;
  }
  return true;
}

document.querySelectorAll("[data-next]").forEach(button => {
  button.addEventListener("click", () => showStep(Number(button.dataset.next)));
});
document.querySelectorAll("[data-back]").forEach(button => {
  button.addEventListener("click", () => showStep(Number(button.dataset.back)));
});
document.querySelectorAll("[data-step-go]").forEach(button => {
  button.addEventListener("click", () => {
    const step = Number(button.dataset.stepGo);
    if (step <= currentStep) showStep(step);
  });
});

function toggleMode() {
  const transfer = serviceType() === "transfer";
  document.getElementById("pickupWrap").hidden = !transfer;
  document.getElementById("dropoffWrap").hidden = !transfer;
  document.getElementById("roundWrap").hidden = !transfer;
  document.getElementById("hoursWrap").hidden = transfer;
  if (!transfer) routeInfo.hidden = true;
  routeQuote = null;
  routeKey = "";
  renderVehicles();
  updateSummary();
}

function toggleReturn() {
  const checked = document.getElementById("roundTrip").checked;
  document.getElementById("returnFields").hidden = !checked;
  document.getElementById("returnDate").required = checked;
  document.getElementById("returnTime").required = checked;
}

function updateSummary() {
  const data = Object.fromEntries(new FormData(form).entries());
  document.getElementById("sumService").textContent =
    serviceType() === "hourly"
      ? `${Math.max(3, Number(data.hours || 3))} Hour Service`
      : (document.getElementById("roundTrip").checked ? "Round Trip" : "Point-to-Point");

  document.getElementById("sumRoute").textContent =
    serviceType() === "hourly"
      ? "Hourly Chauffeur"
      : (data.pickupAddress && data.dropoffAddress ? `${data.pickupAddress} → ${data.dropoffAddress}` : "—");

  document.getElementById("sumDate").textContent =
    data.date
      ? new Date(data.date + "T12:00:00").toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"})
      : "—";

  document.getElementById("sumVehicle").textContent = selectedVehicle || "—";

  const price = selectedVehicle ? tripPrice(selectedVehicle) : null;
  const payButton = form.querySelector(".payButton");

  if (selectedVehicle === "Rolls-Royce Ghost") {
    document.getElementById("total").textContent = "Custom quote";
    payButton.textContent = "REQUEST AVAILABILITY";
    payButton.classList.add("customQuoteButton");
  } else {
    const finalPrice = price != null && document.getElementById("roundTrip").checked && serviceType() === "transfer"
      ? price * 2
      : price;
    document.getElementById("total").textContent = finalPrice != null ? `$${finalPrice.toFixed(2)}` : "Quote pending";
    payButton.textContent = "PAY & CONFIRM";
    payButton.classList.remove("customQuoteButton");
  }
}

document.addEventListener("ygt-place-selected", scheduleRouteQuote);
document.addEventListener("ygt-maps-unavailable", () => {
  document.querySelectorAll(".googleHint").forEach(hint => {
    hint.textContent = "Location search is being connected. Please try again shortly." ;
    hint.classList.add("mapsWarning");
  });
});

form.addEventListener("change", () => {
  toggleMode();
  toggleReturn();
  updateSummary();
});
form.addEventListener("input", updateSummary);

toggleMode();
toggleReturn();

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!selectedVehicle) return;

  const button = form.querySelector(".payButton");
  const data = Object.fromEntries(new FormData(form).entries());
  data.roundTrip = document.getElementById("roundTrip").checked;
  data.routeKey = routeKey;

  if (selectedVehicle === "Rolls-Royce Ghost") {
    const message = [
      "Hello YGT Executive Limo, I would like to check availability for a Rolls-Royce Ghost.",
      "",
      `Name: ${data.name || ""}`,
      `Phone: ${data.phone || ""}`,
      `Pickup: ${data.pickupAddress || ""}`,
      `Drop-off: ${data.dropoffAddress || ""}`,
      `Date: ${data.date || ""}`,
      `Time: ${data.time || ""}`
    ].join("\n");
    window.open(`https://wa.me/12018971912?text=${encodeURIComponent(message)}`, "_blank");
    return;
  }

  button.disabled = true;
  button.textContent = "OPENING SECURE CHECKOUT...";

  try {
    const response = await fetch("/api/create-checkout", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Checkout failed");
    location.href = result.url;
  } catch (error) {
    alert(error.message);
    button.disabled = false;
    button.textContent = "PAY & CONFIRM";
  }
});
