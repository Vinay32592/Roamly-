const express = require('express');
const router = express.Router();
const {
  getDestinations, getDestination, createDestination,
  updateDestination, deleteDestination, getCategories
} = require('../controllers/destinationController');
const { getReviews, createReview } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');
const { destinationValidation, reviewValidation } = require('../middleware/validators');

// Public
router.get('/', getDestinations);
router.get('/categories', getCategories);
router.get('/:id', getDestination);

// Admin CRUD
router.post('/', protect, adminOnly, destinationValidation, createDestination);
router.put('/:id', protect, adminOnly, updateDestination);
router.delete('/:id', protect, adminOnly, deleteDestination);

// Reviews for a destination
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', protect, reviewValidation, createReview);

module.exports = router;
