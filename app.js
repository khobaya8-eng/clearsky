let selectedAirport = "NBO";
const aviationKey = "22874e1a15c5530668869c9c44b7f337";
let flights = [];

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

    // ============================
    // 🇰🇪 NAIROBI (SPECIAL LOGIC)
    // ============================
    if (selectedAirport === "NBO") {

      try {
        // ✅ OpenSky (REAL departures using ICAO HKJK)
        let url = `https://opensky-network.org/api/flights/departure?airport=HKJK&begin=${Math.floor(Date.now()/1000)-86400}&end=${Math.floor(Date.now()/1000)}`;
        
        let res = await fetch(url);
        let data = await res.json();

        if (data && data.length > 0) {
          flights = data.map(f => ({
            callsign: f.callsign ? f.callsign.trim() : "N/A",
            from: "NBO",
            to: f.estArrivalAirport || "Unknown",
            status: "En Route",
            color: "green",
            lat: airportCoords.NBO[0],
            lon: airportCoords.NBO[1]
          }));
        } else {
          throw "No OpenSky data";
        }

      } catch (err) {
        console.log("⚠️ OpenSky failed → switching to AviationStack");

        // ✅ FALLBACK: AviationStack
        let url = `https://api.aviationstack.com/v1/flights?access_key=${aviationKey}&dep_iata=NBO`;
        
        let res = await fetch(url);
        let data = await res.json();

        if (data.data && data.data.length > 0) {
          flights = data.data.map(f => ({
            callsign: f.flight?.iata || "N/A",
            from: "NBO",
            to: f.arrival?.iata || "Unknown",
            status: f.flight_status || "Scheduled",
            color: f.flight_status?.toLowerCase().includes("cancel") ? "red" :
                   f.flight_status?.toLowerCase().includes("delay") ? "orange" : "green",
            lat: airportCoords.NBO[0],
            lon: airportCoords.NBO[1]
          }));
        }
      }

    } else {

      // ============================
      // 🌍 OTHER AIRPORTS (DXB/DOH/AUH)
      // ============================
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
          lat: airportCoords[selectedAirport][0],
          lon: airportCoords[selectedAirport][1]
        }));
      }
    }

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
    result.innerHTML = "⚠️ No flights available right now.";
    return;
  }

  result.innerHTML = `<h3>🛫 Flights from ${selectedAirport}</h3><div class="grid"></div>`;
  const grid = result.querySelector(".grid");

  // Clear map markers
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) map.removeLayer(layer);
  });

  // Add flight cards + markers
  data.forEach(f => {

    let card = document.createElement("div");
    card.className = `card status-${f.color}`;

    card.innerHTML = `
      <h4>✈ ${f.callsign}</h4>
      <p><b>Route:</b> ${f.from} → ${f.to}</p>
      <p><b>Status:</b> <span style="color:${f.color}">${f.status}</span></p>
    `;

    grid.appendChild(card);

    // Map marker
    L.marker([f.lat, f.lon]).addTo(map)
      .bindPopup(`
        ✈ ${f.callsign}<br>
        Route: ${f.from} → ${f.to}<br>
        Status: ${f.status}
      `);
  });
}

// 🔍 LIVE SEARCH
document.getElementById("searchInput").addEventListener("input", function () {
  let query = this.value.trim().toUpperCase();

  if (!query) {
    displayFlights(flights);
    return;
  }

  let filtered = flights.filter(f =>
    f.callsign.includes(query) ||
    f.to.includes(query) ||
    f.from.includes(query)
  );

  displayFlights(filtered);
});

// 🚀 LOAD ON START
window.onload = loadFlights;
