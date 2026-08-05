
window.ygtMapsReady = false;

async function loadGoogleMaps() {
  try {
    const response = await fetch("/api/maps-config");
    const config = await response.json();
    if (!response.ok || !config.key) return;

    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(config.key)}&libraries=places&loading=async&callback=initYgtAutocomplete`;
      script.async = true;
      script.defer = true;
      script.onerror = reject;
      window.initYgtAutocomplete = () => {
        window.ygtMapsReady = true;
        resolve();
      };
      document.head.appendChild(script);
    });

    const options = {
      componentRestrictions: { country: "us" },
      fields: ["formatted_address", "place_id", "geometry", "name"],
      locationBias: {
        north: 27.6,
        south: 25.0,
        east: -79.8,
        west: -81.0
      }
    };

    [
      ["pickupAddress", "pickupPlaceId"],
      ["dropoffAddress", "dropoffPlaceId"]
    ].forEach(([inputId, placeIdId]) => {
      const input = document.getElementById(inputId);
      const autocomplete = new google.maps.places.Autocomplete(input, options);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        document.getElementById(placeIdId).value = place.place_id || "";
        if (place.formatted_address) input.value = place.formatted_address;
        document.dispatchEvent(new CustomEvent("ygt-place-selected"));
      });
    });
  } catch (error) {
    console.warn("Google Maps autocomplete is not active:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadGoogleMaps);
