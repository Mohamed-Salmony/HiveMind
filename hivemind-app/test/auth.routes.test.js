const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../app');
const User = require('../models/user');
const mongoose = require('mongoose');

chai.use(chaiHttp);

describe('Authentication Routes Tests', function() {
  // Connect to test database before running tests
  before(async function() {
    // Use a test database
    await mongoose.connect('mongodb://localhost:27017/hivemind_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  // Clear users collection before each test
  beforeEach(async function() {
    await User.deleteMany({});
  });

  // Disconnect after tests
  after(async function() {
    await mongoose.connection.close();
  });

  // Test user registration
  describe('POST /register', function() {
    it('should register a new observer user', function(done) {
      const userData = {
        username: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        forename: 'Test',
        surname: 'User',
        address: '123 Test Street',
        category: 'observer',
        cardNumber: '4111111111111111',
        cardName: 'Test User',
        cardType: 'Visa',
        cardCVV: '123',
        notificationPreference: 'email'
      };

      chai.request(app)
        .post('/register')
        .send(userData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          // Check if redirected to dashboard
          expect(res).to.redirectTo(/\/observation\/dashboard$/);
          done();
        });
    });

    it('should not register a user with invalid data', function(done) {
      const invalidUserData = {
        username: 'invalid-email', // Invalid email format
        password: 'weak', // Weak password
        confirmPassword: 'weak',
        forename: 'Test',
        surname: 'User',
        address: '123 Test Street',
        category: 'observer'
      };

      chai.request(app)
        .post('/register')
        .send(invalidUserData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          // Should not redirect to dashboard
          expect(res).to.not.redirectTo(/\/observation\/dashboard$/);
          // Should render register page again with error
          expect(res.text).to.include('error');
          done();
        });
    });
  });

  // Test user login
  describe('POST /login', function() {
    beforeEach(async function() {
      // Create a test user for login tests
      const user = new User({
        username: 'test@example.com',
        forename: 'Test',
        surname: 'User',
        address: '123 Test Street',
        category: 'observer'
      });
      
      await user.setPassword('Password123!');
      await user.save();
    });

    it('should login a user with valid credentials', function(done) {
      const loginData = {
        username: 'test@example.com',
        password: 'Password123!'
      };

      chai.request(app)
        .post('/login')
        .send(loginData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          // Check if redirected to dashboard
          expect(res).to.redirectTo(/\/observation\/dashboard$/);
          done();
        });
    });

    it('should not login a user with invalid credentials', function(done) {
      const invalidLoginData = {
        username: 'test@example.com',
        password: 'WrongPassword123!'
      };

      chai.request(app)
        .post('/login')
        .send(invalidLoginData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          // Should not redirect to dashboard
          expect(res).to.not.redirectTo(/\/observation\/dashboard$/);
          // Should redirect back to login page
          expect(res).to.redirectTo(/\/login$/);
          done();
        });
    });
  });

  // Test logout
  describe('GET /logout', function() {
    it('should logout a logged in user', function(done) {
      // First login a user
      const agent = chai.request.agent(app);
      
      // Create a test user
      const user = new User({
        username: 'test@example.com',
        forename: 'Test',
        surname: 'User',
        address: '123 Test Street',
        category: 'observer'
      });
      
      user.setPassword('Password123!')
        .then(() => user.save())
        .then(() => {
          // Login
          return agent
            .post('/login')
            .send({
              username: 'test@example.com',
              password: 'Password123!'
            });
        })
        .then((res) => {
          // Now logout
          return agent.get('/logout');
        })
        .then((res) => {
          expect(res).to.have.status(200);
          // Should redirect to login page
          expect(res).to.redirectTo(/\/login$/);
          
          // Try to access a protected route
          return agent.get('/observation/dashboard');
        })
        .then((res) => {
          // Should redirect to login page since we're logged out
          expect(res).to.redirectTo(/\/login$/);
          agent.close();
          done();
        })
        .catch(err => {
          agent.close();
          done(err);
        });
    });
  });
});
