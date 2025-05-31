const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../app');
const User = require('../models/user');
const Observation = require('../models/observation');
const mongoose = require('mongoose');

chai.use(chaiHttp);

describe('Observer Routes Tests', function() {
  let testUser;
  let agent;

  // Connect to test database before running tests
  before(async function() {
    // Use a test database
    await mongoose.connect('mongodb://localhost:27017/hivemind_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create a test user
    testUser = new User({
      username: 'observer@example.com',
      forename: 'Observer',
      surname: 'User',
      address: '123 Test Street',
      category: 'observer',
      accountStatus: 'active'
    });
    
    await testUser.setPassword('Password123!');
    await testUser.save();
    
    // Create an authenticated agent
    agent = chai.request.agent(app);
    
    // Login
    await agent
      .post('/login')
      .send({
        username: 'observer@example.com',
        password: 'Password123!'
      });
  });

  // Clear observations collection before each test
  beforeEach(async function() {
    await Observation.deleteMany({});
  });

  // Disconnect after tests
  after(async function() {
    await User.deleteMany({});
    await agent.close();
    await mongoose.connection.close();
  });

  // Test dashboard access
  describe('GET /observation/dashboard', function() {
    it('should access the observer dashboard when authenticated', function(done) {
      agent
        .get('/observation/dashboard')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.include('Observer Dashboard');
          done();
        });
    });
    
    it('should redirect to login when not authenticated', function(done) {
      // Use a new agent that is not authenticated
      chai.request(app)
        .get('/observation/dashboard')
        .end((err, res) => {
          expect(res).to.redirectTo(/\/login$/);
          done();
        });
    });
  });

  // Test new observation form
  describe('GET /observation/new', function() {
    it('should access the new observation form when authenticated', function(done) {
      agent
        .get('/observation/new')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.include('Submit New Observation');
          done();
        });
    });
  });

  // Test observation submission
  describe('POST /observation/new', function() {
    it('should submit a new observation with valid data', function(done) {
      const observationData = {
        date: '20250419',
        time: '14:30:00',
        timeZoneOffset: 'UTC-05:00',
        w3w: 'filled.count.soap',
        latitude: '37.123456',
        longitude: '-122.123456',
        freeSpacePathLoss: '120.5',
        bitErrorRate: '0.00001',
        temperature: '25.5',
        humidity: '45.2',
        snowfall: '0',
        windSpeed: '10.5',
        windDirection: '180.5',
        precipitation: '0.5',
        haze: '15.3',
        notes: 'Test observation'
      };

      agent
        .post('/observation/new')
        .send(observationData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.redirectTo(/\/observation\/dashboard$/);
          
          // Verify the observation was saved
          Observation.findOne({ date: '20250419' }).then(observation => {
            expect(observation).to.exist;
            expect(observation.coordinates.w3w).to.equal('filled.count.soap');
            expect(observation.temperature).to.equal(25.5);
            expect(observation.observer.toString()).to.equal(testUser._id.toString());
            done();
          }).catch(err => done(err));
        });
    });

    it('should not submit an observation with invalid data', function(done) {
      const invalidData = {
        date: 'invalid-date', // Invalid date format
        time: '14:30:00',
        timeZoneOffset: 'UTC-05:00',
        w3w: 'filled.count.soap',
        latitude: '37.123456',
        longitude: '-122.123456',
        // Missing other required fields
      };

      agent
        .post('/observation/new')
        .send(invalidData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.include('error'); // Should show error message
          
          // Verify no observation was saved
          Observation.countDocuments().then(count => {
            expect(count).to.equal(0);
            done();
          }).catch(err => done(err));
        });
    });
  });

  // Test observation history
  describe('GET /observation/history', function() {
    beforeEach(async function() {
      // Create some test observations
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
            w3w: 'other.words.here',
            decimalDegrees: {
              latitude: 38.123456,
              longitude: -123.123456
            }
          },
          freeSpacePathLoss: 121.5,
          bitErrorRate: 0.00002,
          temperature: 26.5,
          humidity: 46.2,
          snowfall: 0,
          windSpeed: 11.5,
          windDirection: 181.5,
          precipitation: 0.6,
          haze: 16.3
        }
      ];

      await Observation.insertMany(observations);
    });

    it('should display observation history for the authenticated user', function(done) {
      agent
        .get('/observation/history')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.include('filled.count.soap');
          expect(res.text).to.include('other.words.here');
          done();
        });
    });
  });

  // Test viewing a specific observation
  describe('GET /observation/:id', function() {
    let testObservation;
    
    beforeEach(async function() {
      // Create a test observation
      testObservation = new Observation({
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
      });
      
      await testObservation.save();
    });

    it('should display a specific observation', function(done) {
      agent
        .get(`/observation/${testObservation._id}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.include('filled.count.soap');
          expect(res.text).to.include('25.5°C'); // Temperature
          expect(res.text).to.include('Test observation'); // Notes
          done();
        });
    });

    it('should not display an observation that does not belong to the user', async function() {
      // Create another user
      const otherUser = new User({
        username: 'other@example.com',
        forename: 'Other',
        surname: 'User',
        address: '456 Other Street',
        category: 'observer'
      });
      
      await otherUser.setPassword('Password123!');
      await otherUser.save();
      
      // Create an observation for the other user
      const otherObservation = new Observation({
        observer: otherUser._id,
        date: '20250420',
        time: '15:30:00',
        timeZoneOffset: 'UTC-05:00',
        coordinates: {
          w3w: 'other.user.observation',
          decimalDegrees: {
            latitude: 38.123456,
            longitude: -123.123456
          }
        },
        freeSpacePathLoss: 121.5,
        bitErrorRate: 0.00002,
        temperature: 26.5,
        humidity: 46.2,
        snowfall: 0,
        windSpeed: 11.5,
        windDirection: 181.5,
        precipitation: 0.6,
        haze: 16.3
      });
      
      await otherObservation.save();
      
      // Try to access the other user's observation
      const res = await agent.get(`/observation/${otherObservation._id}`);
      expect(res).to.redirectTo(/\/observation\/dashboard$/); // Should redirect to dashboard
    });
  });
});
