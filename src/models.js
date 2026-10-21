const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

/* ==========================================================================
   1. USER MODEL
   ========================================================================== */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profileImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* ==========================================================================
   2. DESTINATION MODEL
   ========================================================================== */
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
    default: 'India'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Mountains', 'Beaches', 'Historical', 'Nature & Wildlife',
      'Spiritual', 'Adventure', 'Hill Stations', 'Heritage', 'Urban'
    ]
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
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
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

destinationSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

destinationSchema.index({ name: 'text', city: 'text', state: 'text', description: 'text' });
destinationSchema.index({ category: 1, averageRating: -1 });

/* ==========================================================================
   3. REVIEW MODEL
   ========================================================================== */
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  visitDate: {
    type: Date
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  helpfulVoters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

reviewSchema.index({ user: 1, destination: 1 }, { unique: true });
reviewSchema.index({ destination: 1, createdAt: -1 });

reviewSchema.statics.calcAverageRating = async function (destinationId) {
  const Destination = mongoose.model('Destination');
  const stats = await this.aggregate([
    { $match: { destination: destinationId } },
    {
      $group: {
        _id: '$destination',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Destination.findByIdAndUpdate(destinationId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count
    });
  } else {
    await Destination.findByIdAndUpdate(destinationId, {
      averageRating: 0,
      reviewCount: 0
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRating(this.destination);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.destination);
  }
});

const User = mongoose.model('User', userSchema);
const Destination = mongoose.model('Destination', destinationSchema);
const Review = mongoose.model('Review', reviewSchema);

module.exports = { User, Destination, Review };
