let selectedAirport = "NBO";
const aviationKey = "22874e1a15c5530668869c9c44b7f337";

// Airlines for Nairobi international departures
const intlAirlines = ["KQ","EK","QR","EY","FZ"];

// Switch airport tabs
function setAirport(code, el){
  selectedAirport = code;
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  el.classList.add("active");
  loadFlights();
}

// Load flights from AviationStack
async function loadFlights(){
  const result = document.getElementById("result");
  result.innerHTML = "Loading flight board...";

  try{
    let flights = [];
    let url = `https://api.aviationstack.com/v1/flights?access_key=${aviationKey}&dep_iata=${selectedAirport}`;
    let res = await fetch(url);
    let data = await res.json();

    if(data.data){
      // Filter for NBO international airlines only if NBO
      flights = data.data
        .filter(f => selectedAirport !== "NBO" || intlAirlines.includes(f.flight.iata?.slice(0,2)))
        .map(f => ({
          callsign: f.flight.iata || "N/A",
          from: f.departure.iata || selectedAirport,
          to: f.arrival.iata || "Unknown",
          status: f.flight_status || "Scheduled",
          color: f.flight_status.toLowerCase().includes("cancel")?"red":
                 f.flight_status.toLowerCase().includes("delay")?"orange":"green"
        }));
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

  }catch(err){
    console.error(err);
    result.innerHTML = "Error loading flights.";
  }
}

// Search flights
function searchFlights(){
  const input = document.getElementById("searchInput").value.trim().toUpperCase();
  if(!input){loadFlights(); return;}
  loadFlights(); // Could enhance search to filter results after fetching
}

// Load default flights on page load
window.onload = loadFlights;
