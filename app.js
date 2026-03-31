let allFlights = [];

async function loadFlights() {
    try {
        const response = await fetch('./data/flights.json');
        const flights = await response.json();

        allFlights = flights;

        displayFlights(flights);
    } catch (error) {
        console.error('Error loading flights:', error);
    }
}

function displayFlights(flights) {
    const container = document.getElementById('result');
    container.innerHTML = '';

    if (!flights || flights.length === 0) {
        container.innerHTML = "<p>No flights available</p>";
        return;
    }

    flights.forEach(flight => {
        const div = document.createElement('div');
        div.className = 'flight-card';

        div.innerHTML = `
            <h3>${flight.route}</h3>
            <p>${flight.date} | ${flight.time}</p>
            <p>Status: ${flight.status}</p>
        `;

        container.appendChild(div);
    });
}

function setAirport(code, element) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');

    const filtered = allFlights.filter(f => f.route.includes(code));
    displayFlights(filtered);
}

// search
document.addEventListener('input', function(e) {
    if (e.target.id === 'searchInput') {
        const value = e.target.value.toLowerCase();

        const filtered = allFlights.filter(f =>
            f.route.toLowerCase().includes(value)
        );

        displayFlights(filtered);
    }
});

loadFlights();
