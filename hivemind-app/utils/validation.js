// Input validation utility functions

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const isStrongPassword = (password) => {
  // At least 8 characters, containing uppercase, lowercase, number, and special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Validate credit card number (basic Luhn algorithm check)
const isValidCreditCard = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return false;
  }
  
  // Remove spaces and dashes
  cardNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Check if contains only digits and has valid length
  if (!/^\d{16}$/.test(cardNumber)) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  // Loop from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return (sum % 10) === 0;
};

// Validate date format (YYYYMMDD)
const isValidDateFormat = (date) => {
  // Check if it's a string with exactly 8 digits
  if (!/^\d{8}$/.test(date)) {
    return false;
  }
  
  // Extract year, month, and day
  const year = parseInt(date.substring(0, 4));
  const month = parseInt(date.substring(4, 6));
  const day = parseInt(date.substring(6, 8));
  
  // Check if date is valid
  if (month < 1 || month > 12) {
    return false;
  }
  
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }
  
  return true;
};

// Validate time format (hh:mm:ss)
const isValidTimeFormat = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time);
};

// Validate numeric range
const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

module.exports = {
  isValidEmail,
  isStrongPassword,
  isValidCreditCard,
  isValidDateFormat,
  isValidTimeFormat,
  isInRange
};
