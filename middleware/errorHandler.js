const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'FirebaseAuthError') {
    return res.status(401).json({
      success: false,
      message: 'Firebase authentication failed',
      error: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
};

module.exports = errorHandler; 