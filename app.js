async function loadFlights() {
  let result = document.getElementById("result");
  result.innerHTML = "Loading flights...";

  try {
    let response = await fetch("https://cors-anywhere.herokuapp.com/https://opensky-network.org/api/states/all");
    let data = await response.json();

    // For demo, show first 50 flights
    let flights = data.states.slice(0, 50);

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

// New search function
async function searchFlights() {
  let input = document.getElementById("searchInput").value.trim().toUpperCase();
  let result = document.getElementById("result");

  if (!input) {
    result.innerHTML = "Please enter a flight number or airport code.";
    return;
  }

  result.innerHTML = "Searching...";

  try {
    let response = await fetch("https://cors-anywhere.herokuapp.com/https://opensky-network.org/api/states/all");
    let data = await response.json();

    // Filter flights by callsign or departure/arrival airport
    let flights = data.states.filter(flight => {
      let callsign = flight[1] || "";
      let origin = flight[2] || "";
      return callsign.includes(input) || origin.includes(input);
    });

    if (flights.length === 0) {
      result.innerHTML = "No flights found for: " + input;
      return;
    }

    let html = `<h3>Search Results for "${input}"</h3>`;
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
    result.innerHTML = "Error searching flight data.";
  }
}
