let selectedAirport = "NBO";

// Map airport codes to flight prefixes & locations
const airportPrefixes = {
  "NBO": {prefix: ["KQ"], coords:[-1.286389,36.817223]},
  "DXB": {prefix: ["EK"], coords:[25.2532,55.3657]},
  "DOH": {prefix: ["QR"], coords:[25.2736,51.6081]},
  "AUH": {prefix: ["EY"], coords:[24.4333,54.6519]}
};

// Initialize Leaflet map
let map = L.map('map').setView(airportPrefixes[selectedAirport].coords, 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19}).addTo(map);

// Switch airport tab
function setAirport(code, el){
  selectedAirport = code;
  document.querySelectorAll(".tab").forEach(tab=>tab.classList.remove("active"));
  el.classList.add("active");

  map.setView(airportPrefixes[selectedAirport].coords,5);
  loadFlights();
}

// Simulated flight board
async function loadFlights(){
  let result = document.getElementById("result");
  result.innerHTML = "Loading flight board...";

  try {
    const routes = ["NBO-DXB","DXB-DOH","DOH-AUH","AUH-NBO"];
    const statuses = ["ON TIME","DELAYED","CANCELLED"];
    let flights=[];

    for(let i=0;i<15;i++){
      let route = routes[Math.floor(Math.random()*routes.length)];
      let status = statuses[Math.floor(Math.random()*statuses.length)];
      let color = status==="CANCELLED"?"red":(status==="DELAYED"?"orange":"green");
      flights.push({callsign: airportPrefixes[selectedAirport].prefix[0]+(100+i), route, status, color});
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
  } catch(e){
    console.error(e);
    result.innerHTML="Error loading flights.";
  }
}

// Search function
function searchFlights(){
  let input = document.getElementById("searchInput").value.trim().toUpperCase();
  if(!input){loadFlights();return;}
  selectedAirport = ["NBO","DXB","DOH","AUH"].includes(input)?input:selectedAirport;
  loadFlights();
}

// Travel Advisory
function saveAdvisory(){
  let text = document.getElementById("advisoryInput").value;
  let level = document.getElementById("riskLevel").value;
  let advisory = `${level}: ${text}`;
  localStorage.setItem("advisory",advisory);
  document.getElementById("savedAdvisory").innerText=advisory;
}

function loadAdvisories(){
  let saved = localStorage.getItem("advisory");
  document.getElementById("savedAdvisory").innerText=saved?saved:"No current advisory.";
}

// Auto refresh
setInterval(loadFlights,60000);

window.onload = function(){
  loadFlights();
  loadAdvisories();
};
