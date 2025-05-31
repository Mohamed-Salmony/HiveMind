const mongoose = require('mongoose');

// Define Observation Schema
const ObservationSchema = new mongoose.Schema({
  observer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // ISO 8601 - YYYYMMDD
  time: { type: String, required: true }, // ISO 8601 - hh:mm:ss
  timeZoneOffset: { type: String, required: true }, // ISO 8601 e.g. UTC-10:00
  coordinates: {
    w3w: { type: String, required: true },
    decimalDegrees: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },
  freeSpacePathLoss: { type: Number, required: true },
  bitErrorRate: { type: Number, required: true },
  temperature: { type: Number, required: true }, // celsius
  humidity: { type: Number, required: true }, // g/kg
  snowfall: { type: Number, required: true }, // cm
  windSpeed: { type: Number, required: true }, // km/h
  windDirection: { type: Number, required: true }, // decimal degrees
  precipitation: { type: Number, required: true }, // mm
  haze: { type: Number, required: true }, // %
  notes: { type: String }
}, { timestamps: true });

// Create and export Observation model
module.exports = mongoose.model('Observation', ObservationSchema);
