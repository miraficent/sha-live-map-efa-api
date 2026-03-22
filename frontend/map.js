var map = L.map('map').setView([49.11245876100222, 9.737216771247477], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 40,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var greenIcon = L.icon({
    iconUrl: '/frontend/assets/bus-stop-icon.svg',
    iconSize:     [16, 16], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});


async function getBusStopCoordinates() {

const pathData = '/backend/data/bus-stops-coord.json';

try{
    const response = await fetch(pathData);
    if(!response.ok){
        throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    const busStops = result.locations;
    console.log(busStops);
    for(let i = 0; i<busStops.length; i++){
        
        L.marker([busStops[i].coord[0], busStops[i].coord[1]], {icon: greenIcon}).addTo(map);
    }
    
}
catch (error) {
    console.error(error.message);
  }  
}
 
addEventListener("DOMContentLoaded", () => {
    getBusStopCoordinates();
 });