const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');

// In-memory fallback storage if MongoDB is offline
const memoryUsers = [];

// Shared default user configuration prototype
const DEFAULT_USER_SETTINGS = {
  favorites: [],
  theme: 'dark'
};

const isMongoActive = () => getDBStatus().isConnected;

const findUserByEmail = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (isMongoActive()) {
    return User.findOne({ email: normalizedEmail });
  }
  return memoryUsers.find(u => u.email.toLowerCase() === normalizedEmail) || null;
};

const findUserById = async (id) => {
  if (isMongoActive()) {
    try {
      return await User.findById(id);
    } catch {
      return null;
    }
  }
  return memoryUsers.find(u => u.id === id || u._id === id) || null;
};

const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    const error = new Error('An account with that email already exists.');
    error.status = 409;
    throw error;
  }

  if (isMongoActive()) {
    const salt = await bcrypt.genSalt(10);
    const preHashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: preHashedPassword
    });
    await user.save();
    return user;
  }

  // Resilient memory mode
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const memUser = {
    _id: `mem_user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    id: null,
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    favorites: DEFAULT_USER_SETTINGS.favorites,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    createdAt: new Date(),
    async comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    },
    async save() {
      return this;
    }
  };
  memUser.id = memUser._id;
  memoryUsers.push(memUser);
  return memUser;
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  return user;
};

const requestPasswordReset = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    const error = new Error('No account found with that email address.');
    error.status = 404;
    throw error;
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour ISO timestamp

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetExpires;
  await user.save();

  return { resetToken, user };
};

const resetPassword = async (token, newPassword) => {
  let user = null;

  if (isMongoActive()) {
    user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
  } else {
    user = memoryUsers.find(
      u => u.resetPasswordToken === token && u.resetPasswordExpires > Date.now()
    );
  }

  if (!user) {
    const error = new Error('Invalid or expired reset token.');
    error.status = 400;
    throw error;
  }

  if (isMongoActive()) {
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
  } else {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
  }

  return user;
};

module.exports = {
  findUserByEmail,
  findUserById,
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  memoryUsers
};
