const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validationRules = {
  menuItem: {
    name: (field = 'name') => ({
      [field]: {
        trim: true,
        notEmpty: {
          errorMessage: 'Name is required'
        },
        isLength: {
          options: { min: 2, max: 100 },
          errorMessage: 'Name must be between 2 and 100 characters'
        }
      }
    }),
    
    price: (field = 'price') => ({
      [field]: {
        isFloat: {
          options: { min: 0 },
          errorMessage: 'Price must be a positive number'
        },
        toFloat: true
      }
    }),
    
    category: (field = 'category') => ({
      [field]: {
        isIn: {
          options: [['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Salads', 'Soups', 'Specials', 'Other']],
          errorMessage: 'Invalid category'
        }
      }
    })
  },
  
  restaurant: {
    name: (field = 'name') => ({
      [field]: {
        trim: true,
        notEmpty: {
          errorMessage: 'Restaurant name is required'
        },
        isLength: {
          options: { min: 2, max: 100 },
          errorMessage: 'Restaurant name must be between 2 and 100 characters'
        }
      }
    }),
    
    email: (field = 'email') => ({
      [field]: {
        optional: true,
        isEmail: {
          errorMessage: 'Please provide a valid email address'
        },
        normalizeEmail: true
      }
    }),
    
    phone: (field = 'phone') => ({
      [field]: {
        optional: true,
        isMobilePhone: {
          errorMessage: 'Please provide a valid phone number'
        }
      }
    })
  },
  
  user: {
    email: (field = 'email') => ({
      [field]: {
        isEmail: {
          errorMessage: 'Please provide a valid email address'
        },
        normalizeEmail: true
      }
    }),
    
    password: (field = 'password') => ({
      [field]: {
        isLength: {
          options: { min: 6 },
          errorMessage: 'Password must be at least 6 characters long'
        }
      }
    }),
    
    name: (field = 'name') => ({
      [field]: {
        trim: true,
        notEmpty: {
          errorMessage: 'Name is required'
        },
        isLength: {
          options: { min: 2, max: 50 },
          errorMessage: 'Name must be between 2 and 50 characters'
        }
      }
    })
  }
};

module.exports = {
  handleValidationErrors,
  validationRules
};