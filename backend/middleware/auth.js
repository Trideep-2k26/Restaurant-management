const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('restaurant');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};


const checkRestaurantOwnership = async (req, res, next) => {
  try {
    if (!req.user.restaurant) {
      return res.status(403).json({ message: 'No restaurant associated with this user' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const checkAdminRole = (req, res, next) => {
  if (req.user.role !== 'owner' && req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required' });
  }
  next();
};

module.exports = { auth, checkRestaurantOwnership, checkAdminRole };