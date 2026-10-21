/* ============================================
   ROAMLY — Write/Edit Review Page
   ============================================ */

let selectedRating = 0;
let editingReviewId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  if (!requireAuth()) return;

  const params = new URLSearchParams(window.location.search);
  editingReviewId = params.get('edit');
  const preselectedDest = params.get('destination');

  loadDestinationOptions(preselectedDest);
  initStarInput();
  initCharCounter();
  initForm();

  if (editingReviewId) {
    loadReviewForEdit(editingReviewId);
    document.getElementById('review-form-title').textContent = 'Edit Your Review';
    document.getElementById('review-submit-btn').textContent = 'Update Review';
  }
});

async function loadDestinationOptions(preselected) {
  const select = document.getElementById('review-destination');
  if (!select) return;

  try {
    const data = await api.get('/destinations?limit=100');
    data.data.forEach(d => {
      const option = document.createElement('option');
      option.value = d._id;
      option.textContent = `${d.name} — ${d.city}, ${d.state}`;
      if (preselected && d._id === preselected) option.selected = true;
      select.appendChild(option);
    });
  } catch (error) {
    toast.error('Unable to load destinations.');
  }
}

function initStarInput() {
  const container = document.getElementById('star-input');
  if (!container) return;

  for (let i = 5; i >= 1; i--) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'star-input__star';
    btn.dataset.rating = i;
    btn.textContent = '★';
    btn.setAttribute('aria-label', `${i} star${i > 1 ? 's' : ''}`);
    btn.addEventListener('click', () => setRating(i));
    container.appendChild(btn);
  }
}

function setRating(rating) {
  selectedRating = rating;
  document.querySelectorAll('.star-input__star').forEach(star => {
    const val = parseInt(star.dataset.rating);
    star.classList.toggle('star-input__star--active', val <= rating);
  });
  document.getElementById('rating-value').textContent = `${rating}/5`;
}

function initCharCounter() {
  const textarea = document.getElementById('review-comment');
  const counter = document.getElementById('comment-counter');
  if (!textarea || !counter) return;

  textarea.addEventListener('input', () => {
    counter.textContent = `${textarea.value.length}/2000`;
  });
}

function initForm() {
  const form = document.getElementById('review-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const destination = document.getElementById('review-destination').value;
    const title = document.getElementById('review-title').value.trim();
    const comment = document.getElementById('review-comment').value.trim();
    const visitDate = document.getElementById('review-visit-date').value;
    const submitBtn = document.getElementById('review-submit-btn');

    // Validation
    if (!destination) { toast.error('Please select a destination.'); return; }
    if (!selectedRating) { toast.error('Please select a rating.'); return; }
    if (!title) { toast.error('Please enter a review title.'); return; }
    if (!comment) { toast.error('Please enter your review.'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = editingReviewId ? 'Updating...' : 'Submitting...';

    try {
      const body = { rating: selectedRating, title, comment, visitDate: visitDate || null };

      if (editingReviewId) {
        await api.put(`/reviews/${editingReviewId}`, body);
        toast.success('Review updated successfully!');
      } else {
        await api.post(`/destinations/${destination}/reviews`, body);
        toast.success('Review submitted successfully!');
      }

      setTimeout(() => {
        window.location.href = `/destination.html?id=${destination}`;
      }, 1000);
    } catch (error) {
      toast.error(error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = editingReviewId ? 'Update Review' : 'Submit Review';
    }
  });
}

async function loadReviewForEdit(reviewId) {
  try {
    let review;
    try {
      const res = await api.get(`/reviews/${reviewId}`);
      review = res.data;
    } catch (_) {
      const data = await api.get('/reviews/mine');
      review = data.data.find(r => r._id === reviewId);
    }

    if (!review) {
      toast.error('Review not found.');
      setTimeout(() => window.location.href = '/profile.html', 1000);
      return;
    }

    document.getElementById('review-destination').value = review.destination._id || review.destination;
    document.getElementById('review-destination').disabled = true;
    document.getElementById('review-title').value = review.title;
    document.getElementById('review-comment').value = review.comment;
    document.getElementById('comment-counter').textContent = `${review.comment.length}/2000`;

    if (review.visitDate) {
      document.getElementById('review-visit-date').value = review.visitDate.split('T')[0];
    }

    setRating(review.rating);
  } catch (error) {
    toast.error('Unable to load review for editing.');
  }
}
