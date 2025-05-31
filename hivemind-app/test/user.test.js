const { expect } = require('chai');
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');

describe('User Model Tests', function() {
  // Connect to test database before running tests
  before(function(done) {
    // Use a test database
    mongoose.connect('mongodb://localhost:27017/hivemind_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => done())
      .catch(err => done(err));
  });

  // Clear users collection before each test
  beforeEach(function(done) {
    User.deleteMany({}).then(() => done()).catch(err => done(err));
  });

  // Disconnect after tests
  after(function(done) {
    mongoose.connection.close().then(() => done()).catch(err => done(err));
  });

  // Test user creation with valid data
  it('should create a new observer user with valid data', async function() {
    const userData = {
      username: 'test@example.com',
      forename: 'Test',
      surname: 'User',
      address: '123 Test Street',
      category: 'observer',
      accountStatus: 'active',
      accountBalance: 100,
      cardName: 'Test User',
      cardType: 'Visa',
      notificationPreference: 'email'
    };

    const user = new User(userData);
    await user.setCardDetails('4111111111111111', '123');
    await user.setPassword('Password123!');
    const savedUser = await user.save();

    expect(savedUser).to.have.property('_id');
    expect(savedUser.username).to.equal(userData.username);
    expect(savedUser.forename).to.equal(userData.forename);
    expect(savedUser.surname).to.equal(userData.surname);
    expect(savedUser.category).to.equal(userData.category);
    expect(savedUser.accountStatus).to.equal(userData.accountStatus);
    expect(savedUser.cardNumberLast4).to.equal('1111');
    expect(savedUser.cardNumberHash).to.exist;
    expect(savedUser.cardCVVHash).to.exist;
    expect(savedUser.salt).to.exist;
    expect(savedUser.hash).to.exist;
  });

  // Test user creation with invalid data
  it('should fail to create a user with invalid data', async function() {
    const invalidUser = new User({
      // Missing required fields
      username: 'test@example.com'
    });

    try {
      await invalidUser.save();
      // If save succeeds, fail the test
      expect.fail('User should not be saved with invalid data');
    } catch (error) {
      expect(error).to.exist;
      expect(error).to.be.an.instanceOf(mongoose.Error.ValidationError);
    }
  });

  // Test password verification
  it('should verify correct password', async function() {
    const user = new User({
      username: 'test@example.com',
      forename: 'Test',
      surname: 'User',
      address: '123 Test Street',
      category: 'observer'
    });

    await user.setPassword('Password123!');
    await user.save();

    const isValid = await user.authenticate('Password123!');
    expect(isValid).to.be.true;
  });

  // Test password rejection
  it('should reject incorrect password', async function() {
    const user = new User({
      username: 'test@example.com',
      forename: 'Test',
      surname: 'User',
      address: '123 Test Street',
      category: 'observer'
    });

    await user.setPassword('Password123!');
    await user.save();

    const isValid = await user.authenticate('WrongPassword123!');
    expect(isValid).to.be.false;
  });

  // Test role verification methods
  it('should correctly identify user roles', async function() {
    const observer = new User({
      username: 'observer@example.com',
      forename: 'Observer',
      surname: 'User',
      address: '123 Test Street',
      category: 'observer'
    });

    const support = new User({
      username: 'support@example.com',
      forename: 'Support',
      surname: 'User',
      address: '123 Test Street',
      category: 'support'
    });

    expect(observer.isObserver()).to.be.true;
    expect(observer.isSupport()).to.be.false;
    expect(support.isObserver()).to.be.false;
    expect(support.isSupport()).to.be.true;
  });

  // Test credit card hashing
  it('should properly hash and store credit card information', async function() {
    const user = new User({
      username: 'test@example.com',
      forename: 'Test',
      surname: 'User',
      address: '123 Test Street',
      category: 'observer'
    });

    const cardNumber = '4111111111111111';
    const cvv = '123';

    await user.setCardDetails(cardNumber, cvv);
    
    // Check that last 4 digits are stored in clear text
    expect(user.cardNumberLast4).to.equal('1111');
    
    // Check that first 12 digits are hashed
    expect(user.cardNumberHash).to.exist;
    expect(user.cardNumberHash).to.not.include('411111111111');
    
    // Check that CVV is hashed
    expect(user.cardCVVHash).to.exist;
    expect(user.cardCVVHash).to.not.include('123');
    
    // Verify that bcrypt was used for hashing
    const isValidHash = /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/.test(user.cardNumberHash);
    expect(isValidHash).to.be.true;
  });
});
