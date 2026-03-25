# SHA Map - Dokumentation

Interaktive Karte für den öffentlichen Nahverkehr in Schwäbisch Hall. Die App zeigt Haltestellen, Abfahrtszeiten und Routen von Bussen und Zügen auf einer Leaflet-Karte an.

## Technologie-Stack

* React - UI-Framework (Komponenten, State-Management)
* Vite8Build-Tool & Dev-Server
* Leaflet1.9Kartenrendering, react-leaflet5.0React-Wrapper für Leaflet
* EFA-BW API-ÖPNV-Daten für Baden-Württemberg

|  |
| - |

## Projektstruktur

```
sha-map-vite/
├── src/
│   ├── main.jsx          # Einstiegspunkt, rendert <App />
│   ├── App.jsx            # Hauptkomponente (Suche, Abfahrten, Route)
│   ├── api_efa.js         # Alle API-Aufrufe zur EFA-BW Schnittstelle
│   ├── components/
│   │   └── Map.jsx        # Leaflet-Karte mit Markern, Popups, Polylines
│   └── assets/
│       └── bus-stop-icon.svg
├── index.html
├── package.json
└── vite.config.js
```

## Komponenten

### App.jsx

Die Hauptkomponente verwaltet den gesamten App-State:

- **searchCity** - Suchbegriff für Haltestellen (`<form>`)
- **stops** - Liste der gefundenen Haltestellen
- **departures** - Abfahrten einer ausgewählten Haltestelle
- **stopCoord** - Koordinaten für die Routenanzeige

Funktionen:

- `handleSearch()` - Sucht Haltestellen nach Stadtname
- `handleStopClick()` - Lädt Abfahrten einer Haltestelle
- `getRoute()` - Lädt und zeichnet die Route einer Fahrt auf der Karte

### Map.jsx

Die Kartenkomponente:

- Zeigt eine OpenStreetMap-Karte zentriert auf Schwäbisch Hall (49.1128, 9.7388)
- Lädt beim Start automatisch alle Haltestellen in Schwäbisch Hall
- Zeigt Haltestellen als Marker mit Bus-Icon
- Klick auf Marker → Popup mit Abfahrtszeiten
- Zeichnet Routen als rote Polyline

## EFA-BW API

### Was ist die EFA-API?

EFA steht für **Elektronische Fahrplanauskunft**. Die API wird von Verkehrsverbünden in Deutschland betrieben und liefert Echtzeitdaten zum öffentlichen Nahverkehr (Busse, Züge, Straßenbahnen). In diesem Projekt wird die **EFA-BW** Instanz für Baden-Württemberg genutzt.

- **Anbieter:** NVBW (Nahverkehrsgesellschaft Baden-Württemberg)
- **Basis-URL:** `https://www.efa-bw.de/nvbw`
- **Datenformat:** Die Endpunkte heißen `XML_*`, liefern aber mit `outputFormat=rapidJSON` bzw. `outputFormat=JSON` auch JSON zurück
- **Koordinatensystem:** WGS84 (GPS-Koordinaten), eingestellt über `coordOutputFormat=WGS84[DD.ddddd]`
- **Authentifizierung:** Keine - die API ist öffentlich zugänglich

### API-Aufbau

Alle Requests sind **GET-Requests** mit Query-Parametern. Das allgemeine Schema:

```
https://www.efa-bw.de/nvbw/{ENDPUNKT}?param1=wert1&param2=wert2
```

---

### 1. XML_STOPFINDER_REQUEST - Haltestellen suchen

Sucht Haltestellen nach Name oder Stadt. Wird in `getStops()` verwendet.

**URL:**

```
/nvbw/XML_STOPFINDER_REQUEST?outputFormat=rapidJSON&locationServerActive=1&type_sf=any&name_sf=Schwäbisch Hall&coordOutputFormat=WGS84[DD.ddddd]
```

---

### 2. XML_DM_REQUEST - Abfahrten abfragen

Holt die nächsten Abfahrten an einer Haltestelle. Wird in `getDepartures()` verwendet.

**URL:**

```
/nvbw/XML_DM_REQUEST?outputFormat=rapidJSON&type_dm=any&name_dm=de:08127:7210&mode=direct&limit=5&useRealtime=1
```

**Antwort (wichtige Felder):**

```json
{
  "stopEvents": [
    {
      "departureTimePlanned": "2026-03-25T14:30:00Z",
      "departureTimeEstimated": "2026-03-25T14:32:00Z",
      "transportation": {
        "id": "ddb:90R01: :R:j26",
        "name": "Bus 1",
        "destination": { "name": "Hessental Bahnhof" },
        "properties": { "tripCode": "12345" }
      },
      "location": { "id": "de:08127:7210" }
    }
  ]
}
```

- `stopEvents[]` - Array der nächsten Abfahrten
- `departureTimePlanned` - Geplante Abfahrtszeit (ISO 8601)
- `departureTimeEstimated` - Geschätzte Echtzeit-Abfahrt (falls vorhanden)
- `transportation.name` - Linienname (z.B. "Bus 1")
- `transportation.destination.name` - Endhaltestelle
- `transportation.id` + `transportation.properties.tripCode` - werden für die Routenabfrage benötigt

---

### 3. XML_STOPSEQCOORD_REQUEST - Routenverlauf laden

Holt die Koordinaten des gesamten Fahrtwegs einer Linie. Wird in `getstopSeqCoord()` verwendet, um die Route als Polyline auf der Karte zu zeichnen.

**URL:**

```
/nvbw/XML_STOPSEQCOORD_REQUEST?outputFormat=JSON&line=ddb:90R01::R:j26&stopID=de:08127:7210&tripCode=12345&date=20260325&time=14:30&coordOutputFormat=WGS84[dd.ddddd]
```


**Antwort (wichtige Felder):**

```json
{
  "stopSeqCoords": {
    "coords": {
      "path": "9.73456,49.11234 9.74000,49.11500 9.74500,49.12000"
    }
  }
}
```

- `path` - String mit allen Koordinatenpaaren, getrennt durch Leerzeichen
- Format pro Punkt: `Longitude,Latitude` (Achtung: Lng/Lat, nicht Lat/Lng!)
- Wird im Code in `[Lat, Lng]`-Arrays umgewandelt für Leaflet

---

### Hilfsfunktion: getEfaDateTime()

Die EFA-API erwartet Datum und Uhrzeit in einem bestimmten Format. Diese Funktion wandelt einen ISO-Zeitstring in das EFA-Format um:

```
ISO: "2026-03-25T14:30:00Z"  →  date: "20260325", time: "14:30"
```

---

### Datenfluss im Überblick

```
User tippt "Schwäbisch Hall"
        │
        ▼
 XML_STOPFINDER_REQUEST  →  Haltestellen mit Koordinaten
        │                         │
        │                    Marker auf Karte
        ▼
 Klick auf Haltestelle
        │
        ▼
 XML_DM_REQUEST  →  Nächste Abfahrten (Bus/Zug, Ziel, Uhrzeit)
        │                    │
        │               Abfahrtsliste anzeigen
        ▼
 Klick auf "Route"
        │
        ▼
 XML_STOPSEQCOORD_REQUEST  →  Koordinaten-Pfad der Fahrt
                                    │
                               Rote Polyline auf Karte
```

## Starten

```bash
cd sha-map-vite
npm install
npm run dev
```

Die App läuft dann unter `http://localhost:5173`.
