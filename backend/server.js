import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import Device from './models/Device.js';
import SensorData from './models/SensorData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 80;

// Connect to MongoDB
connectDB();

// Middleware
// CORS configuration - allow multiple origins
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:8080', 'http://38.54.6.91:8080'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For development, allow any localhost origin
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
app.use(express.json());

// ==================== Sensor Data Endpoints ====================

/**
 * POST /api/sensor-data
 * Receive GPS, temperature, and humidity data from devices
 * 
 * Body:
 * {
 *   "deviceId": "DEV-001-A1",
 *   "deviceName": "Sensor Hub A1",
 *   "latitude": 40.7128,
 *   "longitude": -74.0060,
 *   "temperature": 24.5,  (optional)
 *   "humidity": 65.2,     (optional)
 *   "timestamp": "2024-01-01T12:00:00Z" (optional, defaults to now)
 * }
 */
app.post('/api/sensor-data', async (req, res) => {
  try {
    // Normalize field names to handle both device naming conventions
    // Device sends: adcNo, pm1_0_cf1, particles_0_3, etc.
    // Backend expects: adcNO, pm1_0_CF1, particle_0_3, etc.
    const normalizeField = (obj, deviceKey, backendKey) => {
      if (obj[deviceKey] !== undefined && obj[backendKey] === undefined) {
        obj[backendKey] = obj[deviceKey];
      }
    };

    // Normalize ADC field names (handle adcNo -> adcNO)
    normalizeField(req.body, 'adcNo', 'adcNO');

    // Normalize PM field names (handle lowercase: pm1_0_cf1 -> pm1_0_CF1)
    normalizeField(req.body, 'pm1_0_cf1', 'pm1_0_CF1');
    normalizeField(req.body, 'pm2_5_cf1', 'pm2_5_CF1');
    normalizeField(req.body, 'pm10_cf1', 'pm10_CF1');
    normalizeField(req.body, 'pm1_0_atm', 'pm1_0_ATM');
    normalizeField(req.body, 'pm2_5_atm', 'pm2_5_ATM');
    normalizeField(req.body, 'pm10_atm', 'pm10_ATM');

    // Normalize particle count field names (handle plural: particles_0_3 -> particle_0_3)
    normalizeField(req.body, 'particles_0_3', 'particle_0_3');
    normalizeField(req.body, 'particles_0_5', 'particle_0_5');
    normalizeField(req.body, 'particles_1_0', 'particle_1_0');
    normalizeField(req.body, 'particles_2_5', 'particle_2_5');
    normalizeField(req.body, 'particles_5_0', 'particle_5_0');
    normalizeField(req.body, 'particles_10', 'particle_10');

    const { 
      deviceId, 
      deviceName, 
      latitude, 
      longitude, 
      temperature, 
      humidity, 
      co2,
      // ADC values
      adcNO, adcH2S, adcS88, adcPIS, adcNO2, adcO3, adcCO, adcSO2,
      // PM values
      pm1_0_CF1, pm2_5_CF1, pm10_CF1, pm1_0_ATM, pm2_5_ATM, pm10_ATM,
      // Particle counts
      particle_0_3, particle_0_5, particle_1_0, particle_2_5, particle_5_0, particle_10,
      timestamp 
    } = req.body;

    // Validation
    if (!deviceId) {
      return res.status(400).json({ 
        error: 'Missing required field: deviceId' 
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: latitude and longitude' 
      });
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ 
        error: 'latitude and longitude must be numbers' 
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ 
        error: 'latitude must be between -90 and 90' 
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: 'longitude must be between -180 and 180' 
      });
    }

    // Validate temperature if provided
    if (temperature !== undefined && temperature !== null) {
      if (typeof temperature !== 'number') {
        return res.status(400).json({ 
          error: 'temperature must be a number' 
        });
      }
    }

    // Validate humidity if provided
    if (humidity !== undefined && humidity !== null) {
      if (typeof humidity !== 'number') {
        return res.status(400).json({ 
          error: 'humidity must be a number' 
        });
      }
      if (humidity < 0 || humidity > 100) {
        return res.status(400).json({ 
          error: 'humidity must be between 0 and 100' 
        });
      }
    }

    // Helper function to validate numeric sensor values
    const validateSensorValue = (value, fieldName, min = 0) => {
      if (value !== undefined && value !== null) {
        if (typeof value !== 'number') {
          return `'${fieldName}' must be a number`;
        }
        if (value < min) {
          return `'${fieldName}' must be >= ${min}`;
        }
      }
      return null;
    };

    // Validate all sensor values
    const validationErrors = [
      validateSensorValue(co2, 'co2'),
      validateSensorValue(adcNO, 'adcNO'),
      validateSensorValue(adcH2S, 'adcH2S'),
      validateSensorValue(adcS88, 'adcS88'),
      validateSensorValue(adcPIS, 'adcPIS'),
      validateSensorValue(adcNO2, 'adcNO2'),
      validateSensorValue(adcO3, 'adcO3'),
      validateSensorValue(adcCO, 'adcCO'),
      validateSensorValue(adcSO2, 'adcSO2'),
      validateSensorValue(pm1_0_CF1, 'pm1_0_CF1'),
      validateSensorValue(pm2_5_CF1, 'pm2_5_CF1'),
      validateSensorValue(pm10_CF1, 'pm10_CF1'),
      validateSensorValue(pm1_0_ATM, 'pm1_0_ATM'),
      validateSensorValue(pm2_5_ATM, 'pm2_5_ATM'),
      validateSensorValue(pm10_ATM, 'pm10_ATM'),
      validateSensorValue(particle_0_3, 'particle_0_3'),
      validateSensorValue(particle_0_5, 'particle_0_5'),
      validateSensorValue(particle_1_0, 'particle_1_0'),
      validateSensorValue(particle_2_5, 'particle_2_5'),
      validateSensorValue(particle_5_0, 'particle_5_0'),
      validateSensorValue(particle_10, 'particle_10'),
    ].filter(Boolean);

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation errors',
        details: validationErrors
      });
    }

    // Get or create device
    let device = await Device.findOne({ deviceId });
    
    if (!device) {
      device = await Device.create({
        deviceId,
        deviceName: deviceName || `Device ${deviceId}`,
        isOnline: true,
        lastSeen: new Date(),
        lastLocation: {
          latitude,
          longitude,
          timestamp: timestamp ? new Date(timestamp) : new Date()
        }
      });
    } else {
      // Update device status and last location
      device.deviceName = deviceName || device.deviceName;
      device.isOnline = true;
      device.lastSeen = new Date();
      device.lastLocation = {
        latitude,
        longitude,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      };
      await device.save();
    }

    // Create sensor data entry
    const sensorData = await SensorData.create({
      deviceId,
      deviceName: deviceName || device.deviceName,
      latitude,
      longitude,
      temperature: temperature !== undefined ? temperature : null,
      humidity: humidity !== undefined ? humidity : null,
      co2: co2 !== undefined ? co2 : null,
      // ADC values
      adcNO: adcNO !== undefined ? adcNO : null,
      adcH2S: adcH2S !== undefined ? adcH2S : null,
      adcS88: adcS88 !== undefined ? adcS88 : null,
      adcPIS: adcPIS !== undefined ? adcPIS : null,
      adcNO2: adcNO2 !== undefined ? adcNO2 : null,
      adcO3: adcO3 !== undefined ? adcO3 : null,
      adcCO: adcCO !== undefined ? adcCO : null,
      adcSO2: adcSO2 !== undefined ? adcSO2 : null,
      // PM values
      pm1_0_CF1: pm1_0_CF1 !== undefined ? pm1_0_CF1 : null,
      pm2_5_CF1: pm2_5_CF1 !== undefined ? pm2_5_CF1 : null,
      pm10_CF1: pm10_CF1 !== undefined ? pm10_CF1 : null,
      pm1_0_ATM: pm1_0_ATM !== undefined ? pm1_0_ATM : null,
      pm2_5_ATM: pm2_5_ATM !== undefined ? pm2_5_ATM : null,
      pm10_ATM: pm10_ATM !== undefined ? pm10_ATM : null,
      // Particle counts
      particle_0_3: particle_0_3 !== undefined ? particle_0_3 : null,
      particle_0_5: particle_0_5 !== undefined ? particle_0_5 : null,
      particle_1_0: particle_1_0 !== undefined ? particle_1_0 : null,
      particle_2_5: particle_2_5 !== undefined ? particle_2_5 : null,
      particle_5_0: particle_5_0 !== undefined ? particle_5_0 : null,
      particle_10: particle_10 !== undefined ? particle_10 : null,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    console.log(`[Sensor Data] Received from ${deviceId}: GPS(${latitude}, ${longitude}), Temp: ${temperature || 'N/A'}°C, Humidity: ${humidity || 'N/A'}%, CO2: ${co2 || 'N/A'} ppm`);

    res.status(200).json({
      success: true,
      message: 'Sensor data received successfully',
      data: sensorData
    });
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * POST /api/gps (Legacy endpoint - redirects to /api/sensor-data)
 * Maintained for backward compatibility
 */
app.post('/api/gps', async (req, res) => {
  // Redirect to sensor-data endpoint
  req.url = '/api/sensor-data';
  app._router.handle(req, res);
});

// ==================== GPS Locations Endpoints ====================

/**
 * GET /api/gps/locations
 * Get current GPS locations for all devices
 * 
 * Query params:
 *   - deviceId: (optional) Filter by specific device
 */
app.get('/api/gps/locations', async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (deviceId) {
      // Return location for specific device
      const device = await Device.findOne({ deviceId });
      if (!device || !device.lastLocation || !device.lastLocation.latitude) {
        return res.status(404).json({ 
          error: 'Device not found or has no GPS data' 
        });
      }

      return res.json([{
        lat: device.lastLocation.latitude,
        lng: device.lastLocation.longitude,
        name: device.deviceName
      }]);
    }

    // Return all device locations
    const devices = await Device.find({
      'lastLocation.latitude': { $ne: null }
    });

    const locations = devices.map(device => ({
      lat: device.lastLocation.latitude,
      lng: device.lastLocation.longitude,
      name: device.deviceName
    }));

    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * GET /api/gps/history/:deviceId
 * Get GPS history for a specific device
 * 
 * Query params:
 *   - limit: (optional) Number of entries to return (default: 100, max: 1000)
 */
app.get('/api/gps/history/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);

    const history = await SensorData.find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('deviceId deviceName latitude longitude timestamp receivedAt');

    if (!history || history.length === 0) {
      return res.status(404).json({ 
        error: 'No GPS history found for this device' 
      });
    }

    res.json(history.reverse()); // Return oldest first
  } catch (error) {
    console.error('Error fetching GPS history:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ==================== Sensor Data Endpoints ====================

/**
 * GET /api/sensor-data/:deviceId
 * Get sensor data (GPS, temperature, humidity) for a specific device
 * 
 * Query params:
 *   - limit: (optional) Number of entries to return (default: 100, max: 1000)
 *   - startDate: (optional) Filter by start date (ISO format)
 *   - endDate: (optional) Filter by end date (ISO format)
 */
app.get('/api/sensor-data/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const { startDate, endDate } = req.query;

    // Build query
    const query = { deviceId };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    const sensorData = await SensorData.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    if (!sensorData || sensorData.length === 0) {
      return res.status(404).json({ 
        error: 'No sensor data found for this device' 
      });
    }

    res.json(sensorData.reverse()); // Return oldest first
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * GET /api/sensor-data/:deviceId/latest
 * Get the latest sensor data for a specific device
 */
app.get('/api/sensor-data/:deviceId/latest', async (req, res) => {
  try {
    const { deviceId } = req.params;

    const latestData = await SensorData.findOne({ deviceId })
      .sort({ timestamp: -1 });

    if (!latestData) {
      return res.status(404).json({ 
        error: 'No sensor data found for this device' 
      });
    }

    res.json(latestData);
  } catch (error) {
    console.error('Error fetching latest sensor data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ==================== Device Management Endpoints ====================

/**
 * GET /api/devices
 * Get all devices with their status
 */
app.get('/api/devices', async (req, res) => {
  try {
    const devices = await Device.find({}).sort({ deviceName: 1 });
    
    const devicesList = devices.map(device => ({
      id: device.deviceId,
      name: device.deviceName,
      isOnline: device.isOnline,
      lastSeen: device.lastSeen.toISOString(),
      hasLocation: device.lastLocation && device.lastLocation.latitude !== null
    }));

    res.json(devicesList);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * GET /api/devices/:deviceId
 * Get specific device details
 */
app.get('/api/devices/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({ 
        error: 'Device not found' 
      });
    }

    // Get latest sensor data
    const latestData = await SensorData.findOne({ deviceId })
      .sort({ timestamp: -1 });

    res.json({
      id: device.deviceId,
      name: device.deviceName,
      isOnline: device.isOnline,
      lastSeen: device.lastSeen.toISOString(),
      lastLocation: device.lastLocation ? {
        lat: device.lastLocation.latitude,
        lng: device.lastLocation.longitude,
        timestamp: device.lastLocation.timestamp.toISOString()
      } : null,
      latestSensorData: latestData ? {
        temperature: latestData.temperature,
        humidity: latestData.humidity,
        timestamp: latestData.timestamp.toISOString()
      } : null
    });
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ==================== Health Check ====================

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
  try {
    const deviceCount = await Device.countDocuments();
    const sensorDataCount = await SensorData.countDocuments();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      devices: deviceCount,
      totalSensorData: sensorDataCount
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// ==================== Device Status Cleanup ====================

// Mark devices as offline if they haven't sent data in 5 minutes
setInterval(async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const result = await Device.updateMany(
      {
        lastSeen: { $lt: fiveMinutesAgo },
        isOnline: true
      },
      {
        $set: { isOnline: false }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[Device] Marked ${result.modifiedCount} device(s) as offline`);
    }
  } catch (error) {
    console.error('Error updating device status:', error);
  }
}, 60000); // Check every minute

// ==================== Server Start ====================

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Sensor Data API: http://localhost:${PORT}/api/sensor-data`);
  console.log(`📍 Locations endpoint: http://localhost:${PORT}/api/gps/locations`);
  console.log(`🌡️  Sensor Data endpoint: http://localhost:${PORT}/api/sensor-data/:deviceId`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
