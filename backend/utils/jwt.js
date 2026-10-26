const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'apni_dhun_super_secret_jwt_key_2026_mood_soundtrack';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const getCookieOptions = (remember = false) => {
  const maxAge = remember
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 24 * 60 * 60 * 1000;      // 1 day

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge
  };
};

module.exports = {
  generateToken,
  verifyToken,
  getCookieOptions
};
