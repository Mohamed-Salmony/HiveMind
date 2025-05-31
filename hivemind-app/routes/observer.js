const express = require('express');
const router = express.Router();
const Observation = require('../models/observation');
const User = require('../models/user');

// Authentication middleware
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Observer middleware - checks if user is an observer
const isObserver = (req, res, next) => {
  if (req.user && req.user.category === 'observer') {
    return next();
  }
  res.redirect('/');
};

// Observer dashboard - GET
router.get('/dashboard', isLoggedIn, isObserver, async (req, res) => {
  try {
    // Get recent observations by this observer
    const observations = await Observation.find({ observer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.render('observer/dashboard', { 
      user: req.user, 
      observations: observations 
    });
  } catch (error) {
    console.error(error);
    res.render('observer/dashboard', { 
      user: req.user, 
      observations: [],
      error: 'Failed to load observations.'
    });
  }
});

// New observation form - GET
router.get('/new', isLoggedIn, isObserver, (req, res) => {
  res.render('observer/new-observation', { user: req.user });
});

// Submit new observation - POST
router.post('/new', isLoggedIn, isObserver, async (req, res) => {
  try {
    const {
      date, time, timeZoneOffset,
      w3w, latitude, longitude,
      freeSpacePathLoss, bitErrorRate,
      temperature, humidity, snowfall,
      windSpeed, windDirection,
      precipitation, haze, notes
    } = req.body;
    
    // Create new observation
    const newObservation = new Observation({
      observer: req.user._id,
      date,
      time,
      timeZoneOffset,
      coordinates: {
        w3w,
        decimalDegrees: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      },
      freeSpacePathLoss: parseFloat(freeSpacePathLoss),
      bitErrorRate: parseFloat(bitErrorRate),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      snowfall: parseFloat(snowfall),
      windSpeed: parseFloat(windSpeed),
      windDirection: parseFloat(windDirection),
      precipitation: parseFloat(precipitation),
      haze: parseFloat(haze),
      notes
    });
    
    await newObservation.save();
    res.redirect('/observation/dashboard');
  } catch (error) {
    console.error(error);
    res.render('observer/new-observation', { 
      user: req.user, 
      error: 'Failed to save observation. Please try again.'
    });
  }
});

// View observation history - GET
router.get('/history', isLoggedIn, isObserver, async (req, res) => {
  try {
    // Get all observations by this observer
    const observations = await Observation.find({ observer: req.user._id })
      .sort({ date: -1, time: -1 });
    
    res.render('observer/history', { 
      user: req.user, 
      observations: observations 
    });
  } catch (error) {
    console.error(error);
    res.render('observer/history', { 
      user: req.user, 
      observations: [],
      error: 'Failed to load observation history.'
    });
  }
});

// View specific observation - GET
router.get('/:id', isLoggedIn, isObserver, async (req, res) => {
  try {
    const observation = await Observation.findById(req.params.id);
    
    // Check if observation exists and belongs to the current user
    if (!observation || observation.observer.toString() !== req.user._id.toString()) {
      return res.redirect('/observation/dashboard');
    }
    
    res.render('observer/view-observation', { 
      user: req.user, 
      observation: observation 
    });
  } catch (error) {
    console.error(error);
    res.redirect('/observation/dashboard');
  }
});

module.exports = router;
