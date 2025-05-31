const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

// Authentication middleware
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Register page - GET
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Register - POST
router.post('/register', async (req, res) => {
  try {
    const { username, password, forename, surname, address, category } = req.body;
    
    // Create new user
    const newUser = new User({
      username,
      forename,
      surname,
      address,
      category
    });
    
    // If user is observer, set additional fields
    if (category === 'observer') {
      const { cardNumber, cardName, cardType, cardCVV, notificationPreference } = req.body;
      newUser.cardName = cardName;
      newUser.cardType = cardType;
      newUser.notificationPreference = notificationPreference;
      
      // Hash sensitive card information
      await newUser.setCardDetails(cardNumber, cardCVV);
    }
    
    // Register user with passport-local-mongoose (handles password hashing)
    User.register(newUser, password, (err, user) => {
      if (err) {
        console.error(err);
        return res.render('auth/register', { error: err.message });
      }
      
      // Log user in after registration
      passport.authenticate('local')(req, res, () => {
        if (user.category === 'observer') {
          res.redirect('/observation/dashboard');
        } else {
          res.redirect('/admin/dashboard');
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.render('auth/register', { error: 'Registration failed. Please try again.' });
  }
});

// Login page - GET
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Login - POST
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {
  // Redirect based on user category
  if (req.user.category === 'observer') {
    res.redirect('/observation/dashboard');
  } else {
    res.redirect('/admin/dashboard');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
