async function loadFlights() {

let result = document.getElementById("result");

try {

let response = await fetch("https://opensky-network.org/api/states/all");
let data = await response.json();

let flights = data.states.slice(0,10); // show first 10 flights

let html = "<h3>Live Flights</h3>";

flights.forEach(flight => {
html += `
Flight: ${flight[1]} <br>
Country: ${flight[2]} <br>
Altitude: ${flight[7]} meters <br><br>
`;
});

result.innerHTML = html;

} catch(error) {

result.innerHTML = "Error loading flight data.";

}

}
