const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const { User, Destination, Review } = require('./models');
const {
  protect,
  adminOnly,
  registerValidation,
  loginValidation,
  reviewValidation,
  destinationValidation,
  profileUpdateValidation
} = require('./middleware');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode)
    .cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });
};

/* ==========================================================================
   1. AUTHENTICATION ROUTES (/api/auth)
   ========================================================================== */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' }
});

router.post('/auth/register', authLimiter, registerValidation, async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { username: username.toLowerCase() }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email or username already exists.' });
    }
    const user = await User.create({ name, username, email, password });
    sendTokenResponse(user, 201, res);
  } catch (err) { next(err); }
});

router.post('/auth/login', authLimiter, loginValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been suspended.' });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
});

router.post('/auth/logout', (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.get('/auth/me', protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      profileImage: req.user.profileImage,
      createdAt: req.user.createdAt
    }
  });
});

/* ==========================================================================
   2. DESTINATION ROUTES (/api/destinations)
   ========================================================================== */
router.get('/destinations', async (req, res, next) => {
  try {
    const { search, category, minRating, sort, page = 1, limit = 12, featured } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };
    if (featured === 'true') query.isFeatured = true;

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    if (sort === 'reviews') sortOption = { reviewCount: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Destination.countDocuments(query);
    const destinations = await Destination.find(query).sort(sortOption).skip(skip).limit(parseInt(limit));

    res.json({
      success: true,
      data: destinations,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) }
    });
  } catch (err) { next(err); }
});

router.get('/destinations/categories', async (req, res, next) => {
  try {
    const categories = await Destination.distinct('category');
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
});

router.get('/destinations/:id', async (req, res, next) => {
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
  } catch (err) { next(err); }
});

router.post('/destinations', protect, adminOnly, destinationValidation, async (req, res, next) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json({ success: true, data: destination });
  } catch (err) { next(err); }
});

router.put('/destinations/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!destination) return res.status(404).json({ success: false, message: 'Destination not found.' });
    res.json({ success: true, data: destination });
  } catch (err) { next(err); }
});

router.delete('/destinations/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ success: false, message: 'Destination not found.' });
    await Review.deleteMany({ destination: req.params.id });
    await Destination.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Destination and its reviews deleted.' });
  } catch (err) { next(err); }
});

/* --- Destination Reviews Sub-resource --- */
router.get('/destinations/:id/reviews', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    let destinationId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      const dest = await Destination.findOne({ slug: destinationId });
      if (!dest) return res.status(404).json({ success: false, message: 'Destination not found.' });
      destinationId = dest._id;
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

    const distribution = await Review.aggregate([
      { $match: { destination: new mongoose.Types.ObjectId(destinationId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distribution.forEach(d => { ratingDistribution[d._id] = d.count; });

    res.json({
      success: true,
      data: reviews,
      ratingDistribution,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) }
    });
  } catch (err) { next(err); }
});

router.post('/destinations/:id/reviews', protect, reviewValidation, async (req, res, next) => {
  try {
    let destinationId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      const dest = await Destination.findOne({ slug: destinationId });
      if (!dest) return res.status(404).json({ success: false, message: 'Destination not found.' });
      destinationId = dest._id;
    }

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
  } catch (err) { next(err); }
});

/* ==========================================================================
   3. REVIEW DIRECT ROUTES (/api/reviews)
   ========================================================================== */
router.get('/reviews/mine', protect, async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('destination', 'name slug city state images')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
});

router.get('/reviews/:id', async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name username profileImage')
      .populate('destination', 'name slug city state images');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, data: review });
  } catch (err) { next(err); }
});

router.put('/reviews/:id', protect, reviewValidation, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this review.' });
    }

    review.rating = req.body.rating || review.rating;
    review.title = req.body.title || review.title;
    review.comment = req.body.comment || review.comment;
    if (req.body.visitDate !== undefined) review.visitDate = req.body.visitDate;
    await review.save();

    const populated = await review.populate('user', 'name username profileImage');
    res.json({ success: true, data: populated });
  } catch (err) { next(err); }
});

router.delete('/reviews/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review.' });
    }
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) { next(err); }
});

router.post('/reviews/:id/helpful', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    const alreadyVoted = review.helpfulVoters.includes(req.user._id);
    if (alreadyVoted) {
      review.helpfulVoters.pull(req.user._id);
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      review.helpfulVoters.push(req.user._id);
      review.helpfulVotes += 1;
    }
    await review.save();
    res.json({ success: true, data: { helpfulVotes: review.helpfulVotes, voted: !alreadyVoted } });
  } catch (err) { next(err); }
});

/* ==========================================================================
   4. USER PROFILE ROUTES (/api/users)
   ========================================================================== */
router.get('/users/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.put('/users/me', protect, profileUpdateValidation, async (req, res, next) => {
  try {
    const { name, username } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (username && username.toLowerCase() !== req.user.username) {
      const existing = await User.findOne({ username: username.toLowerCase(), _id: { $ne: req.user._id } });
      if (existing) return res.status(400).json({ success: false, message: 'Username is already taken.' });
      updateData.username = username.toLowerCase();
    }
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { returnDocument: 'after', runValidators: true });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

/* ==========================================================================
   5. ADMIN ROUTES (/api/admin)
   ========================================================================== */
router.get('/admin/stats', protect, adminOnly, async (req, res, next) => {
  try {
    const [totalDestinations, totalUsers, totalReviews, avgResult] = await Promise.all([
      Destination.countDocuments(),
      User.countDocuments(),
      Review.countDocuments(),
      Destination.aggregate([
        { $match: { reviewCount: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$averageRating' } } }
      ])
    ]);
    const averageRating = avgResult.length ? Math.round(avgResult[0].avg * 10) / 10 : 0;
    res.json({ success: true, data: { totalDestinations, totalUsers, totalReviews, averageRating } });
  } catch (err) { next(err); }
});

router.get('/admin/users', protect, adminOnly, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments();
    const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ success: true, data: users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
});

router.put('/admin/users/:id/toggle-status', protect, adminOnly, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot change admin status.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.get('/admin/reviews', protect, adminOnly, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Review.countDocuments();
    const reviews = await Review.find()
      .populate('user', 'name username email')
      .populate('destination', 'name city state')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({ success: true, data: reviews, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
});

router.delete('/admin/reviews/:id', protect, adminOnly, async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) { next(err); }
});

module.exports = router;
