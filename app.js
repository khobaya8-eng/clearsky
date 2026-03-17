let selectedAirport = "NBO";

const airportPrefixes = {
  "NBO": ["KQ"],
  "DXB": ["EK"],
  "DOH": ["QR"],
  "AUH": ["EY"]
};

// Select airport tab
function setAirport(code, el) {
  selectedAirport = code;
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  el.classList.add("active");
  loadFlights();
}

// API endpoint
const API_URL = "https://opensky-network.org/api/states/all";

// Load flight board
async function loadFlights() {
  let result = document.getElementById("result");
  result.innerHTML = "Loading flight board...";

  try {
    let response = await fetch(API_URL);
    let data = await response.json();

    let flights = data.states.slice(0, 40);

    let html = `<h3>🛫 Live Flight Board</h3><div class="grid">`;

    flights.forEach(flight => {
      let callsign = (flight[0] || "UNKNOWN").trim();
      let country = flight[2] || "N/A";

      // Simulated routes
      let route = ["NBO-DXB", "DXB-DOH", "DOH-AUH", "AUH-NBO"];
      let randomRoute = route[Math.floor(Math.random() * route.length)];

      // Simulated status
      let statuses = ["ON TIME", "DELAYED", "CANCELLED"];
      let status = statuses[Math.floor(Math.random() * statuses.length)];

      let color = status === "CANCELLED" ? "red" :
                  status === "DELAYED" ? "orange" : "green";

      html += `
        <div class="card" style="border-left: 5px solid ${color}">
          <h4>✈ ${callsign}</h4>
          <p><b>Route:</b> ${randomRoute}</p>
          <p><b>Country:</b> ${country}</p>
          <p style="color:${color};"><b>${status}</b></p>
        </div>
      `;
    });

    html += "</div>";
    result.innerHTML = html;

  } catch (error) {
    console.error(error);
    result.innerHTML = "Error loading flight board.";
  }
}

// Search flights
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

// Leaflet map
let map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

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

// Travel advisory
function saveAdvisory() {
  let text = document.getElementById("advisoryInput").value;
  let level = document.getElementById("riskLevel").value;

  let advisory = `${level}: ${text}`;
  localStorage.setItem("advisory", advisory);
  document.getElementById("savedAdvisory").innerText = advisory;
}

function loadAdvisories() {
  let advisoryBox = document.getElementById("savedAdvisory");
  let saved = localStorage.getItem("advisory");
  advisoryBox.innerHTML = saved ? saved : "No current advisory.";
}

// Auto-refresh flight board every 60 sec
setInterval(loadFlights, 60000);

// Initial load
window.onload = function() {
  loadFlights();
  loadMapFlights();
  loadAdvisories();
};
