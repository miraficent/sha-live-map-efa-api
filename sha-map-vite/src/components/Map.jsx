 
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup,Polyline } from 'react-leaflet'
import { getStops, getDepartures, getstopSeqCoord,getEfaDateTime } from '../api_efa';
import busStopSvg from '../assets/bus-stop-icon.svg';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css'

const busStopIcon = L.icon({
  iconUrl: busStopSvg,
  iconSize: [10, 10],
  iconAnchor: [16, 16], 
  popupAnchor: [0, -10]
})



function Map({ route }){
  
const [busStops, setBusStops] = useState([]) 

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
    
    <div id="map" style={{ height: '100%' }}>
      
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
                </div>
                
              ))}
            </Popup>
          </Marker>

          
        ))}

        {route.length > 0 && (
            <Polyline positions={route} color="red" weight={5} />
            )}
      </MapContainer>
    </div>
  );
}

export default Map;