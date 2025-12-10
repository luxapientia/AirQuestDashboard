/**
 * Simple test script to verify the backend API is working
 * Run this after starting the server: node test-api.js
 */

const API_URL = 'http://localhost:80';

async function testAPI() {
  console.log('🧪 Testing AirQuest Backend API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_URL}/api/health`);
    const health = await healthResponse.json();
    console.log('✅ Health check:', health);
    console.log('');

    // Test 2: Send sensor data (GPS + temperature + humidity) from Device 1
    console.log('2. Sending sensor data from Device 1...');
    const sensor1Response = await fetch(`${API_URL}/api/sensor-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'DEV-001-A1',
        deviceName: 'Sensor Hub A1',
        latitude: 40.7128,
        longitude: -74.0060,
        temperature: 24.5,
        humidity: 65.2
      })
    });
    const sensor1 = await sensor1Response.json();
    console.log('✅ Sensor data sent:', sensor1);
    console.log('');

    // Test 3: Send sensor data from Device 2
    console.log('3. Sending sensor data from Device 2...');
    const sensor2Response = await fetch(`${API_URL}/api/sensor-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'DEV-002-WS',
        deviceName: 'Weather Station',
        latitude: 40.7589,
        longitude: -73.9851,
        temperature: 22.3,
        humidity: 58.7
      })
    });
    const sensor2 = await sensor2Response.json();
    console.log('✅ Sensor data sent:', sensor2);
    console.log('');

    // Test 4: Send sensor data from Device 3
    console.log('4. Sending sensor data from Device 3...');
    const sensor3Response = await fetch(`${API_URL}/api/sensor-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'DEV-004-AQ',
        deviceName: 'Air Quality Node',
        latitude: 40.6892,
        longitude: -74.0445,
        temperature: 26.1,
        humidity: 72.4
      })
    });
    const sensor3 = await sensor3Response.json();
    console.log('✅ Sensor data sent:', sensor3);
    console.log('');

    // Test 5: Get all locations
    console.log('5. Fetching all locations...');
    const locationsResponse = await fetch(`${API_URL}/api/gps/locations`);
    const locations = await locationsResponse.json();
    console.log('✅ Locations:', locations);
    console.log('');

    // Test 6: Get all devices
    console.log('6. Fetching all devices...');
    const devicesResponse = await fetch(`${API_URL}/api/devices`);
    const devices = await devicesResponse.json();
    console.log('✅ Devices:', devices);
    console.log('');

    // Test 7: Get GPS history for a device
    console.log('7. Fetching GPS history for DEV-001-A1...');
    const historyResponse = await fetch(`${API_URL}/api/gps/history/DEV-001-A1`);
    const history = await historyResponse.json();
    console.log('✅ History:', history);
    console.log('');

    // Test 8: Get complete sensor data for a device
    console.log('8. Fetching complete sensor data for DEV-001-A1...');
    const sensorDataResponse = await fetch(`${API_URL}/api/sensor-data/DEV-001-A1?limit=5`);
    const sensorData = await sensorDataResponse.json();
    console.log('✅ Sensor data:', sensorData);
    console.log('');

    // Test 9: Get latest sensor data for a device
    console.log('9. Fetching latest sensor data for DEV-001-A1...');
    const latestResponse = await fetch(`${API_URL}/api/sensor-data/DEV-001-A1/latest`);
    const latest = await latestResponse.json();
    console.log('✅ Latest sensor data:', latest);
    console.log('');

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Make sure the server is running on', API_URL);
  }
}

testAPI();

