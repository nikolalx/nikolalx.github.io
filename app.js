// Initialize variables
let map;
let currentMarker = null;
let savedMarker = null;
let savedCoordinates = null;
let userPosition = null;
let mapCenteredInitially = false; // New variable to track initial map centering

// Initialize and add the map
function initMap() {
  // Default location (if geolocation fails)
  const defaultLocation = [37.7749, -122.4194]; // San Francisco

  // Create the map centered at the default location
  map = L.map("map").setView(defaultLocation, 13);

  // Set up the OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 26,
  }).addTo(map);

  // Try to get the user's current location with high accuracy
  if (navigator.geolocation) {
    const options = {
      enableHighAccuracy: true, // High accuracy
      timeout: 5000, // 5 seconds timeout
      maximumAge: 0,
    };

    navigator.geolocation.watchPosition(
      updateLocation,
      () => {
        handleLocationError(true);
      },
      options
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false);
  }

  // Listen for device orientation changes
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", handleOrientation, true);
  }

  // Load saved coordinates from localStorage if available
  const saved = localStorage.getItem("savedCoordinates");
  if (saved) {
    savedCoordinates = JSON.parse(saved);
    showSavedLocation();
  }
}

// Handle device orientation changes
function handleOrientation(event) {
  // Get the alpha (compass direction)
  deviceOrientation = 360 - (event.alpha) || 0;

  // Rotate the arrow icon if currentMarker exists
  if (currentMarker) {
    const arrowElement = currentMarker.getElement().querySelector(".arrow");
    if (arrowElement) {
      arrowElement.style.transform = `rotate(${deviceOrientation}deg)`;
    }
  }
}

// Handle geolocation errors
function handleLocationError(browserHasGeolocation) {
  alert(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  // The map remains centered at the default location
}

// Update the current location and marker without resetting the map view
function updateLocation(position) {
  const newUserPosition = [position.coords.latitude, position.coords.longitude];

  if (!mapCenteredInitially) {
    // Center the map only the first time
    map.setView(newUserPosition, 13);
    mapCenteredInitially = true;
  }

  // Check if marker exists, and update or create as needed
  if (currentMarker) {
    // Update the marker position without affecting the view
    currentMarker.setLatLng(newUserPosition);
  } else {
    // Create the marker if it doesn't exist yet
    currentMarker = L.marker(newUserPosition, {
      icon: createCustomIcon(), // Custom icon for the marker
    })
      .addTo(map)
      .bindPopup("Current Location")
      .openPopup();

    setTimeout(() => {
      currentMarker.closePopup();
    }, 1400);
  }
}

// Create the custom icon for the current marker (blue circle + trapezoid)
function createCustomIcon() {
  const iconHtml = `
        <div class="custom-arrow-icon">
            <div class="arrow"></div>
        </div>
    `;

  const arrowIcon = L.divIcon({
    className: "", // No extra classes needed here, it's already in the HTML
    html: iconHtml, // Set the inner HTML to create the blue circle and trapezoid
    iconSize: [40, 40], // Size of the container
    iconAnchor: [20, 20], // Anchors the marker in the center
  });

  return arrowIcon;
}

// Save the current coordinates
function saveCurrentLocation() {
  if (currentMarker) {
    const position = currentMarker.getLatLng();
    savedCoordinates = {
      lat: position.lat,
      lng: position.lng,
    };
    localStorage.setItem("savedCoordinates", JSON.stringify(savedCoordinates));
    alert(
      `Location saved!\nLatitude: ${savedCoordinates.lat}\nLongitude: ${savedCoordinates.lng}`
    );
  } else {
    alert("Current location is not available.");
  }
}

// Show the saved coordinates on the map
function showSavedLocation() {
  if (savedCoordinates) {
    const pos = [savedCoordinates.lat, savedCoordinates.lng];

    // If a saved marker already exists, remove it
    if (savedMarker) {
      map.removeLayer(savedMarker);
    }

    // Add a marker for the saved location
    savedMarker = L.marker(pos)
      .addTo(map)
      .bindPopup("Saved Location")
      .openPopup();

    savedMarker._icon.classList.add("huechange");

    setTimeout(() => {
      savedMarker.closePopup();
    }, 1400);
    // Center the map to the saved location
    map.setView(pos, 13);
  } else {
    alert("No location has been saved yet.");
  }
}

// Event listeners for buttons
document
  .getElementById("saveLocation")
  .addEventListener("click", saveCurrentLocation);
document
  .getElementById("showSavedLocation")
  .addEventListener("click", showSavedLocation);

// Initialize the map when the window loads
window.onload = initMap;
