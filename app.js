let selectedAirport = "NBO";
const aviationKey = "22874e1a15c5530668869c9c44b7f337";
let flights = []; // for instant search

// Initialize map
let map = L.map('map').setView([1.2921, 36.8219], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const airportCoords = {
  NBO: [1.2921, 36.8219],
  DXB: [25.2532, 55.3657],
  DOH: [25.2736, 51.6080],
  AUH: [24.4333, 54.6510]
};

function setAirport(code, el){
  selectedAirport = code;
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  el.classList.add("active");
  loadFlights();
  map.setView(airportCoords[code], 5);
}

// Load flights
async function loadFlights(){
  const result = document.getElementById("result");
  result.innerHTML = "Loading flight board...";
  flights = [];

  // AviationStack API
  try{
    let url = `https://api.aviationstack.com/v1/flights?access_key=${aviationKey}&dep_iata=${selectedAirport}`;
    let res = await fetch(url);
    let data = await res.json();
    if(data.data){
      flights = data.data.map(f => ({
        callsign: f.flight.iata || "N/A",
        from: f.departure.iata || selectedAirport,
        to: f.arrival.iata || "Unknown",
        status: f.flight_status || "Scheduled",
        color: f.flight_status.toLowerCase().includes("cancel")?"red":
               f.flight_status.toLowerCase().includes("delay")?"orange":"green",
        lat: f.departure.latitude || airportCoords[selectedAirport][0],
        lon: f.departure.longitude || airportCoords[selectedAirport][1]
      }));
    }
  }catch(err){ console.error(err); }

  displayFlights(flights);
}

// Display flights + map markers
function displayFlights(data){
  const result = document.getElementById("result");
  result.innerHTML = `<h3>🛫 Flights from ${selectedAirport}</h3><div class="grid"></div>`;
  const grid = result.querySelector(".grid");

  map.eachLayer(layer => { if(layer instanceof L.Marker) map.removeLayer(layer); });

  data.forEach(f=>{
    let card = document.createElement("div");
    card.className = `card status-${f.color}`;
    card.innerHTML = `
      <h4>✈ ${f.callsign}</h4>
      <p><b>Route:</b> ${f.from}-${f.to}</p>
      <p><b>Status:</b> <span style="color:${f.color}">${f.status}</span></p>
    `;
    grid.appendChild(card);

    L.marker([f.lat, f.lon]).addTo(map)
      .bindPopup(`✈ ${f.callsign}<br>Route: ${f.from}-${f.to}<br>Status: ${f.status}`);
  });
}

// Instant search
document.getElementById("searchInput").addEventListener("input", function(){
  let query = this.value.trim().toUpperCase();
  if(!query){ displayFlights(flights); return; }
  let filtered = flights.filter(f => f.callsign.includes(query) || f.to.includes(query) || f.from.includes(query));
  displayFlights(filtered);
});

// Load default on page load
window.onload = loadFlights;
