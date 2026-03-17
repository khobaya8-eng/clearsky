let selectedAirport = "NBO";
const apiKey = "trk_f8a1ee3fa2641f4bb33be0c956d51711";

// Airport coordinates
const airportCoords = {
  "NBO":[-1.286389,36.817223],
  "DXB":[25.2532,55.3657],
  "DOH":[25.2736,51.6081],
  "AUH":[24.4333,54.6519]
};

// Initialize Leaflet map
let map = L.map('map').setView(airportCoords[selectedAirport], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19}).addTo(map);

// Switch airport tabs
function setAirport(code, el){
  selectedAirport = code;
  document.querySelectorAll(".tab").forEach(tab=>tab.classList.remove("active"));
  el.classList.add("active");
  map.setView(airportCoords[selectedAirport],5);
  loadFlights();
}

// Load flights
async function loadFlights(){
  let result = document.getElementById("result");
  result.innerHTML = "Loading flight board...";

  try {
    let flights = [];

    if(selectedAirport === "NBO"){
      const now = Math.floor(Date.now()/1000);
      const twelveHoursAgo = now - 3600*12;

      const response = await fetch(
        `https://opensky-network.org/api/flights/departure?airport=HKJK&begin=${twelveHoursAgo}&end=${now}`
      );

      flights = await response.json();

      if(flights.length === 0){
        result.innerHTML = "No departures found at NBO in the last 12 hours.";
        return;
      }

      let html = `<h3>🛫 Departures - NBO (All Airlines)</h3><div class="grid">`;
      flights.forEach(f=>{
        let callsign = f.callsign || "N/A";
        let route = f.estArrivalAirport ? `${f.estDepartureAirport}-${f.estArrivalAirport}` : `${f.estDepartureAirport}-Unknown`;
        let status = f.canceled ? "CANCELLED" : "Scheduled";
        let color = f.canceled ? "red" : "green";

        html += `
          <div class="card" style="border-left:5px solid ${color}">
            <h4>✈ ${callsign}</h4>
            <p><b>Route:</b> ${route}</p>
            <p style="color:${color}"><b>${status}</b></p>
          </div>
        `;
      });
      html += "</div>";
      result.innerHTML = html;

    } else {
      // Simulated flights for other airports
      const routes = ["DXB-DOH","DOH-AUH","AUH-NBO"];
      const statuses = ["ON TIME","DELAYED","CANCELLED"];
      for(let i=0;i<20;i++){
        let route = routes[Math.floor(Math.random()*routes.length)];
        let status = statuses[Math.floor(Math.random()*statuses.length)];
        let color = status==="CANCELLED"?"red":(status==="DELAYED"?"orange":"green");
        flights.push({callsign: selectedAirport+(100+i), route, status, color});
      }

      let html=`<h3>🛫 Flights - ${selectedAirport}</h3><div class="grid">`;
      flights.forEach(f=>{
        html+=`
          <div class="card" style="border-left:5px solid ${f.color}">
            <h4>✈ ${f.callsign}</h4>
            <p><b>Route:</b> ${f.route}</p>
            <p style="color:${f.color}"><b>${f.status}</b></p>
          </div>
        `;
      });
      html+="</div>";
      result.innerHTML=html;
    }

  } catch(e){
    console.error(e);
    result.innerHTML="Error loading flights.";
  }
}

// Search flights
function searchFlights(){
  let input = document.getElementById("searchInput").value.trim().toUpperCase();
  if(!input){loadFlights();return;}
  selectedAirport = ["NBO","DXB","DOH","AUH"].includes(input)?input:selectedAirport;
  loadFlights();
}

// Load GCC travel advisories
async function loadGccAdvisories(){
  const gccCodes = ["ARE","QAT","SAU","BHR","OMN","KWT"];
  let advisoryBox = document.getElementById("savedAdvisory");
  advisoryBox.innerHTML = "Loading travel advisories...";

  let updates = [];
  for(let code of gccCodes){
    try{
      let res = await fetch(`https://api.travelriskapi.com/v1/countries/${code}`,{
        headers: {"X-API-Key": apiKey}
      });
      let data = await res.json();
      updates.push(`🇨🇦 ${data.name} — Level ${data.advisory_level}: ${data.advisory_description}`);
    } catch(err){
      console.error(err);
      updates.push(`${code}: Unable to load advisory`);
    }
  }

  advisoryBox.innerHTML = updates.join("<br>");
}

// Auto-refresh every 60s
setInterval(loadFlights,60000);

window.onload = function(){
  loadFlights();
  loadGccAdvisories();
};
