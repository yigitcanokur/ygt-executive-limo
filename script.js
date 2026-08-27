
const fixedPricing = {
  "mia-miami-beach": {
    "Luxury Sedan": 105,
    "Chevrolet Suburban": 120,
    "Cadillac Escalade ESV": 145,
    "Mercedes-Benz S-Class": 180,
    "Passenger Sprinter": 250,
    "Executive Sprinter": 295
  },
  "mia-portmiami": {
    "Luxury Sedan": 105,
    "Chevrolet Suburban": 120,
    "Cadillac Escalade ESV": 145,
    "Mercedes-Benz S-Class": 180,
    "Passenger Sprinter": 250,
    "Executive Sprinter": 295
  },
  "mia-fll": {
    "Luxury Sedan": 139,
    "Chevrolet Suburban": 168,
    "Cadillac Escalade ESV": 205,
    "Mercedes-Benz S-Class": 240,
    "Passenger Sprinter": 340,
    "Executive Sprinter": 395
  },
  "fll-miami-beach": {
    "Luxury Sedan": 150,
    "Chevrolet Suburban": 170,
    "Cadillac Escalade ESV": 215,
    "Mercedes-Benz S-Class": 250,
    "Passenger Sprinter": 355,
    "Executive Sprinter": 410
  },
  "fll-portmiami": {
    "Luxury Sedan": 150,
    "Chevrolet Suburban": 170,
    "Cadillac Escalade ESV": 215,
    "Mercedes-Benz S-Class": 250,
    "Passenger Sprinter": 355,
    "Executive Sprinter": 410
  },
  "mia-boca": {
    "Luxury Sedan": 170,
    "Chevrolet Suburban": 210,
    "Cadillac Escalade ESV": 245,
    "Mercedes-Benz S-Class": 295,
    "Passenger Sprinter": 430,
    "Executive Sprinter": 485
  },
  "fll-boca": {
    "Luxury Sedan": 135,
    "Chevrolet Suburban": 165,
    "Cadillac Escalade ESV": 195,
    "Mercedes-Benz S-Class": 235,
    "Passenger Sprinter": 350,
    "Executive Sprinter": 395
  },
  "mia-west-palm": {
    "Luxury Sedan": 205,
    "Chevrolet Suburban": 260,
    "Cadillac Escalade ESV": 300,
    "Mercedes-Benz S-Class": 350,
    "Passenger Sprinter": 520,
    "Executive Sprinter": 595
  },
  "fll-west-palm": {
    "Luxury Sedan": 175,
    "Chevrolet Suburban": 220,
    "Cadillac Escalade ESV": 255,
    "Mercedes-Benz S-Class": 300,
    "Passenger Sprinter": 470,
    "Executive Sprinter": 540
  },
  "mia-orlando": {
    "Luxury Sedan": 525,
    "Chevrolet Suburban": 650,
    "Cadillac Escalade ESV": 750,
    "Mercedes-Benz S-Class": 850,
    "Passenger Sprinter": 1150,
    "Executive Sprinter": 1300
  }
};

