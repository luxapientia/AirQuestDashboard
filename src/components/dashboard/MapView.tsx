import { MapPin, Navigation, Satellite } from "lucide-react";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface MapViewProps {
  locations: Location[];
}

// Fix for default marker icons in React Leaflet
const createCustomIcon = (isActive: boolean) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="w-6 h-6 rounded-full ${
          isActive ? "bg-primary glow-primary" : "bg-secondary/70"
        } border-2 border-white shadow-lg transition-all transform hover:scale-110">
          ${
            isActive
              ? '<span class="absolute inset-0 rounded-full animate-ping bg-primary opacity-50"></span>'
              : ""
          }
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Component to automatically fit bounds to all markers
const AutoFitBounds = ({ locations }: { locations: Location[] }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
};

// Component to change tile layer
const ChangeTileLayer = ({ isSatellite }: { isSatellite: boolean }) => {
  const map = useMap();

  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (isSatellite) {
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
        maxZoom: 19,
      }).addTo(map);
    } else {
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
    }
  }, [isSatellite, map]);

  return null;
};

const MapView = ({ locations }: MapViewProps) => {
  const [activeLocation, setActiveLocation] = useState<Location | null>(
    locations[0] || null
  );
  const [pulseIndex, setPulseIndex] = useState(0);
  const [isSatelliteView, setIsSatelliteView] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % locations.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [locations.length]);

  // Calculate center position (average of all locations)
  const centerLat =
    locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length || 0;
  const centerLng =
    locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length || 0;

  return (
    <div className="glass-card p-6 animate-fade-in-up stagger-1 opacity-0 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Live GPS Tracking
            </h2>
            <p className="text-xs text-muted-foreground">
              {locations.length} active devices
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsSatelliteView(!isSatelliteView)}
          className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          aria-label={isSatelliteView ? "Switch to standard view" : "Switch to satellite view"}
          title={isSatelliteView ? "Standard view" : "Satellite view"}
        >
          <Satellite className={`w-4 h-4 transition-colors ${isSatelliteView ? "text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>

      {/* Map */}
      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden border border-white/5">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={13}
          className="h-full w-full"
          zoomControl={true}
        >
          <ChangeTileLayer isSatellite={isSatelliteView} />
          <AutoFitBounds locations={locations} />
          {locations.map((loc, index) => (
            <Marker
              key={loc.name}
              position={[loc.lat, loc.lng]}
              icon={createCustomIcon(
                activeLocation?.name === loc.name || pulseIndex === index
              )}
              eventHandlers={{
                click: () => setActiveLocation(loc),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{loc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {loc.lat.toFixed(4)}°N, {loc.lng.toFixed(4)}°W
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Active location info */}
      {activeLocation && (
        <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-white/5">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">
                {activeLocation.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeLocation.lat.toFixed(4)}°N,{" "}
                {activeLocation.lng.toFixed(4)}°W
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
