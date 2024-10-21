// app.js

// Initialize variables
let map;
let currentMarker = null;
let savedMarker = null;
let savedCoordinates = null;
let watchId = null;

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

    // Try to get the user's current location and watch for updates
    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        };
        
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const pos = [position.coords.latitude, position.coords.longitude];
                map.setView(pos, 13);

                // If a marker already exists, update its position, else create one
                if (currentMarker) {
                    currentMarker.setLatLng(pos);
                } else {
                    currentMarker = L.marker(pos)
                        .addTo(map)
                        .bindPopup("Your Current Location")
                        .openPopup();
                }
            },
            () => {
                handleLocationError(true);
            },
            options
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
        savedMarker = new L.marker(pos)
            .addTo(map)
            .bindPopup("Saved Location")
            .openPopup();

        savedMarker._icon.classList.add('huechange');

        // Center the map to the saved location
        map.setView(pos, 13);
    } else {
        alert("No location has been saved yet.");
    }
}

// Event listeners for buttons
document.getElementById("saveLocation").addEventListener("click", saveCurrentLocation);
document.getElementById("showSavedLocation").addEventListener("click", showSavedLocation);

// Initialize the map when the window loads
window.onload = initMap;
