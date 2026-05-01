const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({ message: 'Admin not authorized' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Admin not authorized' });
    }
  }

  return res.status(401).json({ message: 'Admin not authorized, no token' });
};

module.exports = { protectAdmin };
