const routes = {
  "mia-miami-beach": {label:"MIA → Miami Beach", price:110},
  "mia-brickell": {label:"MIA → Downtown / Brickell", price:100},
  "mia-fll": {label:"MIA → FLL", price:130},
  "mia-boca": {label:"MIA → Boca Raton", price:180},
  "mia-west-palm": {label:"MIA → West Palm Beach", price:240},
  "port-mia": {label:"PortMiami → MIA", price:100}
};
const adjustments = {"Luxury Sedan":-15,"Luxury SUV":0,"Passenger Van":40,"Executive Van":80};
const hourly = {"Luxury Sedan":85,"Luxury SUV":100,"Passenger Van":140,"Executive Van":180};
const form = document.querySelector("#bookingForm");
const totalEl = document.querySelector("#total");
const routeWrap = document.querySelector("#routeWrap");
const hoursWrap = document.querySelector("#hoursWrap");
const roundWrap = document.querySelector("#roundWrap");
const returnFields = document.querySelector("#returnFields");

function fillTimeSelect(id) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">Select time</option>';
  for (let h=0; h<24; h++) {
    for (let m of [0,30]) {
      const value = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
      const hour12 = h % 12 || 12;
      const label = `${hour12}:${String(m).padStart(2,"0")} ${h < 12 ? "AM" : "PM"}`;
      select.insertAdjacentHTML("beforeend", `<option value="${value}">${label}</option>`);
    }
  }
}
fillTimeSelect("pickupTime"); fillTimeSelect("returnTime");

const today = new Date().toISOString().split("T")[0];
document.getElementById("pickupDate").min = today;
document.getElementById("returnDate").min = today;
document.querySelectorAll("[data-picker]").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.picker);
    if (input.showPicker) input.showPicker(); else input.focus();
  });
});

function getData(){ return Object.fromEntries(new FormData(form).entries()); }
function calculate() {
  const d = getData();
  const transfer = d.serviceType === "transfer";
  const vehicle = d.vehicle;
  let total = transfer
    ? routes[d.route].price + adjustments[vehicle]
    : hourly[vehicle] * Math.max(3, Number(d.hours || 3));
  if (transfer && document.getElementById("roundTrip").checked) total *= 2;
  totalEl.textContent = `$${total.toFixed(2)}`;
  document.getElementById("sumService").textContent = transfer ? "Point-to-Point" : `${Math.max(3, Number(d.hours || 3))} Hour Service`;
  document.getElementById("sumRoute").textContent = transfer ? routes[d.route].label : "Hourly Chauffeur";
  document.getElementById("sumVehicle").textContent = vehicle;
  document.getElementById("sumDate").textContent = d.date ? new Date(d.date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "Select date";
}
function toggleMode() {
  const transfer = form.querySelector('input[name="serviceType"]:checked').value === "transfer";
  routeWrap.hidden = !transfer; roundWrap.hidden = !transfer; hoursWrap.hidden = transfer;
  calculate();
}
function toggleReturn() {
  returnFields.hidden = !document.getElementById("roundTrip").checked;
  document.getElementById("returnDate").required = !returnFields.hidden;
  document.getElementById("returnTime").required = !returnFields.hidden;
  calculate();
}
form.addEventListener("input", calculate);
form.addEventListener("change", () => {toggleMode(); toggleReturn();});
toggleMode(); toggleReturn();

form.addEventListener("submit", async e => {
  e.preventDefault();
  const button = form.querySelector(".payButton");
  button.disabled = true; button.textContent = "OPENING SECURE CHECKOUT...";
  const data = getData();
  data.roundTrip = document.getElementById("roundTrip").checked;
  try {
    const response = await fetch("/api/create-checkout", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
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
