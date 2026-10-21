const Review = require('../models/Review');
const Destination = require('../models/Destination');
const mongoose = require('mongoose');

// Get reviews for a destination
exports.getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    let destinationId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      const dest = await Destination.findOne({ slug: destinationId });
      if (!dest) {
        return res.status(404).json({ success: false, message: 'Destination not found.' });
      }
      destinationId = dest._id;
    } else {
      destinationId = new mongoose.Types.ObjectId(destinationId);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'helpful') sortOption = { helpfulVotes: -1 };
    if (sort === 'rating_high') sortOption = { rating: -1 };
    if (sort === 'rating_low') sortOption = { rating: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Review.countDocuments({ destination: destinationId });

    const reviews = await Review.find({ destination: destinationId })
      .populate('user', 'name username profileImage')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Get rating distribution
    const distribution = await Review.aggregate([
      { $match: { destination: destinationId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distribution.forEach(d => { ratingDistribution[d._id] = d.count; });

    res.json({
      success: true,
      data: reviews,
      ratingDistribution,
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

// Create review
exports.createReview = async (req, res, next) => {
  try {
    let destinationId = req.params.id || req.body.destination;

    // Resolve slug if needed
    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      const dest = await Destination.findOne({ slug: destinationId });
      if (!dest) {
        return res.status(404).json({ success: false, message: 'Destination not found.' });
      }
      destinationId = dest._id;
    }

    // Check destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }

    // Check for duplicate review
    const existing = await Review.findOne({ user: req.user._id, destination: destinationId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this destination.' });
    }

    const review = await Review.create({
      user: req.user._id,
      destination: destinationId,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      visitDate: req.body.visitDate || null
    });

    const populated = await review.populate('user', 'name username profileImage');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// Update review
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review.' });
    }

    review.rating = req.body.rating || review.rating;
    review.title = req.body.title || review.title;
    review.comment = req.body.comment || review.comment;
    review.visitDate = req.body.visitDate !== undefined ? req.body.visitDate : review.visitDate;

    await review.save();
    const populated = await review.populate('user', 'name username profileImage');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// Delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review.' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};

// Vote review as helpful
exports.voteHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Check if user already voted
    const alreadyVoted = review.helpfulVoters.includes(req.user._id);
    if (alreadyVoted) {
      // Remove vote (toggle)
      review.helpfulVoters.pull(req.user._id);
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      review.helpfulVoters.push(req.user._id);
      review.helpfulVotes += 1;
    }

    await review.save();
    res.json({ success: true, data: { helpfulVotes: review.helpfulVotes, voted: !alreadyVoted } });
  } catch (error) {
    next(error);
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('destination', 'name slug city state images')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};
