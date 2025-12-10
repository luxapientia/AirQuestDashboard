# AirQuest Dashboard Backend

Backend API server for receiving GPS, temperature, and humidity data from IoT devices and serving it to the dashboard frontend.

## Features

- 📡 **Sensor Data Reception**: REST API endpoint to receive GPS, temperature, and humidity data from devices
- 📍 **Location Tracking**: Real-time location tracking for multiple devices
- 🌡️ **Temperature & Humidity**: Store and retrieve temperature and humidity readings per device
- 🔄 **Device Management**: Automatic device registration and status tracking
- 📊 **Data History**: Store and retrieve complete sensor data history for each device
- 🗄️ **MongoDB Integration**: Persistent data storage using MongoDB
- 🏥 **Health Monitoring**: Health check endpoint and automatic offline detection

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher) - [Install MongoDB](https://www.mongodb.com/try/download/community)

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up MongoDB:
   - **Local MongoDB**: Make sure MongoDB is running on `mongodb://localhost:27017`
   - **MongoDB Atlas** (Cloud): Get your connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

4. Create a `.env` file:
```bash
# Create .env file with the following variables:
PORT=80
FRONTEND_URL=http://localhost:8080
MONGODB_URI=mongodb://localhost:27017/airquest
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/airquest
```

5. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:80` by default and automatically connect to MongoDB.

## API Endpoints

### Sensor Data

#### POST `/api/sensor-data`
Receive GPS, temperature, and humidity data from a device.

**Request Body:**
```json
{
  "deviceId": "DEV-001-A1",
  "deviceName": "Sensor Hub A1",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "temperature": 24.5,              // Optional
  "humidity": 65.2,                  // Optional
  "timestamp": "2024-01-01T12:00:00Z"  // Optional, defaults to current time
}
```

**Note:** `latitude` and `longitude` are required. `temperature` and `humidity` are optional.

#### POST `/api/gps` (Legacy)
This endpoint is maintained for backward compatibility and redirects to `/api/sensor-data`.

**Response:**
```json
{
  "success": true,
  "message": "GPS data received successfully",
  "location": {
    "deviceId": "DEV-001-A1",
    "deviceName": "Sensor Hub A1",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timestamp": "2024-01-01T12:00:00Z",
    "receivedAt": "2024-01-01T12:00:01Z"
  }
}
```

**Example using curl:**
```bash
# Send GPS, temperature, and humidity data
curl -X POST http://localhost:80/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "DEV-001-A1",
    "deviceName": "Sensor Hub A1",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "temperature": 24.5,
    "humidity": 65.2
  }'

# Send only GPS data (temperature and humidity are optional)
curl -X POST http://localhost:80/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "DEV-001-A1",
    "deviceName": "Sensor Hub A1",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

#### GET `/api/gps/locations`
Get current GPS locations for all devices (or a specific device).

**Query Parameters:**
- `deviceId` (optional): Filter by specific device ID

**Response:**
```json
[
  {
    "lat": 40.7128,
    "lng": -74.0060,
    "name": "Sensor Hub A1"
  },
  {
    "lat": 40.7589,
    "lng": -73.9851,
    "name": "Weather Station"
  }
]
```

**Example:**
```bash
# Get all locations
curl http://localhost:80/api/gps/locations

# Get location for specific device
curl http://localhost:80/api/gps/locations?deviceId=DEV-001-A1
```

#### GET `/api/gps/history/:deviceId`
Get GPS history for a specific device.

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 100, max: 1000)

**Response:**
```json
[
  {
    "deviceId": "DEV-001-A1",
    "deviceName": "Sensor Hub A1",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timestamp": "2024-01-01T12:00:00Z",
    "receivedAt": "2024-01-01T12:00:01Z"
  },
  ...
]
```

**Example:**
```bash
curl http://localhost:80/api/gps/history/DEV-001-A1?limit=50
```

### Sensor Data (Temperature & Humidity)

#### GET `/api/sensor-data/:deviceId`
Get complete sensor data (GPS, temperature, humidity) for a specific device.

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 100, max: 1000)
- `startDate` (optional): Filter by start date (ISO format: `2024-01-01T00:00:00Z`)
- `endDate` (optional): Filter by end date (ISO format: `2024-01-01T23:59:59Z`)

**Response:**
```json
[
  {
    "_id": "...",
    "deviceId": "DEV-001-A1",
    "deviceName": "Sensor Hub A1",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "temperature": 24.5,
    "humidity": 65.2,
    "timestamp": "2024-01-01T12:00:00Z",
    "receivedAt": "2024-01-01T12:00:01Z"
  },
  ...
]
```

**Example:**
```bash
# Get last 50 sensor readings
curl http://localhost:80/api/sensor-data/DEV-001-A1?limit=50

# Get sensor data for a date range
curl "http://localhost:80/api/sensor-data/DEV-001-A1?startDate=2024-01-01T00:00:00Z&endDate=2024-01-01T23:59:59Z"
```

#### GET `/api/sensor-data/:deviceId/latest`
Get the latest sensor data for a specific device.

