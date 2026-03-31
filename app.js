async function loadFlights() {
    try {
        const response = await fetch('./data/flights.json'); // correct path
        const flights = await response.json();

        console.log("Flights loaded:", flights); // DEBUG

        displayFlights(flights);
    } catch (error) {
        console.error('Error loading flights:', error);
    }
}

function displayFlights(flights) {
    const container = document.getElementById('flights-container');

    if (!container) {
        console.error("Missing flights-container div");
        return;
    }

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
            <p>Date: ${flight.date}</p>
            <p>Time: ${flight.time}</p>
            <p>Status: ${flight.status}</p>
        `;

        container.appendChild(div);
    });
}

loadFlights();
