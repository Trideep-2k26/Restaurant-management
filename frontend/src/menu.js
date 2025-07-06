const express = require('express');
const { body, validationResult } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const { auth, checkRestaurantOwnership } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();


router.get('/', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    const query = { restaurant: req.user.restaurant._id };
    

    if (category && category !== 'all') {
      query.category = category;
    }
    
   
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const items = await MenuItem.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name');

    const total = await MenuItem.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalItems: total
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:id', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const item = await MenuItem.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant._id
    }).populate('createdBy', 'name');

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/', auth, checkRestaurantOwnership, [
  body('name').trim().notEmpty().withMessage('Menu item name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('currency').optional().isIn(['USD', 'EUR', 'INR']).withMessage('Invalid currency'),
  body('category').isIn(['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Salads', 'Soups', 'Specials', 'Other']).withMessage('Invalid category'),
  body('description').optional().trim(),
  body('ingredients').optional().isArray(),
  body('allergens').optional().isArray(),
  body('dietary').optional().isArray(),
  body('spicyLevel').optional().isInt({ min: 0, max: 5 }),
  body('preparationTime').optional().isInt({ min: 0 }),
  body('calories').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      currency,
      category,
      ingredients,
      allergens,
      dietary,
      isSpicy,
      spicyLevel,
      preparationTime,
      calories
    } = req.body;

    const menuItem = new MenuItem({
      name,
      description,
      price,
      currency: currency || 'USD',
      category,
      ingredients: ingredients || [],
      allergens: allergens || [],
      dietary: dietary || [],
      isSpicy: isSpicy || false,
      spicyLevel: spicyLevel || 0,
      preparationTime,
      calories,
      restaurant: req.user.restaurant._id,
      createdBy: req.user.id
    });

    await menuItem.save();

    const populatedItem = await MenuItem.findById(menuItem._id).populate('createdBy', 'name');

    res.status(201).json({
      message: 'Menu item created successfully',
      item: populatedItem
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, checkRestaurantOwnership, [
  body('name').trim().notEmpty().withMessage('Menu item name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('currency').optional().isIn(['USD', 'EUR', 'INR']).withMessage('Invalid currency'),
  body('category').isIn(['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Salads', 'Soups', 'Specials', 'Other']).withMessage('Invalid category'),
  body('description').optional().trim(),
  body('ingredients').optional().isArray(),
  body('allergens').optional().isArray(),
  body('dietary').optional().isArray(),
  body('spicyLevel').optional().isInt({ min: 0, max: 5 }),
  body('preparationTime').optional().isInt({ min: 0 }),
  body('calories').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      currency,
      category,
      ingredients,
      allergens,
      dietary,
      isAvailable,
      isSpicy,
      spicyLevel,
      preparationTime,
      calories
    } = req.body;

    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, restaurant: req.user.restaurant._id },
      {
        name,
        description,
        price,
        currency: currency || 'USD',
        category,
        ingredients: ingredients || [],
        allergens: allergens || [],
        dietary: dietary || [],
        isAvailable,
        isSpicy: isSpicy || false,
        spicyLevel: spicyLevel || 0,
        preparationTime,
        calories
      },
      { new: true }
    ).populate('createdBy', 'name');

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({
      message: 'Menu item updated successfully',
      item: menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/:id', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const menuItem = await MenuItem.findOneAndDelete({
      _id: req.params.id,
      restaurant: req.user.restaurant._id
    });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/:id/upload-image', auth, checkRestaurantOwnership, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, restaurant: req.user.restaurant._id },
      { image: imageUrl },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.patch('/:id/toggle-availability', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant._id
    });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    res.json({
      message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`,
      item: menuItem
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/categories/list', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category', {
      restaurant: req.user.restaurant._id
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/search/suggestions', auth, checkRestaurantOwnership, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const suggestions = await MenuItem.find({
      restaurant: req.user.restaurant._id,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { ingredients: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .select('name')
    .limit(5);

    res.json(suggestions.map(item => item.name));
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;