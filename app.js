// app.js

// Initialize variables
let map;
let currentMarker = null;
let savedMarker = null;
let savedCoordinates = null;

// Initialize and add the map
function initMap() {
    // Default location (if geolocation fails)
    const defaultLocation = [37.7749, -122.4194]; // San Francisco

    // Create the map centered at the default location
    map = L.map('map').setView(defaultLocation, 13);

    // Set up the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 26,
    }).addTo(map);

    // Try to get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = [position.coords.latitude, position.coords.longitude];
                map.setView(pos, 13);

                // Add a marker at the user's location
                currentMarker = L.marker(pos)
                    .addTo(map)
                    .bindPopup("Your Current Location")
                    .openPopup();
            },
            () => {
                handleLocationError(true);
            }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false);
    }

    // Load saved coordinates from localStorage if available
    const saved = localStorage.getItem("savedCoordinates");
    if (saved) {
        savedCoordinates = JSON.parse(saved);
        showSavedLocation();
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
        savedMarker = L.marker(pos, { icon: blueIcon })
            .addTo(map)
            .bindPopup("Saved Location")
            .openPopup();

        // Center the map to the saved location
        map.setView(pos, 13);
    } else {
        alert("No location has been saved yet.");
    }
}

// Define a blue icon for the saved location marker
const blueIcon = L.Icon({
    iconUrl: 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=S|0000FF|FFFFFF',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [21, 34],
    iconAnchor: [10, 34],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    shadowAnchor: [4, 62]
});

// Event listeners for buttons
document.getElementById("saveLocation").addEventListener("click", saveCurrentLocation);
document.getElementById("showSavedLocation").addEventListener("click", showSavedLocation);

// Initialize the map when the window loads
window.onload = initMap;
