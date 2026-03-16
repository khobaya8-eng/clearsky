async function loadFlights() {
  let result = document.getElementById("result");

  // Show loading message
  result.innerHTML = "Loading flights...";

  try {
    // Fetch from OpenSky using CORS proxy
    let response = await fetch("https://cors-anywhere.herokuapp.com/https://opensky-network.org/api/states/all");
    let data = await response.json();

    // Show only the first 10 flights (for demo)
    let flights = data.states.slice(0, 10);

    let html = "<h3>Live Flights</h3>";

    flights.forEach(flight => {
      html += `
        <b>Callsign:</b> ${flight[1]} <br>
        <b>Country:</b> ${flight[2]} <br>
        <b>Altitude:</b> ${flight[7]} meters <br><br>
      `;
    });

    result.innerHTML = html;

  } catch (error) {
    console.error(error);
    result.innerHTML = "Error loading flight data. Try again later.";
  }
}
