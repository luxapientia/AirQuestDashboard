import mongoose from 'mongoose';

const sensorDataSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  deviceName: {
    type: String,
    required: true
  },
  // GPS Data
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  // Sensor Data
  temperature: {
    type: Number,
    default: null
  },
  humidity: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  co2: {
    type: Number,
    default: null,
    min: 0
  },
  // ADC Values (in Volts)
  adcNO: {
    type: Number,
    default: null,
    min: 0
  },
  adcH2S: {
    type: Number,
    default: null,
    min: 0
  },
  adcS88: {
    type: Number,
    default: null,
    min: 0
  },
  adcPIS: {
    type: Number,
    default: null,
    min: 0
  },
  adcNO2: {
    type: Number,
    default: null,
    min: 0
  },
  adcO3: {
    type: Number,
    default: null,
    min: 0
  },
  adcCO: {
    type: Number,
    default: null,
    min: 0
  },
  adcSO2: {
    type: Number,
    default: null,
    min: 0
  },
  // PM (Particulate Matter) Values
  pm1_0_CF1: {
    type: Number,
    default: null,
    min: 0
  },
  pm2_5_CF1: {
    type: Number,
    default: null,
    min: 0
  },
  pm10_CF1: {
    type: Number,
    default: null,
    min: 0
  },
  pm1_0_ATM: {
    type: Number,
    default: null,
    min: 0
  },
  pm2_5_ATM: {
    type: Number,
    default: null,
    min: 0
  },
  pm10_ATM: {
    type: Number,
    default: null,
    min: 0
  },
  // Particle Counts
  particle_0_3: {
    type: Number,
    default: null,
    min: 0
  },
  particle_0_5: {
    type: Number,
    default: null,
    min: 0
  },
  particle_1_0: {
    type: Number,
    default: null,
    min: 0
  },
  particle_2_5: {
    type: Number,
    default: null,
    min: 0
  },
  particle_5_0: {
    type: Number,
    default: null,
    min: 0
  },
  particle_10: {
    type: Number,
    default: null,
    min: 0
  },
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  receivedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
sensorDataSchema.index({ deviceId: 1, timestamp: -1 });

export default mongoose.model('SensorData', sensorDataSchema);

