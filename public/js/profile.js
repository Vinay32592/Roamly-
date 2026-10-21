/* ============================================
   ROAMLY — Profile Page
   ============================================ */

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  if (!requireAuth()) return;
  loadProfile();
  loadUserReviews();
  initProfileForm();
  initTabs();
});

function loadProfile() {
  if (!currentUser) return;

  const avatar = document.getElementById('profile-avatar');
  const name = document.getElementById('profile-name');
  const username = document.getElementById('profile-username');
  const joined = document.getElementById('profile-joined');

  if (avatar) avatar.textContent = getInitials(currentUser.name);
  if (name) name.textContent = currentUser.name;
  if (username) username.textContent = `@${currentUser.username}`;
  if (joined) joined.textContent = `Member since ${formatDate(currentUser.createdAt)}`;

  // Form values
  const nameInput = document.getElementById('edit-name');
  const usernameInput = document.getElementById('edit-username');
  if (nameInput) nameInput.value = currentUser.name;
  if (usernameInput) usernameInput.value = currentUser.username;
}

async function loadUserReviews() {
  const container = document.getElementById('user-reviews');
  const countEl = document.getElementById('review-count');
  if (!container) return;

  showLoading(container);

  try {
    const data = await api.get('/reviews/mine');
    if (countEl) countEl.textContent = data.data.length;

    if (data.data.length === 0) {
      showEmpty(container, 'No reviews yet', 'Share your travel experiences by writing your first review.');
      return;
    }

    container.innerHTML = data.data.map(r => `
      <div class="review-card">
        <div class="review-card__header">
          <div>
            <a href="/destination.html?id=${r.destination._id || r.destination}" style="font-weight: 600; font-size: var(--text-sm);">
              ${r.destination.name || 'Destination'}
            </a>
            <div class="review-card__date">${r.destination.city || ''}, ${r.destination.state || ''} · ${formatDate(r.createdAt)}</div>
          </div>
          <div style="margin-left: auto;">${renderStars(r.rating, false)}</div>
        </div>
        <h4 class="review-card__title">${r.title}</h4>
        <p class="review-card__text">${r.comment}</p>
        <div class="review-card__footer">
          <span style="font-size: var(--text-xs); color: var(--color-charcoal-light);">👍 ${r.helpfulVotes || 0} helpful</span>
          <div class="review-card__actions">
            <button class="review-card__action-btn" onclick="window.location.href='/write-review.html?edit=${r._id}'">Edit</button>
            <button class="review-card__action-btn review-card__action-btn--delete" onclick="deleteMyReview('${r._id}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = '<p style="color:var(--color-charcoal-light);text-align:center;">Unable to load reviews.</p>';
  }
}

async function deleteMyReview(reviewId) {
  const confirmed = await showConfirm('Delete Review', 'Are you sure you want to delete this review?');
  if (!confirmed) return;

  try {
    await api.delete(`/reviews/${reviewId}`);
    toast.success('Review deleted.');
    loadUserReviews();
  } catch (error) {
    toast.error(error.message);
  }
}

window.deleteMyReview = deleteMyReview;

function initProfileForm() {
  const form = document.getElementById('profile-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('edit-name').value.trim();
    const username = document.getElementById('edit-username').value.trim();
    const btn = form.querySelector('button[type="submit"]');

    if (!name) { toast.error('Name is required.'); return; }
    if (!username) { toast.error('Username is required.'); return; }

    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      await api.put('/users/me', { name, username });
      toast.success('Profile updated.');
      await checkAuth();
      loadProfile();
    } catch (error) {
      toast.error(error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Changes';
    }
  });
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('tab-panel--active'));
      btn.classList.add('tab-btn--active');
      document.getElementById(btn.dataset.tab).classList.add('tab-panel--active');
    });
  });
}
