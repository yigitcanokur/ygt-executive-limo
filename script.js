
const routes = {
  "mia-miami-beach": {label:"MIA → Miami Beach", price:110, pickup:"Miami International Airport (MIA), Miami, FL", dropoff:"Miami Beach, FL"},
  "mia-brickell": {label:"MIA → Downtown / Brickell", price:100, pickup:"Miami International Airport (MIA), Miami, FL", dropoff:"Brickell, Miami, FL"},
  "mia-fll": {label:"MIA → FLL", price:130, pickup:"Miami International Airport (MIA), Miami, FL", dropoff:"Fort Lauderdale-Hollywood International Airport (FLL), Fort Lauderdale, FL"},
  "mia-boca": {label:"MIA → Boca Raton", price:180, pickup:"Miami International Airport (MIA), Miami, FL", dropoff:"Boca Raton, FL"},
  "mia-west-palm": {label:"MIA → West Palm Beach", price:240, pickup:"Miami International Airport (MIA), Miami, FL", dropoff:"West Palm Beach, FL"},
  "port-mia": {label:"PortMiami → MIA", price:100, pickup:"PortMiami, Miami, FL", dropoff:"Miami International Airport (MIA), Miami, FL"}
};
const adjustments = {"Luxury Sedan":-15,"Luxury SUV":0,"Passenger Van":40,"Executive Van":80};
const hourly = {"Luxury Sedan":85,"Luxury SUV":100,"Passenger Van":140,"Executive Van":180};

const form = document.querySelector("#bookingForm");
const totalEl = document.querySelector("#total");
const routeWrap = document.querySelector("#routeWrap");
const pickupWrap = document.querySelector("#pickupWrap");
const dropoffWrap = document.querySelector("#dropoffWrap");
const hoursWrap = document.querySelector("#hoursWrap");
const roundWrap = document.querySelector("#roundWrap");
const returnFields = document.querySelector("#returnFields");
const quickRoute = document.querySelector("#quickRoute");
const routeInfo = document.querySelector("#routeInfo");
let customQuote = null;
let quoteTimer = null;

function fillTimeSelect(id) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">Select time</option>';
  for (let h=0; h<24; h++) for (let m of [0,30]) {
    const value = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
    const label = `${h % 12 || 12}:${String(m).padStart(2,"0")} ${h < 12 ? "AM" : "PM"}`;
    select.insertAdjacentHTML("beforeend", `<option value="${value}">${label}</option>`);
  }
}
fillTimeSelect("pickupTime"); fillTimeSelect("returnTime");

const today = new Date().toISOString().split("T")[0];
document.getElementById("pickupDate").min = today;
document.getElementById("returnDate").min = today;
document.querySelectorAll("[data-picker]").forEach(btn => btn.addEventListener("click", () => {
  const input = document.getElementById(btn.dataset.picker);
  if (input.showPicker) input.showPicker(); else input.focus();
}));

function getData(){ return Object.fromEntries(new FormData(form).entries()); }

async function requestRouteQuote() {
  const d = getData();
  if (d.serviceType !== "transfer" || d.route || !d.pickupAddress || !d.dropoffAddress) {
    customQuote = null;
    routeInfo.hidden = true;
    calculate();
    return;
  }

  try {
    const response = await fetch("/api/route-quote", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        pickupAddress:d.pickupAddress,
        dropoffAddress:d.dropoffAddress,
        pickupPlaceId:d.pickupPlaceId,
        dropoffPlaceId:d.dropoffPlaceId,
        vehicle:d.vehicle,
        roundTrip:document.getElementById("roundTrip").checked
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    customQuote = result;
    document.getElementById("distanceText").textContent = result.distanceText;
    document.getElementById("durationText").textContent = result.durationText;
    routeInfo.hidden = false;
  } catch (e) {
    customQuote = null;
    routeInfo.hidden = true;
  }
  calculate();
}

function scheduleQuote() {
  clearTimeout(quoteTimer);
  quoteTimer = setTimeout(requestRouteQuote, 500);
}

function calculate() {
  const d = getData();
  const transfer = d.serviceType === "transfer";
  const vehicle = d.vehicle;
  let total;
  if (!transfer) {
    total = hourly[vehicle] * Math.max(3, Number(d.hours || 3));
  } else if (d.route) {
    total = routes[d.route].price + adjustments[vehicle];
    if (document.getElementById("roundTrip").checked) total *= 2;
  } else if (customQuote && typeof customQuote.total === "number") {
    total = customQuote.total;
  } else {
    total = null;
  }

  totalEl.textContent = total == null ? "Pending" : `$${total.toFixed(2)}`;
  document.getElementById("sumService").textContent = transfer ? "Point-to-Point" : `${Math.max(3, Number(d.hours || 3))} Hour Service`;
  document.getElementById("sumRoute").textContent = transfer
    ? (d.route ? routes[d.route].label : (d.pickupAddress && d.dropoffAddress ? `${d.pickupAddress} → ${d.dropoffAddress}` : "Enter addresses"))
    : "Hourly Chauffeur";
  document.getElementById("sumVehicle").textContent = vehicle;
  document.getElementById("sumDate").textContent = d.date ? new Date(d.date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "Select date";
  form.querySelector(".payButton").disabled = transfer && !d.route && total == null;
}

function toggleMode() {
  const transfer = form.querySelector('input[name="serviceType"]:checked').value === "transfer";
  routeWrap.hidden = !transfer;
  pickupWrap.hidden = !transfer;
  dropoffWrap.hidden = !transfer;
  roundWrap.hidden = !transfer;
  hoursWrap.hidden = transfer;
  if (!transfer) routeInfo.hidden = true;
  calculate();
}
function toggleReturn() {
  returnFields.hidden = !document.getElementById("roundTrip").checked;
  document.getElementById("returnDate").required = !returnFields.hidden;
  document.getElementById("returnTime").required = !returnFields.hidden;
  if (!getData().route) scheduleQuote();
  calculate();
}
function applyQuickRoute() {
  const key = quickRoute.value;
  if (key) {
    document.getElementById("pickupAddress").value = routes[key].pickup;
    document.getElementById("dropoffAddress").value = routes[key].dropoff;
    customQuote = null;
    routeInfo.hidden = true;
  } else {
    document.getElementById("pickupAddress").value = "";
    document.getElementById("dropoffAddress").value = "";
  }
  calculate();
}

quickRoute.addEventListener("change", applyQuickRoute);
["pickupAddress","dropoffAddress"].forEach(id => document.getElementById(id).addEventListener("input", () => {
  if (quickRoute.value) quickRoute.value = "";
  scheduleQuote();
}));
document.addEventListener("ygt-place-selected", scheduleQuote);
form.addEventListener("input", calculate);
form.addEventListener("change", () => { toggleMode(); toggleReturn(); if (!getData().route) scheduleQuote(); });
toggleMode(); toggleReturn();

form.addEventListener("submit", async e => {
  e.preventDefault();
  const button = form.querySelector(".payButton");
  button.disabled = true; button.textContent = "OPENING SECURE CHECKOUT...";
  const data = getData();
  data.roundTrip = document.getElementById("roundTrip").checked;
  try {
    const response = await fetch("/api/create-checkout", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Checkout failed");
    location.href = result.url;
  } catch (err) {
    alert(err.message); button.disabled = false; button.textContent = "PAY & CONFIRM";
  }
});

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) entry.target.classList.add("visible");
}), {threshold:.12});
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
