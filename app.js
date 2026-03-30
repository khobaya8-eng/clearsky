let selectedAirport = "NBO";
let flights = [];

// Airports
const airportNames = {
  NBO:"Nairobi (JKIA)",
  DXB:"Dubai",
  DOH:"Doha",
  AUH:"Abu Dhabi",
  IST:"Istanbul",
  FRA:"Frankfurt",
  AMS:"Amsterdam",
  CDG:"Paris",
  LHR:"London",
  JNB:"Johannesburg"
};

const airportCoords = {
  NBO:[-1.3192,36.9278],
  DXB:[25.2532,55.3657],
  DOH:[25.2736,51.6080],
  AUH:[24.4333,54.6510],
  IST:[41.262,28.742],
  FRA:[50.0379,8.5622],
  AMS:[52.3105,4.7683],
  CDG:[49.0097,2.5479],
  LHR:[51.47,-0.45],
  JNB:[-26.1337,28.2420]
};

// Map
let map = L.map('map').setView(airportCoords[selectedAirport], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Switch airport
function setAirport(code, el){
  selectedAirport = code;
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  el.classList.add("active");
  map.setView(airportCoords[code],5);
  loadFlights();
}

// Countdown
function getCountdown(time){
  const diff = new Date(time) - new Date();
  if(diff<=0) return "Departed";
  const mins = Math.floor(diff/60000);
  const hrs = Math.floor(mins/60);
  return hrs>0 ? `${hrs}h ${mins%60}m` : `${mins}m`;
}

// Load flights
async function loadFlights(){
  const result = document.getElementById("result");
  result.innerHTML = "Loading...";
  flights = [];

  try{
    let res = await fetch("./data/flights.json");
    let data = await res.json();

    if(data.error){
      result.innerHTML="⚠️ API limit reached. Try later.";
      return;
    }

    flights = data.data.map(f=>{
      const dest = f.arrival?.iata || "Unknown";
      const coords = airportCoords[dest] || airportCoords[selectedAirport];

      return {
        callsign: f.flight?.iata || "N/A",
        airline: f.airline?.name || "Unknown Airline",
        to: dest,
        status: f.flight_status || "scheduled",
        dep: f.departure?.scheduled,
        arr: f.arrival?.scheduled,
        lat: coords[0],
        lon: coords[1]
      };
    });

  }catch(err){
    result.innerHTML="❌ Error loading flights.";
    return;
  }

  displayFlights(flights);
}

// Display
function displayFlights(data){
  const result = document.getElementById("result");
  result.innerHTML=`<div class="grid"></div>`;
  const grid = result.querySelector(".grid");

  map.eachLayer(layer=>{
    if(layer instanceof L.Marker || layer instanceof L.Polyline) map.removeLayer(layer);
  });

  data.forEach((f,i)=>{
    let card=document.createElement("div");
    card.className="card";

    card.innerHTML=`
      <h4>✈ ${f.callsign}</h4>
      <p>${f.airline}</p>
      <p>${airportNames[selectedAirport]} → ${airportNames[f.to]||f.to}</p>
      <div class="details" id="d${i}">
        <p>Status: ${f.status}</p>
        <p>Departure: ${f.dep || "N/A"}</p>
      </div>
    `;

    card.onclick=()=>document.getElementById(`d${i}`).classList.toggle("show");

    grid.appendChild(card);

    let from = airportCoords[selectedAirport];

    // Marker
    L.marker([f.lat,f.lon]).addTo(map);

    // ✈️ ROUTE LINE
    L.polyline([from,[f.lat,f.lon]]).addTo(map);
  });
}

// Search
document.getElementById("searchInput").addEventListener("input",function(){
  let q=this.value.toUpperCase();
  displayFlights(flights.filter(f=>f.callsign.includes(q)||f.to.includes(q)));
});

window.onload=loadFlights;