const hourly3 = {
  "Luxury Sedan": 299,
  "Chevrolet Suburban": 339,
  "Cadillac Escalade ESV": 379,
  "Mercedes-Benz S-Class": 499,
  "Passenger Sprinter": 525,
  "Executive Sprinter": 615
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

function setAddressVerified(input, verified){
  if(!input)return;
  const field=input.closest(".field, .formField, label, .inputWrap")||input.parentElement;
  if(field)field.classList.toggle("google-address-verified",!!verified);
}
if(pickupAddress){
  setAddressVerified(pickupAddress,false);
  pickupAddress.addEventListener("input",()=>setAddressVerified(pickupAddress,false));
}
if(dropoffAddress){
  setAddressVerified(dropoffAddress,false);
  dropoffAddress.addEventListener("input",()=>setAddressVerified(dropoffAddress,false));
}
document.addEventListener("ygt-place-selected",()=>{
  if(pickupPlaceId && pickupPlaceId.value)setAddressVerified(pickupAddress,true);
  if(dropoffPlaceId && dropoffPlaceId.value)setAddressVerified(dropoffAddress,true);
});

// V14.1.1 — Google address verification tick state
const googleVerifiedAddress = {
  pickup: false,
  dropoff: false
};

function setGoogleVerified(type, verified) {
  googleVerifiedAddress[type] = Boolean(verified);
  const input = type === "pickup" ? pickupAddress : dropoffAddress;
  if (!input) return;

  const field = input.closest(".field, .formField, label, .inputWrap") || input.parentElement;
  if (!field) return;

  field.classList.toggle("google-address-verified", Boolean(verified));
}

function resetGoogleVerified(type) {
  setGoogleVerified(type, false);
}

if (pickupAddress) {
  resetGoogleVerified("pickup");
  pickupAddress.addEventListener("input", () => resetGoogleVerified("pickup"));
}
if (dropoffAddress) {
  resetGoogleVerified("dropoff");
  dropoffAddress.addEventListener("input", () => resetGoogleVerified("dropoff"));
}

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

/* Custom YGT date picker */
const dateModal = document.getElementById("datePickerModal");
const dateGrid = document.getElementById("dateGrid");
const dateMonthLabel = document.getElementById("dateMonthLabel");
let activeDateTarget = null;
let calendarCursor = new Date();
calendarCursor.setDate(1);

function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function formatDisplayDate(iso) {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    weekday:"short", month:"short", day:"numeric", year:"numeric"
  });
}

function todayAtMidnight() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function openDatePicker(targetId) {
  activeDateTarget = targetId;
  const currentValue = document.getElementById(targetId).value;
  const base = currentValue ? new Date(`${currentValue}T12:00:00`) : new Date();
  calendarCursor = new Date(base.getFullYear(), base.getMonth(), 1);
  renderCalendar();
  dateModal.hidden = false;
  document.body.classList.add("modalOpen");
}

function closeDatePicker() {
  dateModal.hidden = true;
  document.body.classList.remove("modalOpen");
}

function selectDate(date) {
  const input = document.getElementById(activeDateTarget);
  const display = document.getElementById(`${activeDateTarget}Display`);
  const value = isoDate(date);
  input.value = value;
  display.value = formatDisplayDate(value);
  input.dispatchEvent(new Event("change", {bubbles:true}));

  if (activeDateTarget === "pickupDate") {
    const returnInput = document.getElementById("returnDate");
    const returnDisplay = document.getElementById("returnDateDisplay");
    if (returnInput.value && returnInput.value < value) {
      returnInput.value = value;
      returnDisplay.value = formatDisplayDate(value);
    }
  }
  closeDatePicker();
  updateSummary();
}

function renderCalendar() {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const selected = activeDateTarget ? document.getElementById(activeDateTarget).value : "";
  const minimumDate = activeDateTarget === "returnDate" && document.getElementById("pickupDate").value
    ? new Date(`${document.getElementById("pickupDate").value}T00:00:00`)
    : todayAtMidnight();

  dateMonthLabel.textContent = new Date(year, month, 1).toLocaleDateString("en-US", {
    month:"long", year:"numeric"
  });
  dateGrid.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement("span");
    blank.className = "dateBlank";
    dateGrid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = day;
    button.className = "dateDay";
    const value = isoDate(date);

    if (date < minimumDate) {
      button.disabled = true;
      button.classList.add("disabled");
    }
    if (value === isoDate(todayAtMidnight())) button.classList.add("today");
    if (value === selected) button.classList.add("selected");

    button.addEventListener("click", () => selectDate(date));
    dateGrid.appendChild(button);
  }
}

document.querySelectorAll("[data-date-target]").forEach(button => {
  button.addEventListener("click", event => {
    event.stopPropagation();
    openDatePicker(button.dataset.dateTarget);
  });
});

document.querySelectorAll(".dateDisplayWrap").forEach(wrapper => {
  wrapper.addEventListener("click", event => {
    if (event.target.closest(".dateOpenButton")) return;
    const button = wrapper.querySelector("[data-date-target]");
    if (button) openDatePicker(button.dataset.dateTarget);
  });
});
document.querySelectorAll("[data-date-close]").forEach(button => {
  button.addEventListener("click", closeDatePicker);
});
document.getElementById("datePrev").addEventListener("click", () => {
  calendarCursor.setMonth(calendarCursor.getMonth() - 1);
  renderCalendar();
});
document.getElementById("dateNext").addEventListener("click", () => {
  calendarCursor.setMonth(calendarCursor.getMonth() + 1);
  renderCalendar();
});
document.getElementById("dateToday").addEventListener("click", () => selectDate(todayAtMidnight()));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !dateModal.hidden) closeDatePicker();
});

