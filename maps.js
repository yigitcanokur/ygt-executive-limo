
window.ygtMapsReady = false;

async function loadGoogleMaps() {
  try {
    const response = await fetch("/api/maps-config");
    const config = await response.json();
    if (!response.ok || !config.key) {
      document.dispatchEvent(new CustomEvent("ygt-maps-unavailable"));
      return;
    }

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
      bounds: {
        north: 27.7,
        south: 24.8,
        east: -79.7,
        west: -81.2
      },
      strictBounds: false
    };

    [
      ["pickupAddress", "pickupPlaceId"],
      ["dropoffAddress", "dropoffPlaceId"]
    ].forEach(([inputId, placeIdId]) => {
      const input = document.getElementById(inputId);
      const placeIdInput = document.getElementById(placeIdId);
      const autocomplete = new google.maps.places.Autocomplete(input, options);

      input.addEventListener("input", () => {
        placeIdInput.value = "";
        input.classList.remove("googleSelected");
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.place_id) {
          placeIdInput.value = "";
          input.classList.remove("googleSelected");
          return;
        }
        placeIdInput.value = place.place_id;
        input.value = place.formatted_address || place.name || input.value;
        input.classList.add("googleSelected");
        if (place && place.place_id) document.dispatchEvent(new CustomEvent("ygt-place-selected"));
      });
    });
  } catch (error) {
    console.warn("Google Maps autocomplete is not active:", error);
    document.dispatchEvent(new CustomEvent("ygt-maps-unavailable"));
  }
}

document.addEventListener("DOMContentLoaded", loadGoogleMaps);
