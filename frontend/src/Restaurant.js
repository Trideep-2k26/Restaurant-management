const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  cuisine: {
    type: String,
    enum: ['Italian', 'Chinese', 'Indian', 'Mexican', 'American', 'Thai', 'French', 'Japanese', 'Mediterranean', 'Other'],
    default: 'Other'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  logo: {
    type: String, 
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    currency: {
      type: String,
      default: 'USD'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);