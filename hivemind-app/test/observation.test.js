const { expect } = require('chai');
const mongoose = require('mongoose');
const Observation = require('../models/observation');
const User = require('../models/user');

describe('Observation Model Tests', function() {
  let testUser;

  // Connect to test database before running tests
  before(async function() {
    // Use a test database
    await mongoose.connect('mongodb://localhost:27017/hivemind_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create a test user for observations
    testUser = new User({
      username: 'observer@example.com',
      forename: 'Observer',
      surname: 'User',
      address: '123 Test Street',
      category: 'observer'
    });
    await testUser.save();
  });

  // Clear observations collection before each test
  beforeEach(async function() {
    await Observation.deleteMany({});
  });

  // Disconnect after tests
  after(async function() {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Test observation creation with valid data
  it('should create a new observation with valid data', async function() {
    const observationData = {
      observer: testUser._id,
      date: '20250419',
      time: '14:30:00',
      timeZoneOffset: 'UTC-05:00',
      coordinates: {
        w3w: 'filled.count.soap',
        decimalDegrees: {
          latitude: 37.123456,
          longitude: -122.123456
        }
      },
      freeSpacePathLoss: 120.5,
      bitErrorRate: 0.00001,
      temperature: 25.5,
      humidity: 45.2,
      snowfall: 0,
      windSpeed: 10.5,
      windDirection: 180.5,
      precipitation: 0.5,
      haze: 15.3,
      notes: 'Test observation'
    };

    const observation = new Observation(observationData);
    const savedObservation = await observation.save();

    expect(savedObservation).to.have.property('_id');
    expect(savedObservation.observer.toString()).to.equal(testUser._id.toString());
    expect(savedObservation.date).to.equal(observationData.date);
    expect(savedObservation.time).to.equal(observationData.time);
    expect(savedObservation.coordinates.w3w).to.equal(observationData.coordinates.w3w);
    expect(savedObservation.coordinates.decimalDegrees.latitude).to.equal(observationData.coordinates.decimalDegrees.latitude);
    expect(savedObservation.temperature).to.equal(observationData.temperature);
    expect(savedObservation.notes).to.equal(observationData.notes);
  });

  // Test observation creation with invalid data
  it('should fail to create an observation with invalid data', async function() {
    const invalidObservation = new Observation({
      // Missing required fields
      observer: testUser._id,
      date: '20250419'
      // Missing other required fields
    });

    try {
      await invalidObservation.save();
      // If save succeeds, fail the test
      expect.fail('Observation should not be saved with invalid data');
    } catch (error) {
      expect(error).to.exist;
      expect(error).to.be.an.instanceOf(mongoose.Error.ValidationError);
    }
  });

  // Test observation with invalid coordinates
  it('should fail to create an observation with invalid coordinates', async function() {
    const invalidObservation = new Observation({
      observer: testUser._id,
      date: '20250419',
      time: '14:30:00',
      timeZoneOffset: 'UTC-05:00',
      coordinates: {
        w3w: 'filled.count.soap',
        decimalDegrees: {
          latitude: 95.123456, // Invalid latitude (> 90)
          longitude: -122.123456
        }
      },
      freeSpacePathLoss: 120.5,
      bitErrorRate: 0.00001,
      temperature: 25.5,
      humidity: 45.2,
      snowfall: 0,
      windSpeed: 10.5,
      windDirection: 180.5,
      precipitation: 0.5,
      haze: 15.3
    });

    try {
      await invalidObservation.save();
      // If save succeeds, fail the test
      expect.fail('Observation should not be saved with invalid coordinates');
    } catch (error) {
      expect(error).to.exist;
    }
  });

  // Test relationship with User model
  it('should correctly associate observation with user', async function() {
    const observation = new Observation({
      observer: testUser._id,
      date: '20250419',
      time: '14:30:00',
      timeZoneOffset: 'UTC-05:00',
      coordinates: {
        w3w: 'filled.count.soap',
        decimalDegrees: {
          latitude: 37.123456,
          longitude: -122.123456
        }
      },
      freeSpacePathLoss: 120.5,
      bitErrorRate: 0.00001,
      temperature: 25.5,
      humidity: 45.2,
      snowfall: 0,
      windSpeed: 10.5,
      windDirection: 180.5,
      precipitation: 0.5,
      haze: 15.3
    });

    await observation.save();

    // Find the observation and populate the observer field
    const foundObservation = await Observation.findById(observation._id).populate('observer');
    
    expect(foundObservation.observer).to.exist;
    expect(foundObservation.observer._id.toString()).to.equal(testUser._id.toString());
    expect(foundObservation.observer.username).to.equal(testUser.username);
    expect(foundObservation.observer.category).to.equal('observer');
  });

  // Test querying observations by date range
  it('should find observations within a date range', async function() {
    // Create multiple observations with different dates
    const observations = [
      {
        observer: testUser._id,
        date: '20250410',
        time: '14:30:00',
        timeZoneOffset: 'UTC-05:00',
        coordinates: {
          w3w: 'filled.count.soap',
          decimalDegrees: {
            latitude: 37.123456,
            longitude: -122.123456
          }
        },
        freeSpacePathLoss: 120.5,
        bitErrorRate: 0.00001,
        temperature: 25.5,
        humidity: 45.2,
        snowfall: 0,
        windSpeed: 10.5,
        windDirection: 180.5,
        precipitation: 0.5,
        haze: 15.3
      },
      {
        observer: testUser._id,
        date: '20250415',
        time: '14:30:00',
        timeZoneOffset: 'UTC-05:00',
        coordinates: {
          w3w: 'filled.count.soap',
          decimalDegrees: {
            latitude: 37.123456,
            longitude: -122.123456
          }
        },
        freeSpacePathLoss: 120.5,
        bitErrorRate: 0.00001,
        temperature: 25.5,
        humidity: 45.2,
        snowfall: 0,
        windSpeed: 10.5,
        windDirection: 180.5,
        precipitation: 0.5,
        haze: 15.3
      },
      {
        observer: testUser._id,
        date: '20250420',
        time: '14:30:00',
        timeZoneOffset: 'UTC-05:00',
        coordinates: {
          w3w: 'filled.count.soap',
          decimalDegrees: {
            latitude: 37.123456,
            longitude: -122.123456
          }
        },
        freeSpacePathLoss: 120.5,
        bitErrorRate: 0.00001,
        temperature: 25.5,
        humidity: 45.2,
        snowfall: 0,
        windSpeed: 10.5,
        windDirection: 180.5,
        precipitation: 0.5,
        haze: 15.3
      }
    ];

    await Observation.insertMany(observations);

    // Query observations between 20250412 and 20250418
    const results = await Observation.find({
      date: { $gte: '20250412', $lte: '20250418' }
    });

    expect(results).to.have.lengthOf(1);
    expect(results[0].date).to.equal('20250415');
  });
});