fillTimes("returnTime");

function serviceType() {
  return form.querySelector('input[name="serviceType"]:checked').value;
}

function normalize(value) {
  return String(value || "").toLowerCase();
}

function detectZone(value) {
  const v = normalize(value);

  if (
    v.includes("miami international airport") ||
    v.includes("(mia)") ||
    v.includes("2100 nw 42nd")
  ) return "mia";

  if (
    v.includes("fort lauderdale-hollywood international airport") ||
    v.includes("(fll)") ||
    v.includes("100 terminal dr") ||
    v.includes("fort lauderdale beach") ||
    v.includes("w fort lauderdale") ||
    v.includes("w hotel fort lauderdale") ||
    v.includes("las olas") ||
    v.includes("seabreeze boulevard") ||
    v.includes("seabreeze blvd") ||
    v.includes("north fort lauderdale beach boulevard") ||
    v.includes("n fort lauderdale beach blvd") ||
    v.includes("fort lauderdale, fl")
  ) return "fll";

  if (
    v.includes("portmiami") ||
    v.includes("port of miami") ||
    v.includes("dodge island") ||
    v.includes("cruise terminal")
  ) return "portmiami";

  if (
    v.includes("miami beach") ||
    v.includes("fontainebleau") ||
    v.includes("faena") ||
    v.includes("w south beach") ||
    v.includes("1 hotel south beach") ||
    v.includes("loews miami beach") ||
    v.includes("eden roc") ||
    v.includes("collins avenue") ||
    v.includes("collins ave")
  ) return "miami-beach";

  if (
    v.includes("boca raton") ||
    v.includes("mizner park")
  ) return "boca";

  if (
    v.includes("west palm beach") ||
    v.includes("palm beach international airport") ||
    v.includes("(pbi)") ||
    v.includes("palm beach, fl")
  ) return "west-palm";

  if (
    v.includes("orlando") ||
    v.includes("orlando international airport") ||
    v.includes("(mco)") ||
    v.includes("disney world") ||
    v.includes("universal orlando")
  ) return "orlando";

  return "";
}

