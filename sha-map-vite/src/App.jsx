import { useState, useEffect } from 'react';
import { getStops, getDepartures, getstopSeqCoord,getEfaDateTime } from './api_efa';

import Map from './components/Map';
function App() {
  const [searchCity, setSearchCity] = useState("Schwäbisch Hall");
  const [stops, setStops] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [stopCoord, setstopSeqCoord] = useState([]);
  const [selectedStopName, setSelectedStopName] = useState("");

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

  const stopContainer = document.querySelector('.stopContainer');
      if (stopContainer) {
        stopContainer.style.display = 'flex';
      }
  };

const handleStopClick = async (stopId, stopName) => {

  const data = await getDepartures(stopId);
    if (data && data.stopEvents) { 
      setDepartures(data.stopEvents || data.departureList || []);
      setSelectedStopName(stopName);
    }

  };



const closeDepartureBoard = () => {
  const departureBoard = document.querySelector('.departure-board');
    if (departureBoard) {
        departureBoard.style.display = 'none';
    }else{
        departureBoard.style.display = 'block';
    }
    
};


const closeStopContainer = () => {
    
    document.querySelector('.stopContainer').style.display = 'none';

    
    const wrap = document.querySelector('.departure-board-wrap');
    if (wrap) {
        if (wrap.style.display === 'block') {
            wrap.style.display = 'none';
        } else {
            wrap.style.display = 'block';
        }
    }
};

  return (
    <>
      <main>
        
        <Map stops={stops} route={stopCoord}/>


        <div className="listHaltestelle">
          <h1>Schwäbisch Hall Map</h1>
          <h2>Haltestellen in {searchCity}</h2>        
        <form onSubmit={handleSearch}>
          <input 
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)} 
          />
          <button type="submit">Suchen</button>
        </form>
            {selectedStopName && (
        <div className="departure-board">
          <div className="departure-board-wrap">
            <button onClick={()=>closeDepartureBoard()} id='closeDeparture'>x</button>
            <h2>Abfahrten für {selectedStopName}</h2>
            <div className='departures'>
              {departures.map((dep, index) => (
                <div key={index}>
                  <span>
                    {dep.transportation.name}
                  </span>
                  <span>
                     Nach <strong>{dep.transportation.destination.name}</strong> Abfahrt um -
                  </span>
                  <span>
                    <span style={{ color: '#0ea10e', marginLeft: '0.5rem' }}>
                      Geplante Zeit: 
                      {getEfaDateTime(dep.departureTimePlanned || dep.departureTimePlanned).time}
                    </span>
                      
                      {dep.departureTimeEstimated && (
                      <span style={{ color: '#b30000', marginLeft: '0.5rem' }}>
                        Geschätzte Zeit: 
                          {getEfaDateTime(dep.departureTimeEstimated).time}
                      </span>
          )}
                      
                  </span>

                  <button 
                  className='routeShowBtn'
                  onClick={() => 
                  getRoute(dep.transportation.id,dep.location.id, 
                  dep.transportation.properties.tripCode,dep.departureTimePlanned)} >
                    Route
                  </button>
                  
                </div>
                
              ))}
            </div>
          </div>
              </div>

         
        )}
      
          <ul className="stopContainer">
            <button onClick={()=>closeStopContainer()} id='closeStopContainer'>x</button>
            {stops.map((stop) => (
              <li key={stop.id} onClick={() => {
                handleStopClick(stop.id, stop.name);

                }}  style={{cursor: 'pointer', listStyle: 'none'}}>
                {stop.name}
              </li>
            ))}
          </ul>


        </div>



      </main>
    </>
  );
}

export default App;