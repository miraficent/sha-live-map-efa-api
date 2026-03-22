const baseUrl = "https://www.efa-bw.de/nvbw";

export async function getStops(cityName) {
  const params = new URLSearchParams({
    outputFormat: 'rapidJSON',
    locationServerActive: '1',
    type_sf: 'any',
    name_sf: cityName,
    coordOutputFormat: 'WGS84[DD.ddddd]',
  }).toString(); 

  const url = `${baseUrl}/XML_STOPFINDER_REQUEST?${params}`;
  console.log("StopFinder URL:", url); // Zum Debuggen: Zeigt die URL, die wir anfragen
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    console.log("Gefundene Haltestellen:", data);
    return data; 
  } catch (error) {
    console.error("Fehler StopFinder:", error.message);
  }
}

export async function getDepartures(stopId) {
  const params = new URLSearchParams({
    outputFormat: "rapidJSON",
    type_dm: "any",
    name_dm: stopId,
    mode: "direct",
    limit: "5"
  }).toString();

  const url = `${baseUrl}/XML_DM_REQUEST?${params}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    console.log("Abfahrts-Daten:", data);
    return data;
  } catch (error) {
    console.error("Fehler Abfahrten:", error.message);
  }
}

export async function getTripStops(originId, destId) {
 const params = new URLSearchParams({
    outputFormat: 'JSON',
    locationServerActive: '1',
    tripReductionMacro: '1',
    type_origin: 'any',
    name_origin: originId,
    type_destination: 'any',
    name_destination: destId,
    calcNumberOfTrips: '1',
    coordOutputFormat: 'WGS84[DD.ddddd]',
  }).toString();

    const url = `${baseUrl}/XML_TRIP_REQUEST2?${params}`;
    //console.log("TripRequest URL:", url); // Zum Debuggen: Zeigt die URL, die wir anfragen
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        console.log("Reise-Daten:", data);
        return data;
    } catch (error) {
        console.error("Fehler Reise:", error.message);
    }
}


export async function getStopsNearby(lat, lng, radius = 500) {
const params = new URLSearchParams({
    outputFormat: 'JSON',
    coordReqType: 'STOPS',
    type_1: 'COORD',
    name_1: `${lng}:${lat}:WGS84[DD.ddddd]`,
    radius_1: String(radius),
    max: '50',
  }).toString();

  const url = `${baseUrl}/XML_COORD_REQUEST?${params}`;
  console.log("StopFinder Nearby URL:", url); // Zum Debuggen: Zeigt die URL, die wir anfragen
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    
    // In der Antwort von XML_COORD_REQUEST heißen die Ergebnisse meistens 'pins'
    console.log("Nahegelegene Haltestellen:", data.pins || data);
    return data;
  } catch (error) {
    console.error("Fehler StopFinder Nearby:", error.message);
  }
}