const express = require('express');
const { body, validationResult } = require('express-validator');
const Restaurant = require('../models/Restaurant');
const { auth, checkRestaurantOwnership } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/profile', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.restaurant._id).populate('owner', 'name email');
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Get restaurant profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/profile', auth, checkRestaurantOwnership, [
  body('name').trim().notEmpty().withMessage('Restaurant name is required'),
  body('description').optional().trim(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim(),
  body('contact.phone').optional().trim(),
  body('contact.email').optional().isEmail().withMessage('Please provide a valid email'),
  body('contact.website').optional().trim(),
  body('cuisine').optional().isIn(['Italian', 'Chinese', 'Indian', 'Mexican', 'American', 'Thai', 'French', 'Japanese', 'Mediterranean', 'Other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      address,
      contact,
      cuisine,
      settings
    } = req.body;

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.user.restaurant._id,
      {
        name,
        description,
        address,
        contact,
        cuisine,
        settings
      },
      { new: true }
    ).populate('owner', 'name email');

    res.json({
      message: 'Restaurant profile updated successfully',
      restaurant: updatedRestaurant
    });
  } catch (error) {
    console.error('Update restaurant profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/upload-logo', auth, checkRestaurantOwnership, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const logoUrl = `/uploads/${req.file.filename}`;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.user.restaurant._id,
      { logo: logoUrl },
      { new: true }
    );

    res.json({
      message: 'Logo uploaded successfully',
      logoUrl: logoUrl
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/stats', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const MenuItem = require('../models/MenuItem');
    
    const stats = await MenuItem.aggregate([
      { $match: { restaurant: req.user.restaurant._id } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          availableItems: { $sum: { $cond: ['$isAvailable', 1, 0] } },
          avgPrice: { $avg: '$price' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    const categoryStats = await MenuItem.aggregate([
      { $match: { restaurant: req.user.restaurant._id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: stats[0] || {
        totalItems: 0,
        availableItems: 0,
        avgPrice: 0,
        categories: []
      },
      categoryBreakdown: categoryStats
    });
  } catch (error) {
    console.error('Get restaurant stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;