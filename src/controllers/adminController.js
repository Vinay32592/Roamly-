const User = require('../models/User');
const Destination = require('../models/Destination');
const Review = require('../models/Review');

// Dashboard stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalDestinations, totalUsers, totalReviews, avgRatingResult] = await Promise.all([
      Destination.countDocuments(),
      User.countDocuments(),
      Review.countDocuments(),
      Destination.aggregate([
        { $match: { reviewCount: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$averageRating' } } }
      ])
    ]);

    const averageRating = avgRatingResult.length > 0
      ? Math.round(avgRatingResult[0].avg * 10) / 10
      : 0;

    res.json({
      success: true,
      data: { totalDestinations, totalUsers, totalReviews, averageRating }
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot change admin status.' });
    }

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Get all reviews for admin
exports.getReviews = async (req, res, next) => {
  try {
    const { search, destination, page = 1, limit = 20 } = req.query;
    const query = {};

    if (destination) query.destination = destination;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Review.countDocuments(query);

    let reviews = await Review.find(query)
      .populate('user', 'name username email')
      .populate('destination', 'name city state')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // If search, filter populated results
    if (search) {
      const searchLower = search.toLowerCase();
      reviews = reviews.filter(r =>
        (r.title && r.title.toLowerCase().includes(searchLower)) ||
        (r.comment && r.comment.toLowerCase().includes(searchLower)) ||
        (r.user && r.user.name && r.user.name.toLowerCase().includes(searchLower))
      );
    }

    res.json({
      success: true,
      data: reviews,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

// Admin delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};
