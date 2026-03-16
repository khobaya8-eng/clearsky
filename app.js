async function loadFlights() {
  let result = document.getElementById("result");
  result.innerHTML = "Loading flights...";

  try {
    let response = await fetch("https://cors-anywhere.herokuapp.com/https://opensky-network.org/api/states/all");
    let data = await response.json();

    let flights = data.states.slice(0, 50); // first 50 flights

    let html = "<h3>Live Flights</h3>";
    flights.forEach(flight => {
      html += `
        <b>Callsign:</b> ${flight[0] || "N/A"} <br>
        <b>Country:</b> ${flight[2] || "N/A"} <br>
        <b>Altitude:</b> ${flight[7] || "N/A"} meters <br><br>
      `;
    });

    result.innerHTML = html;

  } catch (error) {
    console.error(error);
    result.innerHTML = "Error loading flight data. Try again later.";
  }
}

async function searchFlights() {
  let input = document.getElementById("searchInput").value.trim().toUpperCase();
  let result = document.getElementById("result");

  if (!input) {
    result.innerHTML = "Please enter a flight number or country.";
    return;
  }

  result.innerHTML = "Searching...";

  try {
    let response = await fetch("https://cors-anywhere.herokuapp.com/https://opensky-network.org/api/states/all");
    let data = await response.json();

    // Filter flights by callsign (flight[0]) or country (flight[2])
    let flights = data.states.filter(flight => {
      let callsign = (flight[0] || "").toUpperCase();
      let country = (flight[2] || "").toUpperCase();
      return callsign.includes(input) || country.includes(input);
    });

    if (flights.length === 0) {
      result.innerHTML = `No flights found for "${input}"`;
      return;
    }

    let html = `<h3>Search Results for "${input}"</h3>`;
    flights.forEach(flight => {
      html += `
        <b>Callsign:</b> ${flight[0] || "N/A"} <br>
        <b>Country:</b> ${flight[2] || "N/A"} <br>
        <b>Altitude:</b> ${flight[7] || "N/A"} meters <br><br>
      `;
    });

    result.innerHTML = html;

  } catch (error) {
    console.error(error);
    result.innerHTML = "Error searching flight data.";
  }
}