function detectFixedRoute() {
  const pickupZone = detectZone(pickupAddress.value);
  const dropoffZone = detectZone(dropoffAddress.value);
  const pair = [pickupZone, dropoffZone].sort().join("|");

  const routeMap = {
    "mia|miami-beach": "mia-miami-beach",
    "mia|portmiami": "mia-portmiami",
    "fll|mia": "mia-fll",
    "fll|miami-beach": "fll-miami-beach",
    "fll|portmiami": "fll-portmiami",
    "boca|mia": "mia-boca",
    "boca|fll": "fll-boca",
    "mia|west-palm": "mia-west-palm",
    "fll|west-palm": "fll-west-palm",
    "mia|orlando": "mia-orlando"
  };

  return routeMap[pair] || "";
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


function updateLiveRouteCard() {
  const card=document.getElementById("routeLiveCard");
  if(!card)return;
  if(serviceType()!=="transfer"||!pickupAddress.value||!dropoffAddress.value){card.hidden=true;return;}
  card.hidden=false;
  const labels={"mia-miami-beach":"MIA ↔ Miami Beach","mia-portmiami":"MIA ↔ PortMiami","mia-fll":"MIA ↔ Fort Lauderdale","fll-miami-beach":"Fort Lauderdale ↔ Miami Beach","fll-portmiami":"Fort Lauderdale ↔ PortMiami","mia-boca":"MIA ↔ Boca Raton","fll-boca":"Fort Lauderdale ↔ Boca Raton","mia-west-palm":"MIA ↔ West Palm Beach","fll-west-palm":"Fort Lauderdale ↔ West Palm Beach","mia-orlando":"MIA ↔ Orlando"};
  const key=detectFixedRoute();
  document.getElementById("routeLiveName").textContent=labels[key]||`${pickupAddress.value} → ${dropoffAddress.value}`;
  document.getElementById("routeLiveDistance").textContent=routeQuote?.distanceText||"Calculating…";
  document.getElementById("routeLiveDuration").textContent=routeQuote?.durationText||"Calculating…";
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

  // Always detect the fixed route directly from the visible Google-selected addresses.
  // This prevents prices from disappearing if an async quote or another form event resets routeKey.
  const detectedRoute = detectFixedRoute();
  if (detectedRoute && fixedPricing[detectedRoute]) {
    routeKey = detectedRoute;
    return fixedPricing[detectedRoute][vehicle] ?? null;
  }

  if (routeKey && fixedPricing[routeKey]) {
    return fixedPricing[routeKey][vehicle] ?? null;
  }

  if (routeQuote?.basePrices?.[vehicle] != null) {
    return routeQuote.basePrices[vehicle];
  }

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
          ${price != null ? `$${price.toFixed(2)}` : (vehicle.customQuote ? "Call for availability" : "Price loading…")}
          <small>${price != null ? "All-inclusive price" : (vehicle.customQuote ? "Custom quote" : "Calculating route")}</small>
        </div>
        <div class="green">${price != null ? "✓ Final Price – No Hidden Fees" : (vehicle.customQuote ? "Exclusive vehicle · availability required" : "Google route pricing in progress")}</div>
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

  if (step === 2) {
    if (serviceType() === "transfer") routeKey = detectFixedRoute();
    updateLiveRouteCard();
    renderVehicles();
  }
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

let previousServiceType = serviceType();

function toggleMode() {
  const currentType = serviceType();
  const transfer = currentType === "transfer";
  document.getElementById("pickupWrap").hidden = !transfer;
  document.getElementById("dropoffWrap").hidden = !transfer;
  document.getElementById("roundWrap").hidden = !transfer;
  document.getElementById("hoursWrap").hidden = transfer;

  if (currentType !== previousServiceType) {
    routeQuote = null;
    routeKey = transfer ? detectFixedRoute() : "";
    if (!transfer) routeInfo.hidden = true;
    previousServiceType = currentType;
  }

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

  const detectedRouteKey = serviceType() === "transfer" ? detectFixedRoute() : "";
  const fixedRouteLabels = {
    "mia-miami-beach":"MIA ↔ Miami Beach",
    "mia-portmiami":"MIA ↔ PortMiami",
    "mia-fll":"MIA ↔ FLL",
    "fll-miami-beach":"FLL ↔ Miami Beach",
    "fll-portmiami":"FLL ↔ PortMiami",
    "mia-boca":"MIA ↔ Boca Raton",
    "fll-boca":"FLL ↔ Boca Raton",
    "mia-west-palm":"MIA ↔ West Palm Beach",
    "fll-west-palm":"FLL ↔ West Palm Beach",
    "mia-orlando":"MIA ↔ Orlando"
  };
  document.getElementById("sumRoute").textContent =
    serviceType() === "hourly"
      ? "Hourly Chauffeur"
      : (detectedRouteKey ? fixedRouteLabels[detectedRouteKey] : (data.pickupAddress && data.dropoffAddress ? `${data.pickupAddress} → ${data.dropoffAddress}` : "—"));

  const pickupDateText = data.date
    ? new Date(data.date + "T12:00:00").toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"})
    : "—";
  const pickupTimeText = data.time
    ? new Date(`2000-01-01T${data.time}:00`).toLocaleTimeString("en-US", {hour:"numeric", minute:"2-digit"})
    : "";
  const returnText = document.getElementById("roundTrip").checked && data.returnDate
    ? ` · Return ${new Date(data.returnDate + "T12:00:00").toLocaleDateString("en-US", {month:"short", day:"numeric"})}${data.returnTime ? " " + new Date(`2000-01-01T${data.returnTime}:00`).toLocaleTimeString("en-US", {hour:"numeric", minute:"2-digit"}) : ""}`
    : "";
  document.getElementById("sumDate").textContent = `${pickupDateText}${pickupTimeText ? " · " + pickupTimeText : ""}${returnText}`;

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

form.addEventListener("change", event => {
  toggleMode();
  toggleReturn();

  if (
    serviceType() === "transfer" &&
    ["pickupAddress", "dropoffAddress", "pickupPlaceId", "dropoffPlaceId"].includes(event.target.id)
  ) {
    scheduleRouteQuote();
  }

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
