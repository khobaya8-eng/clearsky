let allFlights = [];

// Load flights from JSON
async function loadFlights() {
    try {
        const response = await fetch('./data/flights.json');
        const flights = await response.json();

        if (!Array.isArray(flights)) {
            throw new Error("Flights data is not an array");
        }

        allFlights = flights;
        displayFlights(flights);

    } catch (error) {
        console.error('Error loading flights:', error);
        document.getElementById('result').innerHTML =
            "<p style='color:red;'>Failed to load flights</p>";
    }
}

// Display flights in cards
function displayFlights(flights) {
    const container = document.getElementById('result');
    container.innerHTML = '';

    if (flights.length === 0) {
        container.innerHTML = "<p>No flights available</p>";
        return;
    }

    flights.forEach(flight => {
        const div = document.createElement('div');
        div.className = 'card ' + getStatusClass(flight.status);

        div.innerHTML = `
            <h3>${flight.route}</h3>
            <p class="flight-info">Date: ${flight.date}</p>
            <p class="flight-info">Time: ${flight.time}</p>
            <p class="flight-info">Status: ${flight.status.toUpperCase()}</p>
        `;

        container.appendChild(div);
    });
}

// Convert status to CSS class
function getStatusClass(status) {
    switch((status || "").toLowerCase()) {
        case 'scheduled': return 'status-scheduled';
        case 'active': return 'status-active';
        case 'delayed': return 'status-delayed';
        case 'landed': return 'status-landed';
        default: return '';
    }
}

// Filter by airport tab
function setAirport(code, element) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');

    const filtered = allFlights.filter(f => f.route.includes(code));
    displayFlights(filtered);
}

// Search filter
document.getElementById('searchInput').addEventListener('input', function(e) {
    const value = e.target.value.toLowerCase();
    const filtered = allFlights.filter(f =>
        f.route.toLowerCase().includes(value)
    );
    displayFlights(filtered);
});

// Load flights on page load
loadFlights();
