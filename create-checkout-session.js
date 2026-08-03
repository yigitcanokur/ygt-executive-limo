const ROUTES = {
  mia_miami_beach: { label: 'MIA → Miami Beach', suv: 110 },
  mia_brickell: { label: 'MIA → Downtown / Brickell', suv: 100 },
  mia_fll: { label: 'MIA → FLL', suv: 130 },
  mia_boca: { label: 'MIA → Boca Raton', suv: 180 },
  mia_west_palm: { label: 'MIA → West Palm Beach', suv: 240 },
  port_mia: { label: 'Port of Miami → MIA', suv: 100 }
};

const VEHICLES = {
  sedan: { label: 'Luxury Sedan', transferAdjustment: -15, hourly: 85 },
  suv: { label: 'Luxury SUV', transferAdjustment: 0, hourly: 100 },
  sprinter: { label: 'Passenger Sprinter', transferAdjustment: 40, hourly: 140 },
  executive_sprinter: { label: 'Executive Sprinter', transferAdjustment: 80, hourly: 180 }
};

function calculatePrice(input) {
  const vehicle = VEHICLES[input.vehicle];
  if (!vehicle) throw new Error('Invalid vehicle category.');

  if (input.service === 'hourly') {
    const hours = Number(input.hours);
    if (!Number.isInteger(hours) || hours < 3 || hours > 24) {
      throw new Error('Hourly service requires 3 to 24 whole hours.');
    }
    return {
      amount: vehicle.hourly * hours,
      description: `${vehicle.label} · ${hours}-hour chauffeur service`,
      routeLabel: 'Hourly Chauffeur Service'
    };
  }

  const route = ROUTES[input.route];
  if (!route) throw new Error('Select an available fixed-price route.');
  const tripMultiplier = input.tripType === 'round_trip' ? 2 : 1;
  const oneWay = route.suv + vehicle.transferAdjustment;
  return {
    amount: oneWay * tripMultiplier,
    description: `${vehicle.label} · ${route.label}${tripMultiplier === 2 ? ' · Round Trip' : ''}`,
    routeLabel: route.label
  };
}

module.exports = { ROUTES, VEHICLES, calculatePrice };
