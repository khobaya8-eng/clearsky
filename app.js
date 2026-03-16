function checkFlight() {
  let flight = document.getElementById("flightNo").value.toUpperCase();
  let resultDiv = document.getElementById("result");

  if(!flight) {
    resultDiv.innerText = "Please enter a flight number.";
    return;
  }

  // Example: Using AviationStack free API
  let apiKey = "YOUR_API_KEY"; // replace with your free API key from aviationstack.com
  let url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flight}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if(data.data && data.data.length > 0) {
        let flightData = data.data[0];
        resultDiv.innerHTML = `
          <b>Airline:</b> ${flightData.airline.name} <br>
          <b>Flight:</b> ${flightData.flight.iata} <br>
          <b>From:</b> ${flightData.departure.airport} <br>
          <b>To:</b> ${flightData.arrival.airport} <br>
          <b>Status:</b> ${flightData.flight_status} <br>
          <b>Departure Time:</b> ${flightData.departure.scheduled} <br>
          <b>Arrival Time:</b> ${flightData.arrival.scheduled} <br>
        `;
      } else {
        resultDiv.innerText = "Flight not found or no data available.";
      }
    })
    .catch(err => {
      console.error(err);
      resultDiv.innerText = "Error fetching flight data.";
    });
}
