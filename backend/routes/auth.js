const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { auth } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};


router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('restaurantName').trim().notEmpty().withMessage('Restaurant name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, restaurantName, restaurantDescription } = req.body;

  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

   
    const user = new User({
      name,
      email,
      password,
      role: 'owner'
    });

    await user.save();

    
    const restaurant = new Restaurant({
      name: restaurantName,
      description: restaurantDescription,
      owner: user._id
    });

    await restaurant.save();

    user.restaurant = restaurant._id;
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurant: {
          id: restaurant._id,
          name: restaurant.name
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;


    const user = await User.findOne({ email }).populate('restaurant');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }


    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

   
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurant: user.restaurant ? {
          id: user.restaurant._id,
          name: user.restaurant.name
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('restaurant');
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurant: user.restaurant ? {
        id: user.restaurant._id,
        name: user.restaurant.name,
        description: user.restaurant.description
      } : null
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/profile', auth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;

    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    ).populate('restaurant');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurant: user.restaurant ? {
          id: user.restaurant._id,
          name: user.restaurant.name
        } : null
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;