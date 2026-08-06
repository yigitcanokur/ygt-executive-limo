
let adminToken = sessionStorage.getItem("ygtAdminToken") || "";
let bookings = [];

const login = document.getElementById("adminLogin");
const dashboard = document.getElementById("adminDashboard");
const errorEl = document.getElementById("adminError");

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": adminToken,
      ...(options.headers || {})
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function loadBookings() {
  const data = await api("/api/bookings");
  bookings = data.bookings || [];
  render();
}

function money(cents) {
  return new Intl.NumberFormat("en-US", { style:"currency", currency:"USD" }).format((cents || 0) / 100);
}

function render() {
  const q = document.getElementById("bookingSearch").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;
  const filtered = bookings.filter(b => {
    const haystack = [
      b.reservation_id,b.customer_name,b.customer_email,b.customer_phone,
      b.pickup_address,b.dropoff_address,b.vehicle,b.status
    ].join(" ").toLowerCase();
    return (!q || haystack.includes(q)) && (!status || b.status === status);
  });

  document.getElementById("statTotal").textContent = bookings.length;
  document.getElementById("statNew").textContent = bookings.filter(b => b.status === "New").length;
  document.getElementById("statConfirmed").textContent = bookings.filter(b => b.status === "Confirmed").length;
  document.getElementById("statRevenue").textContent = money(
    bookings.filter(b => b.status !== "Cancelled").reduce((sum,b) => sum + Number(b.amount_total || 0), 0)
  );

  const list = document.getElementById("bookingList");
  list.innerHTML = filtered.length ? "" : '<div class="emptyState">No reservations found.</div>';

  filtered.forEach(b => {
    const card = document.createElement("article");
    card.className = "bookingAdminCard";
    card.innerHTML = `
      <div class="bookingAdminHead">
        <div>
          <span class="bookingId">${b.reservation_id || "Reservation"}</span>
          <h3>${b.customer_name || "Customer"}</h3>
          <p>${b.customer_email || ""} · ${b.customer_phone || ""}</p>
        </div>
        <div class="bookingAmount">${money(b.amount_total)}</div>
      </div>
      <div class="bookingAdminGrid">
        <div><span>Pickup</span><strong>${b.pickup_address || "—"}</strong></div>
        <div><span>Drop-off</span><strong>${b.dropoff_address || "—"}</strong></div>
        <div><span>Date & Time</span><strong>${b.pickup_date || "—"} ${b.pickup_time || ""}</strong></div>
        <div><span>Vehicle</span><strong>${b.vehicle || "—"}</strong></div>
        <div><span>Passengers / Bags</span><strong>${b.passengers || "—"} / ${b.luggage || "—"}</strong></div>
        <div><span>Flight</span><strong>${[b.airline,b.flight].filter(Boolean).join(" ") || "—"}</strong></div>
      </div>
      ${b.notes ? `<div class="bookingNotes"><span>Notes</span><p>${b.notes}</p></div>` : ""}
      <div class="bookingAdminFooter">
        <select data-booking-status="${b.id}">
          ${["New","Confirmed","Completed","Cancelled"].map(s => `<option ${b.status===s?"selected":""}>${s}</option>`).join("")}
        </select>
        <span>${new Date(b.created_at).toLocaleString()}</span>
      </div>`;
    card.querySelector("select").addEventListener("change", async e => {
      await api("/api/bookings", {
        method:"PATCH",
        body:JSON.stringify({ id:b.id, status:e.target.value })
      });
      b.status = e.target.value;
      render();
    });
    list.appendChild(card);
  });
}

document.getElementById("adminLoginButton").addEventListener("click", async () => {
  adminToken = document.getElementById("adminToken").value.trim();
  if (!adminToken) return;
  try {
    await loadBookings();
    sessionStorage.setItem("ygtAdminToken", adminToken);
    login.hidden = true;
    dashboard.hidden = false;
  } catch (error) {
    errorEl.textContent = error.message;
  }
});

document.getElementById("refreshBookings").addEventListener("click", loadBookings);
document.getElementById("bookingSearch").addEventListener("input", render);
document.getElementById("statusFilter").addEventListener("change", render);

document.getElementById("exportCsv").addEventListener("click", () => {
  const headers = ["Reservation","Status","Customer","Email","Phone","Pickup","Drop-off","Date","Time","Vehicle","Amount"];
  const rows = bookings.map(b => [
    b.reservation_id,b.status,b.customer_name,b.customer_email,b.customer_phone,
    b.pickup_address,b.dropoff_address,b.pickup_date,b.pickup_time,b.vehicle,
    (Number(b.amount_total || 0)/100).toFixed(2)
  ]);
  const csv = [headers,...rows].map(row => row.map(v => `"${String(v || "").replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ygt-bookings.csv";
  a.click();
  URL.revokeObjectURL(url);
});

if (adminToken) {
  loadBookings().then(() => {
    login.hidden = true;
    dashboard.hidden = false;
  }).catch(() => sessionStorage.removeItem("ygtAdminToken"));
}
