import { useState, useEffect } from 'react';
import { getStops, getDepartures, getstopSeqCoord,getEfaDateTime } from './api_efa';

import Map from './components/Map';
function App() {
  const [searchCity, setSearchCity] = useState("Schwäbisch Hall");
  const [stops, setStops] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [stopCoord, setstopSeqCoord] = useState([]);
  const [selectedStopName, setSelectedStopName] = useState("");

  const handleStopClick = async (stopId, stopName) => {
    const data = await getDepartures(stopId);
    if (data && data.stopEvents) { 
      setDepartures(data.stopEvents || data.departureList || []);
      setSelectedStopName(stopName);
      
    }
  };

 
  const getRoute = async (tripId, locationId, tripCode, date) => {
      const stopCoords = await getstopSeqCoord(tripId, locationId, tripCode, date);

      const coordinates = stopCoords.stopSeqCoords.coords.path.split(" ").map(row => row.split(","));
        const numCoords = coordinates.map(pair => [
          Number(pair[1]), 
          Number(pair[0]) 
        ]);
          console.log(numCoords);
          setstopSeqCoord(numCoords);
    }

  const handleSearch = async (e) => {
    e.preventDefault(); 
    const data = await getStops(searchCity);
    if (data && data.locations) {
      setStops(data.locations);
    }
  };

  return (
    <>
      <main>
        <h1>Schwäbisch Hall Map</h1>
        <Map stops={stops} route={stopCoord}/>
        
        <form onSubmit={handleSearch}>
          <input 
            value={searchCity} 
            onChange={(e) => setSearchCity(e.target.value)} 
          />
          <button type="submit">Suchen</button>
        </form>

      
        <ul>
          {stops.map((stop) => (
            <li key={stop.id} onClick={() => handleStopClick(stop.id, stop.name)} style={{cursor: 'pointer', color: 'blue', listStyle: 'none'}}>
              {stop.name}
            </li>
          ))}
        </ul>

        {selectedStopName && (
          <div className="departure-board">
            <h2>Abfahrten für {selectedStopName}</h2>
            <div className='departures'>
              {departures.map((dep, index) => (
                <div key={index}>
                {dep.transportation.name} Nach <strong>{dep.transportation.destination.name}</strong> Abfahrt um - 
                  {getEfaDateTime(dep.departureTimeEstimated || dep.departureTimePlanned).time}
                  <button onClick={() => getRoute(dep.transportation.id,dep.location.id, dep.transportation.properties.tripCode,dep.departureTimePlanned)}>Route</button>
                  
                </div>
                
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default App;