let selectedAirport = "NBO";
const aviationKey = "22874e1a15c5530668869c9c44b7f337";

// Switch airport tabs
function setAirport(code, el){
  selectedAirport = code;
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  el.classList.add("active");
  loadFlights();
}

// Load flights from AviationStack + OpenSky fallback
async function loadFlights(){
  const result = document.getElementById("result");
  result.innerHTML = "Loading flight board...";

  let flights = [];

  // Step 1: AviationStack
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
               f.flight_status.toLowerCase().includes("delay")?"orange":"green"
      }));
    }
  }catch(err){ console.error("AviationStack error:", err); }

  // Step 2: OpenSky fallback for NBO if too few flights
  if(selectedAirport==="NBO" && flights.length < 50){
    try{
      let osRes = await fetch("https://cors-anywhere.herokuapp.com/https://opensky-network.org/api/states/all");
      let osData = await osRes.json();
      if(osData.states){
        let nboFlights = osData.states
          .filter(f => f[2]==="Kenya") // approximate NBO
          .map(f => ({
            callsign: f[1] || "N/A",
            from: "NBO",
            to: "Unknown",
            status: "Scheduled",
            color: "green"
          }));
        flights = flights.concat(nboFlights);
      }
    }catch(err){ console.error("OpenSky error:", err); }
  }

  if(flights.length===0){
    result.innerHTML = "No flights found for " + selectedAirport;
    return;
  }

  // Display flights
  let html = `<h3>🛫 Flights from ${selectedAirport}</h3><div class="grid">`;
  flights.forEach(f=>{
    html += `
      <div class="card status-${f.color}">
        <h4>✈ ${f.callsign}</h4>
        <p><b>Route:</b> ${f.from}-${f.to}</p>
        <p><b>Status:</b> <span style="color:${f.color}">${f.status}</span></p>
      </div>
    `;
  });
  html += "</div>";
  result.innerHTML = html;
}

// Search flights (filter after fetching)
function searchFlights(){
  const input = document.getElementById("searchInput").value.trim().toUpperCase();
  if(!input){loadFlights(); return;}
  loadFlights();
}

// Load default flights on page load
window.onload = loadFlights;
