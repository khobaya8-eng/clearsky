let selectedAirport = "NBO";
const aviationKey = "22874e1a15c5530668869c9c44b7f337"; // Your AviationStack key

// Airport coordinates
const airportCoords = {
  "NBO":[-1.286389,36.817223],
  "DXB":[25.2532,55.3657],
  "DOH":[25.2736,51.6081],
  "AUH":[24.4333,54.6519]
};

// Initialize Leaflet map
let map = L.map('map').setView(airportCoords[selectedAirport], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Switch airport tabs
function setAirport(code, el){
  selectedAirport = code;
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  el.classList.add("active");
  map.setView(airportCoords[selectedAirport],5);
  loadFlights();
}

// Load flights combining AviationStack (scheduled) + OpenSky (live positions)
async function loadFlights(){
  const result = document.getElementById("result");
  result.innerHTML = "Loading flight board...";

  try {
    let flights = [];

    // 1️⃣ Fetch scheduled departures from AviationStack
    let avUrl = `https://api.aviationstack.com/v1/flights?access_key=${aviationKey}&dep_iata=${selectedAirport}`;
    let avRes = await fetch(avUrl);
    let avData = await avRes.json();
    if(avData.data) flights = avData.data.map(f=>({
      callsign: f.flight.iata || "N/A",
      from: f.departure.iata || selectedAirport,
      to: f.arrival.iata || "Unknown",
      status: f.flight_status || "Scheduled",
      color: f.flight_status.toLowerCase().includes("cancel")?"red":
             f.flight_status.toLowerCase().includes("delay")?"orange":"green"
    }));

    // 2️⃣ Fetch live positions from OpenSky (positions only)
    let osRes = await fetch("https://cors-anywhere.herokuapp.com/https://opensky-network.org/api/states/all");
    let osData = await osRes.json();
    if(osData.states){
      osData.states.forEach(s=>{
        // Filter departures from selected airport
        if(s[2] && s[2].toUpperCase()===selectedAirport){
          flights.push({
            callsign: s[1] || "N/A",
            from: selectedAirport,
            to: s[3] || "Unknown",
            status: "Airborne",
            color: "blue"
          });
        }
      });
    }

    if(flights.length===0){
      result.innerHTML = "No flights found for " + selectedAirport;
      return;
    }

    // Display flights
    let html = `<h3>🛫 Flights from ${selectedAirport}</h3><div class="grid">`;
    flights.forEach(f=>{
      html += `
        <div class="card" style="border-left:5px solid ${f.color}">
          <h4>✈ ${f.callsign}</h4>
          <p><b>From:</b> ${f.from}</p>
          <p><b>To:</b> ${f.to}</p>
          <p style="color:${f.color}"><b>${f.status}</b></p>
        </div>
      `;
    });
    html += "</div>";
    result.innerHTML = html;

  } catch(err){
    console.error(err);
    result.innerHTML = "Error loading flights.";
  }
}

// Search flights
function searchFlights(){
  const input = document.getElementById("searchInput").value.trim().toUpperCase();
  if(!input){loadFlights(); return;}
  selectedAirport = ["NBO","DXB","DOH","AUH"].includes(input)?input:selectedAirport;
  loadFlights();
}

// GCC Travel Advisories (TravelRisk API)
async function loadGccAdvisories(){
  const gccCodes = ["ARE","QAT","SAU","BHR","OMN","KWT"];
  let advisoryBox = document.getElementById("savedAdvisory");
  advisoryBox.innerHTML = "Loading travel advisories...";

  let updates = [];
  for(let code of gccCodes){
    try{
      let res = await fetch(`https://api.travelriskapi.com/v1/countries/${code}`,{
        headers: {"X-API-Key": aviationKey}
      });
      let data = await res.json();
      updates.push(`${data.name} — Level ${data.advisory_level}: ${data.advisory_description}`);
    } catch(e){
      console.error(e);
      updates.push(`${code}: Unable to load advisory`);
    }
  }
  advisoryBox.innerHTML = updates.join("<br>");
}

// Auto-refresh every 60 seconds
setInterval(loadFlights,60000);

window.onload = function(){
  loadFlights();
  loadGccAdvisories();
};
