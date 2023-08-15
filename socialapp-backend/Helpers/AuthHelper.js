const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const dbConfig = require('../config/secret');

module.exports = {
  VerifyToken: (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'No Authorization' });
    }
    const token = req.cookies.auth || req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(500).json({ message: 'No token provided' });
    }

    return jwt.verify(token, dbConfig.secret, (err, decoded) => {
      if (err) {
        console.error('Token verification error:', err); // Add this line for error logging
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            message: 'Token has expired. Please login again',
            token: null,
          });
        } else {
          return res.status(401).json({
            message: 'Token verification failed. Please login again',
            token: null,
          });
        }
      }
      req.user = decoded.data;
      next(); // Only call next() here, when token is successfully verified
    });
  },
};
