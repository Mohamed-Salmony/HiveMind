const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize Express app
const app = express();
const port = 3000;

// Configure middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure session
app.use(session({
  secret: 'hivemind-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB (will be configured in dbconfig.js)
require('./config/dbconfig');

// Configure Passport (will be set up in passport.js)
require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const observerRoutes = require('./routes/observer');
const supportRoutes = require('./routes/support');
const messageRoutes = require('./routes/message');

// Use routes
app.use('/', authRoutes);
app.use('/account', userRoutes);
app.use('/observation', observerRoutes);
app.use('/admin', supportRoutes);
app.use('/messages', messageRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

// Start server
app.listen(port, () => {
  console.log(`HiveMind app listening at http://localhost:${port}`);
});

module.exports = app;
