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

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    //console.log("Gefundene Haltestellen:", data);
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
    limit: "5",
    useRealtime: 1
  }).toString();

  const url = `${baseUrl}/XML_DM_REQUEST?${params}`;
  console.log("Abfrage URL:", url); // Zum Debuggen: Zeigt die URL, die wir anfragen

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

//XML_TRIPSTOPTIMES_REQUEST
export function getEfaDateTime(isString) {
  const d = new Date(isString);

  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours() + 1).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');

  return {
    date: `${yyyy}${mm}${dd}`,
    time: `${hh}:${min}`
  };
}

export async function getstopSeqCoord(tripId, locationId, tripCode, date) {
  const dateTime = getEfaDateTime(date);
  const params = new URLSearchParams({
    outputFormat: 'JSON',
    line: tripId,
    stopID: locationId,
    tripCode: tripCode,
    date: dateTime.date,
    time: dateTime.time,
    coordOutputFormat: "WGS84[dd.ddddd]"
  }).toString();

  const url = `${baseUrl}/XML_STOPSEQCOORD_REQUEST?${params}`;
  console.log("TripStopTimes URL:", url);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    console.log("Trip Stop Times:", data);
    return data;
  } catch (error) {
    console.error("Fehler Trip Stop Times:", error.message);
  }
}

