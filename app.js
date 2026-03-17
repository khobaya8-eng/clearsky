let selectedAirport = "NBO";

const airportPrefixes = {
  "NBO": ["KQ"],
  "DXB": ["EK"],
  "DOH": ["QR"],
  "AUH": ["EY"]
};

function setAirport(code, el) {
  selectedAirport = code;

  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  el.classList.add("active");

  loadFlights();
}

// ✅ CLEAN API (NO CORS PROXY)
const API_URL = "https://opensky-network.org/api/states/all";

async function loadFlights() {
  let result = document.getElementById("result");
  result.innerHTML = "Loading flights...";

  try {
    let response = await fetch(API_URL);
    let data = await response.json();

    let flights = data.states.filter(flight => {
      let callsign = (flight[0] || "").trim();
      return airportPrefixes[selectedAirport].some(prefix => callsign.startsWith(prefix));
    }).slice(0, 20);

    if (flights.length === 0) {
      result.innerHTML = "No flights found.";
      return;
    }

    let html = `<h3>${selectedAirport} Flights</h3><div class="grid">`;

    flights.forEach(flight => {
      let status = flight[7] > 0 ? "In Air" : "On Ground";

      html += `
        <div class="card">
          <h4>✈ ${flight[0] || "N/A"}</h4>
          <p><b>Country:</b> ${flight[2]}</p>
          <p><b>Status:</b> ${status}</p>
          <p><b>Altitude:</b> ${flight[7] || "0"} m</p>
        </div>
      `;
    });

    html += "</div>";
    result.innerHTML = html;

  } catch (error) {
    console.error(error);
    result.innerHTML = "Error loading flights.";
  }
}

async function searchFlights() {
  let input = document.getElementById("searchInput").value.trim().toUpperCase();
  let result = document.getElementById("result");

  if (!input) {
    result.innerHTML = "Enter airport code or flight.";
    return;
  }

  if (["NBO","DXB","DOH","AUH"].includes(input)) {
    selectedAirport = input;
    loadFlights();
    return;
  }

  result.innerHTML = "Searching...";

  try {
    let response = await fetch(API_URL);
    let data = await response.json();

    let flights = data.states.filter(flight => {
      let callsign = (flight[0] || "").toUpperCase();
      return callsign.includes(input);
    }).slice(0, 20);

    if (flights.length === 0) {
      result.innerHTML = "No flights found.";
      return;
    }

    let html = `<h3>Search Results</h3><div class="grid">`;

    flights.forEach(flight => {
      html += `
        <div class="card">
          <h4>✈ ${flight[0]}</h4>
          <p><b>Country:</b> ${flight[2]}</p>
          <p><b>Altitude:</b> ${flight[7]}</p>
        </div>
      `;
    });

    html += "</div>";
    result.innerHTML = html;

  } catch (error) {
    result.innerHTML = "Error searching flights.";
  }
}

/* MAP */
let map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
  .addTo(map);

async function loadMapFlights() {
  try {
    let response = await fetch(API_URL);
    let data = await response.json();

    data.states.slice(0, 40).forEach(flight => {
      let lat = flight[6];
      let lon = flight[5];

      if (lat && lon) {
        L.marker([lat, lon])
          .addTo(map)
          .bindPopup(`✈ ${flight[0]}`);
      }
    });

  } catch (error) {
    console.log("Map error");
  }
}

/* ADVISORY */
function saveAdvisory() {
  let text = document.getElementById("advisoryInput").value;
  let level = document.getElementById("riskLevel").value;

  let advisory = `${level}: ${text}`;
  localStorage.setItem("advisory", advisory);

  document.getElementById("savedAdvisory").innerText = advisory;
}

/* LOAD */
window.onload = function() {
  loadFlights();
  loadMapFlights();

  let saved = localStorage.getItem("advisory");
  if (saved) {
    document.getElementById("savedAdvisory").innerText = saved;
  }
};
