let selectedAirport = "NBO";

const airportPrefixes = {
  "NBO": ["KQ"],
  "DXB": ["EK"],
  "DOH": ["QR"],
  "AUH": ["EY"]
};

// Select airport tab
function setAirport(code, el) {
  selectedAirport = code;
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  el.classList.add("active");
  loadFlights();
}

// Simulated flight board
async function loadFlights() {
  let result = document.getElementById("result");
  result.innerHTML = "Loading flight board...";

  try {
    // Simulate flight data
    const routes = ["NBO-DXB", "DXB-DOH", "DOH-AUH", "AUH-NBO"];
    const statuses = ["ON TIME", "DELAYED", "CANCELLED"];
    let flights = [];

    for(let i=0;i<20;i++){
      let route = routes[Math.floor(Math.random()*routes.length)];
      let status = statuses[Math.floor(Math.random()*statuses.length)];
      let color = status === "CANCELLED" ? "red" : (status==="DELAYED" ? "orange" : "green");
      flights.push({callsign: airportPrefixes[selectedAirport][0]+(100+i), route, status, color});
    }

    let html = `<h3>🛫 Live Flights - ${selectedAirport}</h3><div class="grid">`;

    flights.forEach(flight => {
      html += `
        <div class="card" style="border-left: 5px solid ${flight.color}">
          <h4>✈ ${flight.callsign}</h4>
          <p><b>Route:</b> ${flight.route}</p>
          <p style="color:${flight.color};"><b>${flight.status}</b></p>
        </div>
      `;
    });

    html += "</div>";
    result.innerHTML = html;

  } catch (error) {
    console.error(error);
    result.innerHTML = "Error loading flight board.";
  }
}

// Search flights
function searchFlights() {
  let input = document.getElementById("searchInput").value.trim().toUpperCase();
  if(!input){
    loadFlights();
    return;
  }

  // Simulate search
  selectedAirport = ["NBO","DXB","DOH","AUH"].includes(input)?input:selectedAirport;
  loadFlights();
}

// Travel advisory
function saveAdvisory() {
  let text = document.getElementById("advisoryInput").value;
  let level = document.getElementById("riskLevel").value;

  let advisory = `${level}: ${text}`;
  localStorage.setItem("advisory", advisory);
  document.getElementById("savedAdvisory").innerText = advisory;
}

function loadAdvisories() {
  let advisoryBox = document.getElementById("savedAdvisory");
  let saved = localStorage.getItem("advisory");
  advisoryBox.innerHTML = saved ? saved : "No current advisory.";
}

// Auto refresh every 60 sec
setInterval(loadFlights, 60000);

window.onload = function() {
  loadFlights();
  loadAdvisories();
};
