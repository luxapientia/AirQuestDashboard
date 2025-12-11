import { Thermometer, Droplets, Wind, Sun, Gauge, Zap, MapPin, Clock, Tag } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/dashboard/Header";
import MapView from "@/components/dashboard/MapView";
import DeviceCard from "@/components/dashboard/DeviceCard";
import SensorCard from "@/components/dashboard/SensorCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface Device {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen: string;
  type: string;
}

const sensors = [
  { title: "Temperature", value: 24.5, unit: "°C", icon: Thermometer, min: -10, max: 50, color: "primary" as const },
  { title: "Humidity", value: 65.2, unit: "%", icon: Droplets, min: 0, max: 100, color: "secondary" as const },
  { title: "Wind Speed", value: 12.8, unit: "km/h", icon: Wind, min: 0, max: 100, color: "success" as const },
  { title: "UV Index", value: 6.3, unit: "", icon: Sun, min: 0, max: 11, color: "warning" as const },
  { title: "Pressure", value: 1013.2, unit: "hPa", icon: Gauge, min: 950, max: 1050, color: "primary" as const },
  { title: "Power Usage", value: 3.7, unit: "kW", icon: Zap, min: 0, max: 10, color: "secondary" as const },
];

// Helper function to format last seen time
const formatLastSeen = (timestamp: string): string => {
  const now = new Date();
  const lastSeen = new Date(timestamp);
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor(diffMs / 1000);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

// Helper function to determine device type from name
const getDeviceType = (name: string): string => {
  if (name.toLowerCase().includes("hub") || name.toLowerCase().includes("gateway")) {
    return "Gateway";
  }
  return "Sensor";
};

interface DeviceSensorData {
  deviceId: string;
  deviceName: string;
  temperature: number | null;
  humidity: number | null;
  latitude: number;
  longitude: number;
  timestamp: string;
}

const Index = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [deviceSensorData, setDeviceSensorData] = useState<DeviceSensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch GPS locations and devices from backend
  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch locations and devices in parallel
      const [locationsRes, devicesRes] = await Promise.all([
        fetch(`${API_URL}/api/gps/locations`),
        fetch(`${API_URL}/api/devices`)
      ]);

      if (!locationsRes.ok || !devicesRes.ok) {
        throw new Error("Failed to fetch data from backend");
      }

      const locationsData = await locationsRes.json();
      const devicesData = await devicesRes.json();

      // Transform locations data
      const transformedLocations: Location[] = locationsData.map((loc: any) => ({
        lat: loc.lat,
        lng: loc.lng,
        name: loc.name
      }));

      // Transform devices data
      const transformedDevices: Device[] = devicesData.map((device: any) => ({
        id: device.id,
        name: device.name,
        isOnline: device.isOnline,
        lastSeen: formatLastSeen(device.lastSeen),
        type: getDeviceType(device.name)
      }));

      setLocations(transformedLocations);
      setDevices(transformedDevices);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Unable to connect to backend. Make sure the server is running.");
      setLoading(false);
      
      // Fallback to empty data
      setLocations([]);
      setDevices([]);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Poll for updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch sensor data for selected device
  const fetchDeviceSensorData = useCallback(async (deviceId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/sensor-data/${deviceId}/latest`);
      if (response.ok) {
        const data = await response.json();
        setDeviceSensorData({
          deviceId: data.deviceId,
          deviceName: data.deviceName,
          temperature: data.temperature,
          humidity: data.humidity,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp || data.receivedAt
        });
      } else {
        setDeviceSensorData(null);
      }
    } catch (err) {
      console.error("Error fetching device sensor data:", err);
      setDeviceSensorData(null);
    }
  }, []);

  // Auto-select first device on initial load
  useEffect(() => {
    if (devices.length > 0 && !selectedDeviceId && !loading) {
      const firstDeviceId = devices[0].id;
      setSelectedDeviceId(firstDeviceId);
      fetchDeviceSensorData(firstDeviceId);
    }
  }, [devices, loading, selectedDeviceId, fetchDeviceSensorData]);

  // Handle device selection
  const handleDeviceClick = (deviceId: string) => {
    if (selectedDeviceId === deviceId) {
      // Deselect if clicking the same device
      setSelectedDeviceId(null);
      setDeviceSensorData(null);
    } else {
      setSelectedDeviceId(deviceId);
      fetchDeviceSensorData(deviceId);
    }
  };

  // Poll for selected device sensor data updates
  useEffect(() => {
    if (selectedDeviceId) {
      const interval = setInterval(() => {
        fetchDeviceSensorData(selectedDeviceId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedDeviceId]);

  const onlineCount = devices.filter(d => d.isOnline).length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header totalDevices={devices.length} onlineDevices={onlineCount} />

        {error && (
          <div className="glass-card p-4 bg-destructive/20 border border-destructive/50 rounded-xl">
            <p className="text-sm text-destructive">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Backend API URL: {API_URL}
            </p>
          </div>
        )}

        {loading && !error && (
          <div className="glass-card p-6 text-center">
            <p className="text-muted-foreground">Loading GPS data...</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <MapView locations={locations} />

          {/* Device Status Section */}
          <div className="glass-card p-6 animate-fade-in-up stagger-2 opacity-0">
            <h2 className="text-lg font-semibold text-foreground mb-4">Device Status</h2>
            {devices.length === 0 && !loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No devices found. Send GPS data from your devices to see them here.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {devices.map((device, index) => (
                  <DeviceCard 
                    key={device.id} 
                    {...device} 
                    index={index}
                    onClick={() => handleDeviceClick(device.id)}
                    isSelected={selectedDeviceId === device.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sensor Values Section */}
        <div className="glass-card p-6 animate-fade-in-up stagger-3 opacity-0">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Sensor Readings
            {selectedDeviceId && deviceSensorData && (
              <span className="text-sm text-muted-foreground font-normal ml-2">
                - {deviceSensorData.deviceName}
              </span>
            )}
          </h2>
          
          {selectedDeviceId && deviceSensorData ? (
            // Show device-specific sensor data
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Device Name */}
              <div className="glass-card-hover p-5 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Device Name</h3>
                    <p className="text-xs text-muted-foreground">Identifier</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-foreground">{deviceSensorData.deviceName}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{deviceSensorData.deviceId}</p>
                </div>
              </div>

              {/* Temperature */}
              {deviceSensorData.temperature !== null && (
                <SensorCard
                  title="Temperature"
                  value={deviceSensorData.temperature}
                  unit="°C"
                  icon={Thermometer}
                  min={-10}
                  max={50}
                  color="primary"
                  index={1}
                />
              )}

              {/* Humidity */}
              {deviceSensorData.humidity !== null && (
                <SensorCard
                  title="Humidity"
                  value={deviceSensorData.humidity}
                  unit="%"
                  icon={Droplets}
                  min={0}
                  max={100}
                  color="secondary"
                  index={2}
                />
              )}

              {/* Latitude */}
              <div className="glass-card-hover p-5 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Latitude</h3>
                    <p className="text-xs text-muted-foreground">GPS Coordinate</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-4xl font-bold text-primary">{deviceSensorData.latitude.toFixed(6)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Degrees</p>
                </div>
              </div>

              {/* Longitude */}
              <div className="glass-card-hover p-5 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Longitude</h3>
                    <p className="text-xs text-muted-foreground">GPS Coordinate</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-4xl font-bold text-primary">{deviceSensorData.longitude.toFixed(6)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Degrees</p>
                </div>
              </div>

              {/* Data Received Time */}
              <div className="glass-card-hover p-5 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Data Received</h3>
                    <p className="text-xs text-muted-foreground">Timestamp</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-lg font-bold text-foreground">
                    {new Date(deviceSensorData.timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatLastSeen(deviceSensorData.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Show default sensor cards when no device is selected
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sensors.map((sensor, index) => (
                <SensorCard key={sensor.title} {...sensor} index={index} />
              ))}
            </div>
          )}
          
          {selectedDeviceId && !deviceSensorData && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No sensor data available for this device. The device needs to send temperature and humidity data.
            </p>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-sm text-muted-foreground animate-fade-in stagger-5 opacity-0">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
