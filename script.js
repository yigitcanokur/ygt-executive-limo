const pricing={
  "mia-miami-beach":{"Luxury Sedan":105,"Chevrolet Suburban":118,"Cadillac Escalade ESV":149,"Mercedes-Benz S-Class":199,"Passenger Sprinter":205,"Executive Sprinter":260,"Rolls-Royce Ghost":null},
  "mia-fll":{"Luxury Sedan":145,"Chevrolet Suburban":169,"Cadillac Escalade ESV":215,"Mercedes-Benz S-Class":199,"Passenger Sprinter":245,"Executive Sprinter":280,"Rolls-Royce Ghost":null},
  "fll-local":{"Luxury Sedan":104,"Chevrolet Suburban":117,"Cadillac Escalade ESV":149,"Mercedes-Benz S-Class":179,"Passenger Sprinter":195,"Executive Sprinter":225,"Rolls-Royce Ghost":null}
};
const hourly3={"Luxury Sedan":299,"Chevrolet Suburban":339,"Cadillac Escalade ESV":379,"Mercedes-Benz S-Class":499,"Passenger Sprinter":389,"Executive Sprinter":479,"Rolls-Royce Ghost":null};
const vehicles=[
{name:"Luxury Sedan",image:"assets/sedan.jpg",passengers:2,bags:3,subtitle:"Premium made accessible"},
{name:"Chevrolet Suburban",image:"assets/suburban.jpg",passengers:6,bags:6,subtitle:"Full-size luxury SUV",popular:true},
{name:"Cadillac Escalade ESV",image:"assets/escalade.jpg",passengers:6,bags:6,subtitle:"Flagship luxury SUV"},
{name:"Mercedes-Benz S-Class",image:"assets/sclass.jpg",passengers:2,bags:3,subtitle:"First-class executive sedan"},
{name:"Passenger Sprinter",image:"assets/passenger-van.jpg",passengers:10,bags:10,subtitle:"Comfortable group transportation"},
{name:"Executive Sprinter",image:"assets/executive-van.jpg",passengers:14,bags:14,subtitle:"Premium group travel"},
{name:"Rolls-Royce Ghost",image:"assets/rolls-royce-ghost.jpg",passengers:2,bags:2,subtitle:"Ultra-luxury chauffeur experience",customQuote:true}
];
const routeLabels={"mia-miami-beach":"MIA → Miami Beach","mia-fll":"MIA → FLL","fll-local":"FLL → Fort Lauderdale Area"};
const routeAddresses={"mia-miami-beach":["Miami International Airport (MIA), Miami, FL","Miami Beach, FL"],"mia-fll":["Miami International Airport (MIA), Miami, FL","Fort Lauderdale-Hollywood International Airport (FLL), Fort Lauderdale, FL"],"fll-local":["Fort Lauderdale-Hollywood International Airport (FLL), Fort Lauderdale, FL","Fort Lauderdale, FL"]};
let currentStep=1,selectedVehicle="";
const form=document.getElementById("bookingForm"),quickRoute=document.getElementById("quickRoute"),vehicleInput=document.getElementById("vehicleInput");
function fillTimes(id){const s=document.getElementById(id);s.innerHTML='<option value="">Select time</option>';for(let h=0;h<24;h++)for(let m of[0,30]){const v=`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;s.insertAdjacentHTML("beforeend",`<option value="${v}">${h%12||12}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"}</option>`);}}fillTimes("pickupTime");fillTimes("returnTime");
const today=new Date().toISOString().split("T")[0];pickupDate.min=today;returnDate.min=today;
function serviceType(){return form.querySelector('input[name="serviceType"]:checked').value;}
function tripPrice(vehicle){
  if(vehicle==="Rolls-Royce Ghost") return null;
  if(serviceType()==="hourly"){
    const hrs=Math.max(3,Number(form.hours.value||3));
    return hourly3[vehicle] ? Math.round(hourly3[vehicle]/3*hrs) : null;
  }
  const route=quickRoute.value;
  if(route&&pricing[route]) return pricing[route][vehicle] ?? null;
  return null;
}const route=quickRoute.value;if(route&&pricing[route])return pricing[route][vehicle];return null;}
function renderVehicles(){const grid=document.getElementById("vehicleGrid");grid.innerHTML="";vehicles.forEach(v=>{const price=tripPrice(v.name);const card=document.createElement("article");card.className="vehicleCard"+(selectedVehicle===v.name?" selected":"");card.innerHTML=`<div class="vehicleImage"><img src="${v.image}" alt="${v.name}"></div><div class="vehicleBody"><div class="vehicleTop"><h4>${v.name}</h4>${v.popular?'<span class="badge">Most Popular</span>':''}</div><div class="vehicleSubtitle">${v.subtitle}</div><div class="vehiclePrice">${price!=null?`$${price.toFixed(2)}`:"Call for availability"}<small>${price!=null?"All-inclusive price":"Custom quote"}</small></div><div class="green">${price!=null?"✓ Final Price – No Hidden Fees":"Exclusive vehicle · availability required"}</div><div class="capacity"><span>Up to ${v.passengers} passengers</span><span>Up to ${v.bags} bags</span></div><div class="included">✓ Flight tracking<br>✓ Complimentary water<br>✓ Phone charger<br>✓ Airport wait time<br>✓ Child seat on request</div><button class="selectVehicle" type="button">${v.customQuote?"Check Availability":"Select Vehicle"}</button></div>`;card.querySelector("button").onclick=()=>{selectedVehicle=v.name;vehicleInput.value=v.name;updateSummary();showStep(3);};grid.appendChild(card);});}
function showStep(n){if(n===2&&!validateStep1())return;if(n===3&&!selectedVehicle){alert("Please select a vehicle.");return;}currentStep=n;document.querySelectorAll(".wizardStep").forEach(s=>s.classList.toggle("active",Number(s.dataset.step)===n));document.querySelectorAll(".stepDot").forEach((d,i)=>{d.classList.toggle("active",i+1===n);d.classList.toggle("done",i+1<n);});progressFill.style.width=`${(n-1)*50}%`;if(n===2)renderVehicles();updateSummary();document.getElementById("booking").scrollIntoView({behavior:"smooth",block:"start"});}
function validateStep1(){const type=serviceType();if(type==="transfer"&&(!pickupAddress.value||!dropoffAddress.value)){alert("Please enter pickup and drop-off.");return false;}if(!pickupDate.value||!pickupTime.value){alert("Please choose date and time.");return false;}return true;}
document.querySelectorAll("[data-next]").forEach(b=>b.onclick=()=>showStep(Number(b.dataset.next)));document.querySelectorAll("[data-back]").forEach(b=>b.onclick=()=>showStep(Number(b.dataset.back)));document.querySelectorAll("[data-step-go]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.stepGo);if(n<=currentStep)showStep(n);});
function toggleMode(){const t=serviceType()==="transfer";quickRouteWrap.hidden=!t;pickupWrap.hidden=!t;dropoffWrap.hidden=!t;roundWrap.hidden=!t;hoursWrap.hidden=t;renderVehicles();updateSummary();}
function toggleReturn(){returnFields.hidden=!roundTrip.checked;returnDate.required=roundTrip.checked;returnTime.required=roundTrip.checked;}
form.addEventListener("change",()=>{toggleMode();toggleReturn();updateSummary();});form.addEventListener("input",updateSummary);toggleMode();toggleReturn();
quickRoute.addEventListener("change",()=>{const r=routeAddresses[quickRoute.value];if(r){pickupAddress.value=r[0];dropoffAddress.value=r[1];}updateSummary();});
function updateSummary(){const d=Object.fromEntries(new FormData(form).entries());sumService.textContent=serviceType()==="hourly"?`${Math.max(3,Number(d.hours||3))} Hour Service`:(roundTrip.checked?"Round Trip":"Point-to-Point");sumRoute.textContent=serviceType()==="hourly"?"Hourly Chauffeur":quickRoute.value?routeLabels[quickRoute.value]:(d.pickupAddress&&d.dropoffAddress?`${d.pickupAddress} → ${d.dropoffAddress}`:"—");sumDate.textContent=d.date?new Date(d.date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—";sumVehicle.textContent=selectedVehicle||"—";const p=selectedVehicle?tripPrice(selectedVehicle):null;
const payBtn=form.querySelector(".payButton");
if(selectedVehicle==="Rolls-Royce Ghost"){
  total.textContent="Custom quote";
  payBtn.textContent="REQUEST AVAILABILITY";
  payBtn.classList.add("customQuoteButton");
}else{
  total.textContent=p!=null?`$${(roundTrip.checked&&serviceType()==="transfer"?p*2:p).toFixed(2)}`:"—";
  payBtn.textContent="PAY & CONFIRM";
  payBtn.classList.remove("customQuoteButton");
}}
form.addEventListener("submit",async e=>{e.preventDefault();if(!selectedVehicle)return;const btn=form.querySelector(".payButton");const data=Object.fromEntries(new FormData(form).entries());data.roundTrip=roundTrip.checked;
if(selectedVehicle==="Rolls-Royce Ghost"){
  const message=`Hello YGT Executive Limo, I would like to check availability for a Rolls-Royce Ghost.%0A%0AName: ${encodeURIComponent(data.name||"")}%0APhone: ${encodeURIComponent(data.phone||"")}%0APickup: ${encodeURIComponent(data.pickupAddress||"")}%0ADrop-off: ${encodeURIComponent(data.dropoffAddress||"")}%0ADate: ${encodeURIComponent(data.date||"")}%0ATime: ${encodeURIComponent(data.time||"")}`;
  window.open(`https://wa.me/12018971912?text=${message}`,"_blank");
  return;
}
btn.disabled=true;btn.textContent="OPENING SECURE CHECKOUT...";try{const r=await fetch("/api/create-checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const j=await r.json();if(!r.ok)throw new Error(j.error||"Checkout failed");location.href=j.url;}catch(err){alert(err.message);btn.disabled=false;btn.textContent="PAY & CONFIRM";}});