**Response:**
```json
{
  "_id": "...",
  "deviceId": "DEV-001-A1",
  "deviceName": "Sensor Hub A1",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "temperature": 24.5,
  "humidity": 65.2,
  "timestamp": "2024-01-01T12:00:00Z",
  "receivedAt": "2024-01-01T12:00:01Z"
}
```

**Example:**
```bash
curl http://localhost:80/api/sensor-data/DEV-001-A1/latest
```

### Device Management

#### GET `/api/devices`
Get all registered devices with their status.

**Response:**
```json
[
  {
    "id": "DEV-001-A1",
    "name": "Sensor Hub A1",
    "isOnline": true,
    "lastSeen": "2024-01-01T12:00:00Z",
    "hasLocation": true
  }
]
```

#### GET `/api/devices/:deviceId`
Get detailed information about a specific device.

**Response:**
```json
{
  "id": "DEV-001-A1",
  "name": "Sensor Hub A1",
  "isOnline": true,
  "lastSeen": "2024-01-01T12:00:00Z",
  "lastLocation": {
    "lat": 40.7128,
    "lng": -74.0060,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### Health Check

#### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "devices": 3,
  "totalLocations": 150
}
```

## Device Integration

### Example: Sending Sensor Data (GPS, Temperature, Humidity) from a Device

**Python Example:**
```python
import requests
import time

API_URL = "http://localhost:80/api/sensor-data"

def send_sensor_data(device_id, device_name, latitude, longitude, temperature=None, humidity=None):
    payload = {
        "deviceId": device_id,
        "deviceName": device_name,
        "latitude": latitude,
        "longitude": longitude
    }
    
    if temperature is not None:
        payload["temperature"] = temperature
    if humidity is not None:
        payload["humidity"] = humidity
    
    response = requests.post(API_URL, json=payload)
    return response.json()

# Example usage - with all sensor data
send_sensor_data("DEV-001-A1", "Sensor Hub A1", 40.7128, -74.0060, temperature=24.5, humidity=65.2)

# Example usage - GPS only
send_sensor_data("DEV-001-A1", "Sensor Hub A1", 40.7128, -74.0060)
```

**JavaScript/Node.js Example:**
```javascript
const sendSensorData = async (deviceId, deviceName, latitude, longitude, temperature = null, humidity = null) => {
  const payload = {
    deviceId,
    deviceName,
    latitude,
    longitude
  };
  
  if (temperature !== null) payload.temperature = temperature;
  if (humidity !== null) payload.humidity = humidity;
  
  const response = await fetch('http://localhost:80/api/sensor-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
};

// Example usage - with all sensor data
sendSensorData('DEV-001-A1', 'Sensor Hub A1', 40.7128, -74.0060, 24.5, 65.2);

// Example usage - GPS only
sendSensorData('DEV-001-A1', 'Sensor Hub A1', 40.7128, -74.0060);
```

**Arduino/ESP32 Example:**
```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "http://localhost:80/api/gps";

void sendGPSData(String deviceId, String deviceName, float lat, float lng) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    String jsonPayload = "{\"deviceId\":\"" + deviceId + 
                        "\",\"deviceName\":\"" + deviceName + 
                        "\",\"latitude\":" + String(lat) + 
                        ",\"longitude\":" + String(lng) + "}";
    
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      Serial.println("GPS data sent successfully");
    }
    
    http.end();
  }
}
```

## Data Storage

The backend uses **MongoDB** for persistent data storage. All sensor data (GPS, temperature, humidity) is stored in MongoDB collections:

- **`devices`**: Device information and last known location
- **`sensordatas`**: Complete history of all sensor readings

### Database Schema

**Device Collection:**
```javascript
{
  deviceId: String (unique, indexed),
  deviceName: String,
  isOnline: Boolean,
  lastSeen: Date,
  lastLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

**SensorData Collection:**
```javascript
{
  deviceId: String (indexed),
  deviceName: String,
  latitude: Number,
  longitude: Number,
  temperature: Number (optional),
  humidity: Number (optional),
  timestamp: Date (indexed),
  receivedAt: Date
}
```

### MongoDB Connection

The backend automatically connects to MongoDB on startup. Configure the connection string in your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/airquest
```

For MongoDB Atlas (cloud):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/airquest
```

## Device Status

Devices are automatically marked as:
- **Online**: When they send GPS data
- **Offline**: If no data is received for 5 minutes

The status is updated automatically in the background.

## CORS Configuration

The backend is configured to accept requests from the frontend. Update the `FRONTEND_URL` in `.env` if your frontend runs on a different URL.

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

Error responses include an `error` field with a descriptive message.

## Future Enhancements

- [x] MongoDB database integration
- [x] Temperature and humidity sensor data
- [ ] Authentication and API keys for devices
- [ ] Rate limiting
- [ ] WebSocket support for real-time updates
- [ ] GPS data aggregation and analytics
- [ ] Geofencing alerts
- [ ] Device grouping and management
- [ ] Data export (CSV, JSON)
- [ ] Advanced filtering and search

## License

ISC

