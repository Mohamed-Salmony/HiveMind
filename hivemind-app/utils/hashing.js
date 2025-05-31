const bcrypt = require('bcrypt');

// Function to hash sensitive data
const hashData = async (data, saltRounds = 10) => {
  try {
    return await bcrypt.hash(data, saltRounds);
  } catch (error) {
    console.error('Error hashing data:', error);
    throw error;
  }
};

// Function to compare hashed data
const compareData = async (plainData, hashedData) => {
  try {
    return await bcrypt.compare(plainData, hashedData);
  } catch (error) {
    console.error('Error comparing data:', error);
    throw error;
  }
};

// Function to mask credit card number (keep last 4 digits)
const maskCardNumber = (cardNumber) => {
  if (!cardNumber || cardNumber.length !== 16) {
    return null;
  }
  return '************' + cardNumber.slice(12);
};

module.exports = {
  hashData,
  compareData,
  maskCardNumber
};
