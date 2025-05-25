const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: '5000000h', // ⚠️ You might want to use a shorter expiry for security
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: '700000000d',
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};