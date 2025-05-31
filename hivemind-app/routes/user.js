const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Authentication middleware
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// User account page - GET
router.get('/', isLoggedIn, (req, res) => {
  res.render('user/account', { user: req.user });
});

// Update user account - POST
router.post('/', isLoggedIn, async (req, res) => {
  try {
    const { forename, surname, address } = req.body;
    
    // Update user information
    const user = await User.findById(req.user._id);
    user.forename = forename;
    user.surname = surname;
    user.address = address;
    
    // If user is observer, update additional fields
    if (user.category === 'observer') {
      const { notificationPreference } = req.body;
      user.notificationPreference = notificationPreference;
      
      // If card details are provided, update them
      if (req.body.cardNumber && req.body.cardCVV) {
        await user.setCardDetails(req.body.cardNumber, req.body.cardCVV);
      }
      
      if (req.body.cardName) {
        user.cardName = req.body.cardName;
      }
      
      if (req.body.cardType) {
        user.cardType = req.body.cardType;
      }
    }
    
    await user.save();
    res.redirect('/account');
  } catch (error) {
    console.error(error);
    res.render('user/account', { 
      user: req.user, 
      error: 'Failed to update account. Please try again.' 
    });
  }
});

// Change password page - GET
router.get('/password', isLoggedIn, (req, res) => {
  res.render('user/password', { user: req.user });
});

// Change password - POST
router.post('/password', isLoggedIn, (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  // Check if new passwords match
  if (newPassword !== confirmPassword) {
    return res.render('user/password', { 
      user: req.user, 
      error: 'New passwords do not match.' 
    });
  }
  
  // Change password using passport-local-mongoose
  req.user.changePassword(currentPassword, newPassword, (err) => {
    if (err) {
      console.error(err);
      return res.render('user/password', { 
        user: req.user, 
        error: 'Current password is incorrect.' 
      });
    }
    
    res.redirect('/account');
  });
});

module.exports = router;
