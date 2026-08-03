
const routes = {
  "mia-miami-beach":110, "mia-brickell":100, "mia-fll":130,
  "mia-boca":180, "mia-west-palm":240, "port-mia":100
};
const adjustments = {"Luxury Sedan":-15,"Luxury SUV":0,"Passenger Van":40,"Executive Van":80};
const hourly = {"Luxury Sedan":85,"Luxury SUV":100,"Passenger Van":140,"Executive Van":180};

const form = document.querySelector("#bookingForm");
const totalEl = document.querySelector("#total");
const routeWrap = document.querySelector("#routeWrap");
const hoursWrap = document.querySelector("#hoursWrap");
const roundWrap = document.querySelector("#roundWrap");

function price() {
  const d = new FormData(form);
  const type = d.get("serviceType");
  const vehicle = d.get("vehicle");
  let total = type === "hourly"
    ? hourly[vehicle] * Math.max(3, Number(d.get("hours") || 3))
    : routes[d.get("route")] + adjustments[vehicle];
  if (type === "transfer" && d.get("roundTrip")) total *= 2;
  totalEl.textContent = `$${total.toFixed(2)}`;
}
function toggle() {
  const hourlyMode = form.serviceType.value === "hourly";
  routeWrap.hidden = hourlyMode;
  roundWrap.hidden = hourlyMode;
  hoursWrap.hidden = !hourlyMode;
  price();
}
form.addEventListener("input", price);
form.addEventListener("change", toggle);
toggle();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  button.textContent = "OPENING SECURE CHECKOUT...";
  const data = Object.fromEntries(new FormData(form).entries());
  data.roundTrip = form.roundTrip.checked;
  try {
    const response = await fetch("/api/create-checkout", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    location.href = result.url;
  } catch (err) {
    alert(err.message);
    button.disabled = false;
    button.textContent = "PAY & CONFIRM";
  }
});
