const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcrypt');

// Define User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Email address
  forename: { type: String, required: true },
  surname: { type: String, required: true },
  address: { type: String, required: true },
  category: { type: String, enum: ['support', 'observer'], required: true },
  accountStatus: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  // Observer-specific fields (only populated for observers)
  accountBalance: { type: Number, default: 0 },
  cardNumberHash: String, // First 12 digits hashed
  cardNumberLast4: String, // Last 4 digits in clear text
  cardName: String,
  cardType: { type: String, enum: ['Visa', 'Mastercard'] },
  cardCVVHash: String, // Hashed CVV
  notificationPreference: { type: String, enum: ['text', 'email'] }
});

// Add passport-local-mongoose plugin (handles username, password, salt, hash)
UserSchema.plugin(passportLocalMongoose);

// Method to hash credit card information
UserSchema.methods.setCardDetails = async function(cardNumber, cardCVV) {
  if (cardNumber && cardNumber.length === 16) {
    const first12 = cardNumber.substring(0, 12);
    const last4 = cardNumber.substring(12);
    
    // Hash first 12 digits
    const saltRounds = 10;
    this.cardNumberHash = await bcrypt.hash(first12, saltRounds);
    this.cardNumberLast4 = last4;
  }
  
  if (cardCVV && cardCVV.length === 3) {
    // Hash CVV
    const saltRounds = 10;
    this.cardCVVHash = await bcrypt.hash(cardCVV, saltRounds);
  }
};

// Method to verify if a user is an observer
UserSchema.methods.isObserver = function() {
  return this.category === 'observer';
};

// Method to verify if a user is support
UserSchema.methods.isSupport = function() {
  return this.category === 'support';
};

// Create and export User model
module.exports = mongoose.model('User', UserSchema);
