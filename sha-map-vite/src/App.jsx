
import { useState, useEffect } from 'react'
import './App.css'
import 'leaflet/dist/leaflet.css'
import { getDepartures, getStops, getTripStops,getStopsNearby } from './api_efa.js'
import Map from './components/MAp';

function App() {
  const [count, setCount] = useState(0)


 // 1. Ein State für den Text im Suchfeld
  const [searchCity, setSearchCity] = useState("Schwäbisch Hall");
  // 2. Ein State für die Ergebnisse (Haltestellen)
  const [stops, setStops] = useState([]);
  const [nearbyStops, setNearbyStops] = useState([]);
  // Wird nur einmal beim Start ausgeführt
useEffect(() => {
    async function fetchData() {
      // 1. Abfahrten laden (Optional: auch hier in einem State speichern)
      await getDepartures("de:08127:20000");

      // 2. Umgebungsdaten laden und im State SPEICHERN
      const nearbyData = await getStopsNearby(9.7409, 48.5839, 1500);
      if (nearbyData && nearbyData.pins) {
        setNearbyStops(nearbyData.pins); // Jetzt weiß React von den Pins!
      }
    }
    fetchData();
  }, []);

  // Funktion, die aufgerufen wird, wenn man das Formular abschickt
  const handleSearch = async (e) => {
    e.preventDefault(); // Verhindert, dass die Seite neu lädt
    const data = await getStops(searchCity);
    if (data && data.locations) {
      setStops(data.locations);
      console.log("Gefundene Haltestellen:", data.locations);
    }
  };

  return (
    <>
    <main>
     <h1 >Schwäbisch Hall Map</h1>

      <Map stops={stops} nearbyStops={nearbyStops}/>
      <form onSubmit={handleSearch}>
        <label htmlFor="search"> Geben Sie Haltestelle ein: </label>
        <input 
          type="text" 
          placeholder="Stadt" 
          id='search'
          value={searchCity} // Das Feld zeigt immer den State an
          onChange={(e) => setSearchCity(e.target.value)} // Update beim Tippen
        />
        <button type="submit">Suchen</button>
      </form>


      <ul>
        {stops.map((stop) => (
          <li key={stop.id} onClick={() => getDepartures(stop.id)}>
            {stop.name}
          </li>
        ))}
      </ul>
    </main>
      
    </>
    
  )
}

export default App
