const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Salads', 'Soups', 'Specials', 'Other'],
    default: 'Other'
  },
  image: {
    type: String, 
    default: ''
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    enum: ['Nuts', 'Dairy', 'Gluten', 'Eggs', 'Shellfish', 'Soy', 'Fish', 'Sesame'],
    trim: true
  }],
  dietary: [{
    type: String,
    enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Low-Carb', 'Halal', 'Kosher'],
    trim: true
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isSpicy: {
    type: Boolean,
    default: false
  },
  spicyLevel: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  preparationTime: {
    type: Number, 
    min: 0
  },
  calories: {
    type: Number,
    min: 0
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

menuItemSchema.index({ restaurant: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);