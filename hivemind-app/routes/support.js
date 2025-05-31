const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Message = require('../models/message');

// Authentication middleware
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Support middleware - checks if user is support personnel
const isSupport = (req, res, next) => {
  if (req.user && req.user.category === 'support') {
    return next();
  }
  res.redirect('/');
};

// Support dashboard - GET
router.get('/dashboard', isLoggedIn, isSupport, async (req, res) => {
  try {
    // Get counts of users by status
    const activeObservers = await User.countDocuments({ 
      category: 'observer', 
      accountStatus: 'active' 
    });
    
    const inactiveObservers = await User.countDocuments({ 
      category: 'observer', 
      accountStatus: 'inactive' 
    });
    
    const suspendedObservers = await User.countDocuments({ 
      category: 'observer', 
      accountStatus: 'suspended' 
    });
    
    // Get recent messages
    const recentMessages = await Message.find({ 
      recipient: req.user._id 
    })
    .sort({ timestamp: -1 })
    .limit(5)
    .populate('sender', 'username forename surname');
    
    res.render('support/dashboard', { 
      user: req.user,
      stats: {
        activeObservers,
        inactiveObservers,
        suspendedObservers,
        totalObservers: activeObservers + inactiveObservers + suspendedObservers
      },
      recentMessages
    });
  } catch (error) {
    console.error(error);
    res.render('support/dashboard', { 
      user: req.user,
      error: 'Failed to load dashboard data.'
    });
  }
});

// List all users - GET
router.get('/users', isLoggedIn, isSupport, async (req, res) => {
  try {
    // Get all observers
    const observers = await User.find({ category: 'observer' })
      .sort({ surname: 1, forename: 1 });
    
    res.render('support/users', { 
      user: req.user, 
      observers: observers 
    });
  } catch (error) {
    console.error(error);
    res.render('support/users', { 
      user: req.user, 
      observers: [],
      error: 'Failed to load users.'
    });
  }
});

// View specific user - GET
router.get('/users/:id', isLoggedIn, isSupport, async (req, res) => {
  try {
    const observer = await User.findById(req.params.id);
    
    // Check if user exists and is an observer
    if (!observer || observer.category !== 'observer') {
      return res.redirect('/admin/users');
    }
    
    res.render('support/view-user', { 
      user: req.user, 
      observer: observer 
    });
  } catch (error) {
    console.error(error);
    res.redirect('/admin/users');
  }
});

// Update user status - POST
router.post('/users/:id', isLoggedIn, isSupport, async (req, res) => {
  try {
    const { accountStatus } = req.body;
    
    // Update user status
    await User.findByIdAndUpdate(req.params.id, { accountStatus });
    
    res.redirect(`/admin/users/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.redirect('/admin/users');
  }
});

// New support user form - GET
router.get('/support/new', isLoggedIn, isSupport, (req, res) => {
  res.render('support/new-support', { user: req.user });
});

// Create new support user - POST
router.post('/support/new', isLoggedIn, isSupport, async (req, res) => {
  try {
    const { username, password, forename, surname, address } = req.body;
    
    // Create new support user
    const newUser = new User({
      username,
      forename,
      surname,
      address,
      category: 'support'
    });
    
    // Register user with passport-local-mongoose
    User.register(newUser, password, (err, user) => {
      if (err) {
        console.error(err);
        return res.render('support/new-support', { 
          user: req.user,
          error: err.message 
        });
      }
      
      res.redirect('/admin/users');
    });
  } catch (error) {
    console.error(error);
    res.render('support/new-support', { 
      user: req.user,
      error: 'Failed to create support user. Please try again.'
    });
  }
});

module.exports = router;
