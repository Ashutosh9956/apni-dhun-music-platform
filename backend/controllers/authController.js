const {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword
} = require('../services/authService');
const { generateToken, getCookieOptions } = require('../utils/jwt');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const user = await registerUser({ name, email, password });
    const userId = user.id || user._id.toString();

    const token = generateToken({ id: userId, email: user.email });
    res.cookie('token', token, getCookieOptions(false));

    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: userId,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const user = await loginUser({ email, password });
    const userId = user.id || user._id.toString();

    const token = generateToken({ id: userId, email: user.email });
    res.cookie('token', token, getCookieOptions(Boolean(remember)));

    return res.status(200).json({
      message: 'Signed in successfully.',
      user: {
        id: userId,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
};

// @desc    Get current user session
// @route   GET /api/auth/me
// @access  Public (returns null if unauthenticated)
const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(200).json({ user: null });
    }

    return res.status(200).json({
      user: {
        id: req.user.id || req.user._id?.toString(),
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log out current user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res.status(200).json({ message: 'You have signed out.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please provide your account email.' });
    }

    const { resetToken } = await requestPasswordReset(email);

    return res.status(200).json({
      resetToken,
      message: 'Password reset token generated. Please enter your new password.'
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const handleResetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Reset token and new password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    await resetPassword(token, password);

    return res.status(200).json({
      message: 'Password reset successful! Please sign in with your new password.'
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  forgotPassword,
  handleResetPassword
};
