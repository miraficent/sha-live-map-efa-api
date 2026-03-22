 
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import busStopSvg from '../assets/bus-stop-icon.svg';
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const busStopIcon = L.icon({
  iconUrl: busStopSvg,
  iconSize: [16, 16],
  iconAnchor: [8, 16], // Zentriert den Punkt unten in der Mitte
  popupAnchor: [0, -16]
})
function Map() {
const [busStops, setBusStops] = useState([]) // Hier speichern wir die Daten

  useEffect(() => {
    async function loadStops() {
      const pathData = '/backend/data/bus-stops-coord.json'
      try {
        const response = await fetch(pathData)
        if (!response.ok) throw new Error(`Status: ${response.status}`)
        const result = await response.json()
        setBusStops(result.locations) // Daten in den State schreiben
      } catch (error) {
        console.error("Fehler beim Laden:", error.message)
      }
    }
    loadStops()
  }, [])
  return (
    
    <div style={{ height: '500px', width: '100%' }}>
      
     <MapContainer center={[49.1128, 9.7388]} zoom={13} style={{ height: '500px' }}>
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
            detectRetina={true} // Macht die Karte auf Handys und Laptops schärfer
            maxZoom={26}
            />
           {busStops.map((stop, index) => (
          <Marker 
            key={index} 
            position={[stop.coord[0], stop.coord[1]]} 
            icon={busStopIcon}
          >
            <Popup>{stop.name || "Haltestelle"}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>


  );
}

export default Map;