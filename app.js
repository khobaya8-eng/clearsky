let selectedAirport = "NBO";
const aviationKey = "22874e1a15c5530668869c9c44b7f337";
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

// ✈️ Load Flights
async function loadFlights() {
  const result = document.getElementById("result");
  result.innerHTML = "Loading flight board...";
  flights = [];

  try {
    let url = `https://api.aviationstack.com/v1/flights?access_key=${aviationKey}&dep_iata=${selectedAirport}`;
    let res = await fetch(url);
    let data = await res.json();

    if (data.data && data.data.length > 0) {
      flights = data.data.map(f => ({
        callsign: f.flight?.iata || "N/A",
        from: selectedAirport,
        to: f.arrival?.iata || "Unknown",
        status: f.flight_status || "Scheduled",
        color: f.flight_status?.toLowerCase().includes("cancel") ? "red" :
               f.flight_status?.toLowerCase().includes("delay") ? "orange" : "green",
        depTime: f.departure?.scheduled ? new Date(f.departure.scheduled).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A",
        arrTime: f.arrival?.scheduled ? new Date(f.arrival.scheduled).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A",
        date: f.departure?.scheduled ? new Date(f.departure.scheduled).toLocaleDateString() : "N/A",
        lat: airportCoords[selectedAirport][0],
        lon: airportCoords[selectedAirport][1]
      }));
    }

  } catch (error) {
    console.error(error);
    result.innerHTML = "❌ Error loading flights.";
    return;
  }

  displayFlights(flights);
}

// 📊 Display Flights (WITH EXPAND FEATURE)
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
      <p><b>Status:</b> <span style="color:${f.color}">${f.status}</span></p>

      <div class="details" id="details-${index}">
        <p>📅 ${f.date}</p>
        <p>🕒 ${f.depTime} → ${f.arrTime}</p>
      </div>
    `;

    card.onclick = () => {
      let d = document.getElementById(`details-${index}`);
      d.classList.toggle("show");
    };

    grid.appendChild(card);

    L.marker([f.lat, f.lon]).addTo(map)
      .bindPopup(`
        ✈ ${f.callsign}<br>
        ${airportNames[f.from]} → ${airportNames[f.to] || f.to}<br>
        ${f.depTime} → ${f.arrTime}
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
