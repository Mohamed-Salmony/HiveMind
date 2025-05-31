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

// Support middleware - checks if user is support personnel
const isSupport = (req, res, next) => {
  if (req.user && req.user.category === 'support') {
    return next();
  }
  res.redirect('/');
};

// Active account middleware - checks if user account is active
const isActive = (req, res, next) => {
  if (req.user && req.user.accountStatus === 'active') {
    return next();
  }
  res.render('auth/account-status', { 
    user: req.user,
    status: req.user.accountStatus
  });
};

module.exports = {
  isLoggedIn,
  isObserver,
  isSupport,
  isActive
};
