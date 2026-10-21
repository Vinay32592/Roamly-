const Destination = require('../models/Destination');
const Review = require('../models/Review');
const mongoose = require('mongoose');

// Get all destinations with search, filter, sort, pagination
exports.getDestinations = async (req, res, next) => {
  try {
    const { search, category, minRating, sort, page = 1, limit = 12, featured } = req.query;
    const query = {};

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Minimum rating filter
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    switch (sort) {
      case 'rating': sortOption = { averageRating: -1 }; break;
      case 'reviews': sortOption = { reviewCount: -1 }; break;
      case 'name': sortOption = { name: 1 }; break;
      case 'newest': sortOption = { createdAt: -1 }; break;
      default: break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Destination.countDocuments(query);
    const destinations = await Destination.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: destinations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single destination
exports.getDestination = async (req, res, next) => {
  try {
    let destination;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      destination = await Destination.findById(req.params.id);
    }
    if (!destination) {
      destination = await Destination.findOne({ slug: req.params.id });
    }
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }
    res.json({ success: true, data: destination });
  } catch (error) {
    next(error);
  }
};

// Create destination (admin)
exports.createDestination = async (req, res, next) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json({ success: true, data: destination });
  } catch (error) {
    next(error);
  }
};

// Update destination (admin)
exports.updateDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }
    res.json({ success: true, data: destination });
  } catch (error) {
    next(error);
  }
};

// Delete destination (admin)
exports.deleteDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }

    // Delete all reviews for this destination
    await Review.deleteMany({ destination: req.params.id });
    await Destination.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Destination and its reviews deleted.' });
  } catch (error) {
    next(error);
  }
};

// Get categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Destination.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};
