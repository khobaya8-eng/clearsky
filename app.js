let selectedAirport = "NBO";
let flights = [];

// 🌍 Airport full names
const airportNames = {
  NBO: "Nairobi (JKIA)",
  DXB: "Dubai International",
  DOH: "Doha Hamad",
  AUH: "Abu Dhabi International",
  IST: "Istanbul Airport",
  FRA: "Frankfurt Airport"
};

// 🌍 Map Setup
let map = L.map('map').setView([1.2921, 36.8219], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Airport coordinates
const airportCoords = {
  NBO: [1.2921, 36.8219],
  DXB: [25.2532, 55.3657],
  DOH: [25.2736, 51.6080],
  AUH: [24.4333, 54.6510]
};

// 🔁 Switch Tabs
function setAirport(code, el) {
  selectedAirport = code;

  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");

  map.setView(airportCoords[code], 5);
  loadFlights();
}

// ⏳ Countdown function
function getCountdown(time) {
  const now = new Date();
  const diff = new Date(time) - now;

  if (diff <= 0) return "Departed";

  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);

  return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
}

// ✈️ LOAD FLIGHTS (UPDATED TO USE GITHUB BACKEND)
async function loadFlights() {
  const result = document.getElementById("result");
  result.innerHTML = "Loading flight board...";
  flights = [];

  try {
    let res = await fetch("data/flights.json");

    if (!res.ok) {
      throw new Error("Failed to fetch flight data");
    }

    let data = await res.json();

    if (!data || !data.data || data.data.length === 0) {
      result.innerHTML = "⚠️ No flights available.";
      return;
    }

    // Filter flights by selected airport
    const filteredFlights = data.data.filter(f =>
      f.departure?.iata === selectedAirport
    );

    if (filteredFlights.length === 0) {
      result.innerHTML = "⚠️ No flights found for this airport.";
      return;
    }

    flights = filteredFlights.map(f => {

      const depRaw = f.departure?.estimated || f.departure?.scheduled;
      const arrRaw = f.arrival?.estimated || f.arrival?.scheduled;

      const depTimeFormatted = depRaw
        ? new Date(depRaw).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "N/A";

      const arrTimeFormatted = arrRaw
        ? new Date(arrRaw).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "N/A";

      const statusRaw = f.flight_status || "scheduled";

      const status = statusRaw.toUpperCase();

      const color =
        statusRaw.includes("cancel") ? "red" :
        statusRaw.includes("delay") ? "orange" :
        statusRaw.includes("active") ? "green" :
        "green";

      return {
        callsign: f.flight?.iata || "N/A",
        from: selectedAirport,
        to: f.arrival?.iata || "Unknown",

        status: status,
        color: color,

        depTime: depTimeFormatted,
        arrTime: arrTimeFormatted,

        date: depRaw
          ? new Date(depRaw).toLocaleDateString()
          : "N/A",

        countdown: depRaw ? getCountdown(depRaw) : "N/A",

        lat: airportCoords[selectedAirport][0],
        lon: airportCoords[selectedAirport][1]
      };
    });

  } catch (error) {
    console.error(error);
    result.innerHTML = "❌ Error loading flights.";
    return;
  }

  displayFlights(flights);
}

// 📊 Display Flights
function displayFlights(data) {
  const result = document.getElementById("result");

  if (!data || data.length === 0) {
    result.innerHTML = "⚠️ No flights available.";
    return;
  }

  result.innerHTML = `<h3>🛫 Flights from ${airportNames[selectedAirport]}</h3><div class="grid"></div>`;
  const grid = result.querySelector(".grid");

  // Clear markers
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) map.removeLayer(layer);
  });

  data.forEach((f, index) => {

    let card = document.createElement("div");
    card.className = `card status-${f.color}`;

    card.innerHTML = `
      <h4>✈ ${f.callsign}</h4>
      <p><b>Route:</b> ${airportNames[f.from]} → ${airportNames[f.to] || f.to}</p>

      <p><b>Status:</b> 
        <span style="color:${f.color}; font-weight:bold;">
          ${f.status}
        </span>
      </p>

      <div class="details" id="details-${index}">
        <p>📅 ${f.date}</p>
        <p>🕒 ${f.depTime} → ${f.arrTime}</p>
        <p>⏳ Departs in: ${f.countdown}</p>
      </div>
    `;

    card.onclick = () => {
      document.getElementById(`details-${index}`).classList.toggle("show");
    };

    grid.appendChild(card);

    L.marker([f.lat, f.lon]).addTo(map)
      .bindPopup(`
        ✈ ${f.callsign}<br>
        ${airportNames[f.from]} → ${airportNames[f.to] || f.to}<br>
        ${f.depTime} → ${f.arrTime}<br>
        ⏳ ${f.countdown}
      `);
  });
}

// 🔍 SEARCH
document.getElementById("searchInput").addEventListener("input", function () {
  let query = this.value.trim().toUpperCase();

  if (!query) return displayFlights(flights);

  let filtered = flights.filter(f =>
    f.callsign.includes(query) ||
    f.to.includes(query)
  );

  displayFlights(filtered);
});

// 🚀 LOAD
window.onload = loadFlights;
