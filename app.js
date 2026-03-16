let selectedAirport = "NBO"; // Default airport

// Map airport codes to callsign prefixes (free way to filter flights)
const airportPrefixes = {
  "NBO": ["KQ"],  // Kenya Airways
  "DXB": ["EK"],  // Emirates
  "DOH": ["QR"]   // Qatar Airways
};

function setAirport(code) {
  selectedAirport = code;

  // Highlight active tab
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  event.target.classList.add("active");

  loadFlights();
}

async function loadFlights() {
  let result = document.getElementById("result");
  result.innerHTML = "Loading flights...";

  try {
    let response = await fetch("https://cors-anywhere.herokuapp.com/https://opensky-network.org/api/states/all");
    let data = await response.json();

    // Filter flights by airport prefix
    let flights = data.states.filter(flight => {
      let callsign = flight[0] || "";
      return airportPrefixes[selectedAirport].some(prefix => callsign.startsWith(prefix));
    }).slice(0, 50);

    if (flights.length === 0) {
      result.innerHTML = "No flights found for this airport.";
      return;
    }

    let html = `<h3>Flights for ${selectedAirport}</h3>`;
    flights.forEach(flight => {
      html += `
        <b>Callsign:</b> ${flight[0] || "N/A"} <br>
        <b>Country:</b> ${flight[2] || "N/A"} <br>
        <b>Altitude:</b> ${flight[7] || "N/A"} meters <br><br>
      `;
    });

    result.innerHTML = html;

  } catch (error) {
    console.error(error);
    result.innerHTML = "Error loading flight data.";
  }
}

async function searchFlights() {
  let input = document.getElementById("searchInput").value.trim().toUpperCase();
  let result = document.getElementById("result");

  if (!input) {
    result.innerHTML = "Please enter a flight number or country.";
    return;
  }

  result.innerHTML = "Searching...";

  try {
    let response = await fetch("https://cors-anywhere.herokuapp.com/https://opensky-network.org/api/states/all");
    let data = await response.json();

    // Filter flights by callsign, country, AND airport prefix
    let flights = data.states.filter(flight => {
      let callsign = (flight[0] || "").toUpperCase();
      let country = (flight[2] || "").toUpperCase();
      let airportMatch = airportPrefixes[selectedAirport].some(prefix => callsign.startsWith(prefix));
      return airportMatch && (callsign.includes(input) || country.includes(input));
    });

    if (flights.length === 0) {
      result.innerHTML = `No flights found for "${input}" at ${selectedAirport}.`;
      return;
    }

    let html = `<h3>Search Results for "${input}" at ${selectedAirport}</h3>`;
    flights.forEach(flight => {
      html += `
        <b>Callsign:</b> ${flight[0] || "N/A"} <br>
        <b>Country:</b> ${flight[2] || "N/A"} <br>
        <b>Altitude:</b> ${flight[7] || "N/A"} meters <br><br>
      `;
    });

    result.innerHTML = html;

  } catch (error) {
    console.error(error);
    result.innerHTML = "Error searching flight data.";
  }
}

// Load default airport flights on page load
window.onload = loadFlights;
