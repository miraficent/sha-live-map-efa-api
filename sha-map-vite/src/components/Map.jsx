 
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { getStops, getDepartures, getTripStopTimes,getEfaDateTime } from '../api_efa';
import busStopSvg from '../assets/bus-stop-icon.svg';
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const busStopIcon = L.icon({
  iconUrl: busStopSvg,
  iconSize: [8, 8],
  iconAnchor: [8, 8], // Zentriert den Punkt unten in der Mitte
  popupAnchor: [0, -16]
})



function Map() {
const [busStops, setBusStops] = useState([]) // Hier speichern wir die Daten

const [departures, setDepartures] = useState([]);

 const handlePopButtons = async function handleDepartures(stopId) {
    const data = await getDepartures(stopId);
    if (data && data.stopEvents) { 
        setDepartures(data.stopEvents || data.departureList || []);
      }
      console.log(data);
 } 

  useEffect(() => {
    async function loadStops() {
      const pathData = 'https://www.efa-bw.de/mobidata-bw/XML_STOPFINDER_REQUEST?outputFormat=rapidJSON&type_sf=any&name_sf=Schw%C3%A4bisch%20Hall&anyObjFilter_sf=2&coordOutputFormat=WGS84[DD.ddddd]'
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
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
            detectRetina={true} // Macht die Karte auf Handys und Laptops schärfer
            maxZoom={26}
            />
        {busStops.map((stop, index) => (
          <Marker 
            key={index} 
            position={[stop.coord[0], stop.coord[1]]} 
            icon={busStopIcon}
            eventHandlers={{
              click: () => handlePopButtons(stop.id),
            }}
          >
            <Popup >
              {stop.name || "Haltestelle"}
              {departures.map((dep, index) => (
                <div key={index}>
                {dep.transportation.name} Nach <strong>{dep.transportation.destination.name}</strong> Abfahrt um - 
                  {getEfaDateTime(dep.departureTimeEstimated || dep.departureTimePlanned).time}
              
                </div>
              ))}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;