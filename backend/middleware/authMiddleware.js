const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const { findUserById } = require('../services/authService');

// Required authentication middleware
const protect = async (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Please sign in to access this feature.' });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }

  try {
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication verification failed.' });
  }
};

// Optional authentication middleware (for guest or logged-in users)
const optionalAuth = async (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    req.user = null;
    return next();
  }

  try {
    const user = await findUserById(decoded.id);
    req.user = user || null;
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = {
  protect,
  optionalAuth
};
