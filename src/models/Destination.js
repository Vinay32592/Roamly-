const mongoose = require('mongoose');
const slugify = require('slugify');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true,
    maxlength: [150, 'Name cannot exceed 150 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Mountains', 'Beaches', 'Historical', 'Nature & Wildlife', 'Spiritual', 'Adventure', 'Hill Stations', 'Heritage', 'Urban'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [3000, 'Description cannot exceed 3000 characters']
  },
  images: [{
    type: String
  }],
  bestTimeToVisit: {
    type: String,
    default: ''
  },
  entryFee: {
    type: String,
    default: 'Information not available'
  },
  openingHours: {
    type: String,
    default: 'Information not available'
  },
  accessibility: {
    type: String,
    default: 'Information not available'
  },
  visitorTips: [{
    type: String
  }],
  nearbyAttractions: [{
    type: String
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate slug before saving
destinationSchema.pre('save', function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// Index for search
destinationSchema.index({ name: 'text', city: 'text', state: 'text', description: 'text' });
destinationSchema.index({ category: 1 });
destinationSchema.index({ averageRating: -1 });
destinationSchema.index({ reviewCount: -1 });

module.exports = mongoose.model('Destination', destinationSchema);
