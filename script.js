document.getElementById('bookingForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const data = {
    pickup: document.getElementById('pickup').value,
    dropoff: document.getElementById('dropoff').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    vehicle: document.getElementById('vehicle').value,
    passengers: document.getElementById('passengers').value,
    luggage: document.getElementById('luggage').value,
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value
  };

  const message =
`Hello YGT Executive Limo, I would like to book a ride.

Name: ${data.name}
Phone: ${data.phone}
Pickup: ${data.pickup}
Drop-off: ${data.dropoff}
Date: ${data.date}
Time: ${data.time}
Vehicle: ${data.vehicle}
Passengers: ${data.passengers}
Luggage: ${data.luggage}`;

  window.open('https://wa.me/12018971912?text=' + encodeURIComponent(message), '_blank');
});
