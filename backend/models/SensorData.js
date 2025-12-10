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

