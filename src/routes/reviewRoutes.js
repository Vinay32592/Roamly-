const express = require('express');
const router = express.Router();
const { getReview, updateReview, deleteReview, voteHelpful, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { reviewValidation } = require('../middleware/validators');

router.get('/mine', protect, getUserReviews);
router.get('/:id', getReview);
router.put('/:id', protect, reviewValidation, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, voteHelpful);

module.exports = router;
