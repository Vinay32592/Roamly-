/* ==========================================================================
   ROAMLY — Page Logic & Views
   (Home, Explore, Destination Details, Write Review, Profile, Admin)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('featured-destinations')) initHomePage();
  if (document.getElementById('destinations-grid')) initExplorePage();
  if (document.getElementById('dest-content')) initDestinationPage();
  if (document.getElementById('review-form')) initReviewPage();
  if (document.getElementById('profile-form')) initProfilePage();
  if (document.getElementById('admin-destinations')) initAdminPage();
});

/* ==========================================================================
   1. HOME PAGE
   ========================================================================== */
function initHomePage() {
  loadFeaturedDestinations();
  loadRecentlyReviewed();
  initHeroSearch();
  initCategoryCards();
  initNaturalAtmosphere();
}

async function loadFeaturedDestinations() {
  const container = document.getElementById('featured-destinations');
  if (!container) return;
  showLoading(container);
  try {
    const data = await api.get('/destinations?featured=true&limit=6');
    const list = data.data.length ? data.data : (await api.get('/destinations?limit=6&sort=rating')).data;
    container.innerHTML = `<div class="dest-grid">${list.map(renderDestinationCard).join('')}</div>`;
  } catch (error) {
    container.innerHTML = '<p style="text-align:center;color:var(--color-charcoal-light)">Unable to load destinations.</p>';
  }
}

async function loadRecentlyReviewed() {
  const container = document.getElementById('recent-destinations');
  if (!container) return;
  try {
    const data = await api.get('/destinations?sort=newest&limit=4');
    if (data.data.length > 0) {
      container.innerHTML = `<div class="dest-grid">${data.data.map(renderDestinationCard).join('')}</div>`;
    }
  } catch (e) {}
}

function initHeroSearch() {
  const form = document.getElementById('hero-search-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('hero-search-input').value.trim();
    window.location.href = query ? `/explore.html?search=${encodeURIComponent(query)}` : '/explore.html';
  });
}

function initCategoryCards() {
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = card.dataset.category;
      if (cat) window.location.href = `/explore.html?category=${encodeURIComponent(cat)}`;
    });
  });
}

function initNaturalAtmosphere() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
  let height = (canvas.height = canvas.offsetHeight || 540);

  window.addEventListener('resize', () => {
    if (canvas.offsetWidth && canvas.offsetHeight) {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
  });

  const particles = Array.from({ length: 32 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2.2 + 0.8,
    speedY: Math.random() * 0.35 + 0.15,
    speedX: (Math.random() - 0.5) * 0.25,
    opacity: Math.random() * 0.55 + 0.25,
    pulseSpeed: Math.random() * 0.02 + 0.01,
    pulse: Math.random() * Math.PI
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.y -= p.speedY;
      p.x += p.speedX;
      p.pulse += p.pulseSpeed;
      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 235, 195, ${alpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(244, 162, 97, 0.5)';
      ctx.fill();
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/* ==========================================================================
   2. EXPLORE PAGE
   ========================================================================== */
let currentFilters = { search: '', category: '', minRating: '', sort: 'newest', page: 1 };

function initExplorePage() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('search')) currentFilters.search = params.get('search');
  if (params.get('category')) currentFilters.category = params.get('category');
  if (params.get('minRating')) currentFilters.minRating = params.get('minRating');
  if (params.get('sort')) currentFilters.sort = params.get('sort');
  if (params.get('page')) currentFilters.page = parseInt(params.get('page'));

  const sIn = document.getElementById('explore-search');
  const cSel = document.getElementById('explore-category');
  const rSel = document.getElementById('explore-rating');
  const sortSel = document.getElementById('explore-sort');

  if (sIn) sIn.value = currentFilters.search;
  if (cSel) cSel.value = currentFilters.category;
  if (rSel) rSel.value = currentFilters.minRating;
  if (sortSel) sortSel.value = currentFilters.sort;

  let debounceTimer;
  if (sIn) {
    sIn.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentFilters.search = sIn.value.trim();
        currentFilters.page = 1;
        loadExploreDestinations();
      }, 400);
    });
  }

  const triggerChange = (elem, key) => {
    if (elem) {
      elem.addEventListener('change', () => {
        currentFilters[key] = elem.value;
        currentFilters.page = 1;
        loadExploreDestinations();
      });
    }
  };
  triggerChange(cSel, 'category');
  triggerChange(rSel, 'minRating');
  triggerChange(sortSel, 'sort');

  const clearBtn = document.getElementById('explore-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      currentFilters = { search: '', category: '', minRating: '', sort: 'newest', page: 1 };
      if (sIn) sIn.value = '';
      if (cSel) cSel.value = '';
      if (rSel) rSel.value = '';
      if (sortSel) sortSel.value = 'newest';
      loadExploreDestinations();
    });
  }

  loadExploreDestinations();
}

async function loadExploreDestinations() {
  const container = document.getElementById('destinations-grid');
  const countEl = document.getElementById('destinations-count');
  const paginationEl = document.getElementById('destinations-pagination');
  if (!container) return;

  showLoading(container);
  try {
    const params = new URLSearchParams();
    if (currentFilters.search) params.set('search', currentFilters.search);
    if (currentFilters.category) params.set('category', currentFilters.category);
    if (currentFilters.minRating) params.set('minRating', currentFilters.minRating);
    params.set('sort', currentFilters.sort);
    params.set('page', currentFilters.page);
    params.set('limit', 12);

    const data = await api.get(`/destinations?${params.toString()}`);
    if (countEl) countEl.textContent = `${data.pagination.total} destination${data.pagination.total !== 1 ? 's' : ''} found`;

    if (!data.data.length) {
      showEmpty(container, 'No destinations found', 'Try adjusting your search or filters.');
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    container.innerHTML = `<div class="dest-grid">${data.data.map(renderDestinationCard).join('')}</div>`;
    if (paginationEl) paginationEl.innerHTML = renderPagination(data.pagination, goToExplorePage);

    // Update URL
    const url = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    history.replaceState(null, '', url);
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3 class="empty-state__title">Unable to load destinations</h3><p class="empty-state__text">${error.message}</p></div>`;
  }
}

function goToExplorePage(page) {
  currentFilters.page = page;
  loadExploreDestinations();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.goToExplorePage = goToExplorePage;

/* ==========================================================================
   3. DESTINATION DETAILS & REVIEWS
   ========================================================================== */
let destId = null;
let reviewsPage = 1;

async function initDestinationPage() {
  const params = new URLSearchParams(window.location.search);
  destId = params.get('id');
  if (!destId) { window.location.href = '/404.html'; return; }
  await loadDestinationDetails();
  await loadDestinationReviews();
}

async function loadDestinationDetails() {
  const container = document.getElementById('dest-content');
  if (!container) return;
  showLoading(container);

  try {
    const data = await api.get(`/destinations/${destId}`);
    const d = data.data;
    document.title = `${d.name} — Roamly`;
    const mainImg = d.images && d.images[0] ? d.images[0] : '';
    const hasMultiple = d.images && d.images.length > 1;

    container.innerHTML = `
      <div class="dest-detail">
        <div>
          <div class="dest-detail__gallery">
            ${mainImg
              ? `<img id="dest-main-img" src="${mainImg}" alt="${d.name}" onerror="this.parentElement.classList.add('dest-detail__gallery--fallback');this.parentElement.textContent='${d.name}';this.remove()">`
              : `<div class="dest-detail__gallery--fallback">${d.name}</div>`
            }
          </div>
          ${hasMultiple ? `
            <div class="dest-detail__thumbnails" style="display: flex; gap: var(--space-sm); margin-top: var(--space-sm); overflow-x: auto;">
              ${d.images.map((imgUrl, i) => `
                <img src="${imgUrl}" alt="${d.name} preview ${i + 1}" style="width: 80px; height: 56px; object-fit: cover; border-radius: var(--border-radius); cursor: pointer; border: 2px solid ${i === 0 ? 'var(--color-terracotta)' : 'transparent'}; opacity: ${i === 0 ? '1' : '0.7'}; transition: all 0.2s;" onclick="switchMainImage('${imgUrl}', this)">
              `).join('')}
            </div>
          ` : ''}

          <div style="margin-top: var(--space-xl)">
            <span class="dest-detail__category">${d.category}</span>
            <h1 class="dest-detail__name">${d.name}</h1>
            <p class="dest-detail__location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              ${d.city}, ${d.state}, ${d.country || 'India'}
            </p>
            <div style="margin-bottom: var(--space-lg);">
              ${renderStars(d.averageRating || 0, true, d.reviewCount || 0)}
            </div>
            <div class="dest-detail__desc">${d.description}</div>
          </div>

          ${d.visitorTips && d.visitorTips.length > 0 ? `
            <div style="margin-top: var(--space-xl);">
              <h3 style="font-size: var(--text-xl); margin-bottom: var(--space-md);">Visitor Tips</h3>
              <ul style="list-style: none;">
                ${d.visitorTips.map(tip => `<li style="padding: var(--space-xs) 0; padding-left: var(--space-md); position: relative; font-size: var(--text-sm); color: var(--color-charcoal-light);"><span style="position: absolute; left: 0; color: var(--color-terracotta);">→</span> ${tip}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div style="margin-top: var(--space-2xl);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);">
              <h3 style="font-size: var(--text-2xl);">Reviews</h3>
              <a href="/write-review.html?destination=${d._id}" class="btn btn--primary btn--sm">Write a Review</a>
            </div>
            <div id="rating-distribution"></div>
            <div id="reviews-list" style="margin-top: var(--space-xl);"></div>
            <div id="reviews-pagination"></div>
          </div>
        </div>

        <div>
          <div class="info-box">
            <h3 class="info-box__title">Visitor Information</h3>
            ${d.bestTimeToVisit ? `<div class="info-box__item"><div class="info-box__label">Best Time to Visit</div><div class="info-box__value">${d.bestTimeToVisit}</div></div>` : ''}
            <div class="info-box__item"><div class="info-box__label">Entry Fee</div><div class="info-box__value">${d.entryFee || 'Information not available'}</div></div>
            <div class="info-box__item"><div class="info-box__label">Opening Hours</div><div class="info-box__value">${d.openingHours || 'Information not available'}</div></div>
            ${d.accessibility && d.accessibility !== 'Information not available' ? `<div class="info-box__item"><div class="info-box__label">Accessibility</div><div class="info-box__value">${d.accessibility}</div></div>` : ''}
            ${d.nearbyAttractions && d.nearbyAttractions.length > 0 ? `
              <div class="info-box__item">
                <div class="info-box__label">Nearby Attractions</div>
                <div class="info-box__tags">${d.nearbyAttractions.map(a => `<span class="info-box__tag">${a}</span>`).join('')}</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3 class="empty-state__title">Error loading destination</h3><p class="empty-state__text">${error.message}</p></div>`;
  }
}

async function loadDestinationReviews() {
  const container = document.getElementById('reviews-list');
  const distContainer = document.getElementById('rating-distribution');
  const paginationEl = document.getElementById('reviews-pagination');
  if (!container || !destId) return;

  try {
    const data = await api.get(`/destinations/${destId}/reviews?page=${reviewsPage}&limit=10`);
    if (distContainer && data.ratingDistribution) {
      const total = Object.values(data.ratingDistribution).reduce((a, b) => a + b, 0);
      distContainer.innerHTML = `
        <div class="rating-dist">
          ${[5,4,3,2,1].map(r => `
            <div class="rating-dist__row">
              <span class="rating-dist__label">${r}★</span>
              <div class="rating-dist__bar"><div class="rating-dist__fill" style="width: ${total > 0 ? (data.ratingDistribution[r] / total * 100) : 0}%"></div></div>
              <span class="rating-dist__count">${data.ratingDistribution[r]}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (!data.data.length) {
      container.innerHTML = `<div class="empty-state" style="padding: var(--space-xl);"><h3 class="empty-state__title">No reviews yet</h3><p class="empty-state__text">Be the first to share your experience at this destination.</p></div>`;
      return;
    }

    container.innerHTML = data.data.map(renderReviewCard).join('');
    if (paginationEl) paginationEl.innerHTML = renderPagination(data.pagination, goToReviewPage);
  } catch (error) {
    container.innerHTML = '<p style="color:var(--color-charcoal-light);text-align:center;">Unable to load reviews.</p>';
  }
}

function renderReviewCard(review) {
  const isOwner = currentUser && currentUser.id === (review.user._id || review.user);
  const hasVoted = currentUser && review.helpfulVoters && review.helpfulVoters.includes(currentUser.id);
  return `
    <div class="review-card" data-review-id="${review._id}">
      <div class="review-card__header">
        <div class="review-card__avatar">${getInitials(review.user.name || 'User')}</div>
        <div>
          <div class="review-card__author">${review.user.name || 'Anonymous'}</div>
          <div class="review-card__date">${formatDate(review.createdAt)}${review.visitDate ? ` · Visited ${formatDate(review.visitDate)}` : ''}</div>
        </div>
        <div style="margin-left: auto;">${renderStars(review.rating, false)}</div>
      </div>
      <h4 class="review-card__title">${review.title}</h4>
      <p class="review-card__text">${review.comment}</p>
      <div class="review-card__footer">
        <button class="review-card__helpful ${hasVoted ? 'review-card__helpful--voted' : ''}" onclick="voteHelpful('${review._id}', this)">
          👍 Helpful (${review.helpfulVotes || 0})
        </button>
        ${isOwner ? `
          <div class="review-card__actions">
            <button class="review-card__action-btn" onclick="window.location.href='/write-review.html?edit=${review._id}'">Edit</button>
            <button class="review-card__action-btn review-card__action-btn--delete" onclick="deleteReviewItem('${review._id}')">Delete</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

async function voteHelpful(reviewId, btn) {
  if (!currentUser) { toast.warning('Please log in to vote.'); return; }
  try {
    const data = await api.post(`/reviews/${reviewId}/helpful`);
    btn.classList.toggle('review-card__helpful--voted', data.data.voted);
    btn.innerHTML = `👍 Helpful (${data.data.helpfulVotes})`;
  } catch (error) {
    toast.error(error.message);
  }
}

async function deleteReviewItem(reviewId) {
  const confirmed = await showConfirm('Delete Review', 'Are you sure you want to delete this review?');
  if (!confirmed) return;
  try {
    await api.delete(`/reviews/${reviewId}`);
    toast.success('Review deleted.');
    loadDestinationReviews();
    loadDestinationDetails();
  } catch (error) {
    toast.error(error.message);
  }
}

function switchMainImage(src, thumb) {
  const mainImg = document.getElementById('dest-main-img');
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.dest-detail__thumbnails img').forEach(t => {
    t.style.borderColor = 'transparent';
    t.style.opacity = '0.7';
  });
  if (thumb) {
    thumb.style.borderColor = 'var(--color-terracotta)';
    thumb.style.opacity = '1';
  }
}

function goToReviewPage(page) {
  reviewsPage = page;
  loadDestinationReviews();
}
window.voteHelpful = voteHelpful;
window.deleteReviewItem = deleteReviewItem;
window.switchMainImage = switchMainImage;
window.goToReviewPage = goToReviewPage;

/* ==========================================================================
   4. WRITE / EDIT REVIEW PAGE
   ========================================================================== */
let selectedRating = 0;
let editingReviewId = null;

async function initReviewPage() {
  await checkAuth();
  if (!requireAuth()) return;

  const params = new URLSearchParams(window.location.search);
  editingReviewId = params.get('edit');
  const preselectedDest = params.get('destination');

  // Load destination options
  const select = document.getElementById('review-destination');
  if (select) {
    try {
      const data = await api.get('/destinations?limit=100');
      data.data.forEach(d => {
        const option = document.createElement('option');
        option.value = d._id;
        option.textContent = `${d.name} — ${d.city}, ${d.state}`;
        if (preselectedDest && d._id === preselectedDest) option.selected = true;
        select.appendChild(option);
      });
    } catch (e) {}
  }

  // Star selector
  const starContainer = document.getElementById('star-input');
  if (starContainer) {
    for (let i = 5; i >= 1; i--) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'star-input__star';
      btn.dataset.rating = i;
      btn.textContent = '★';
      btn.addEventListener('click', () => {
        selectedRating = i;
        document.querySelectorAll('.star-input__star').forEach(s => {
          s.classList.toggle('star-input__star--active', parseInt(s.dataset.rating) <= i);
        });
        document.getElementById('rating-value').textContent = `${i}/5`;
      });
      starContainer.appendChild(btn);
    }
  }

  // Character counter
  const textarea = document.getElementById('review-comment');
  const counter = document.getElementById('comment-counter');
  if (textarea && counter) {
    textarea.addEventListener('input', () => { counter.textContent = `${textarea.value.length}/2000`; });
  }

  if (editingReviewId) {
    document.getElementById('review-form-title').textContent = 'Edit Your Review';
    document.getElementById('review-submit-btn').textContent = 'Update Review';
    try {
      let r;
      try {
        r = (await api.get(`/reviews/${editingReviewId}`)).data;
      } catch (_) {
        r = (await api.get('/reviews/mine')).data.find(x => x._id === editingReviewId);
      }
      if (r) {
        document.getElementById('review-destination').value = r.destination._id || r.destination;
        document.getElementById('review-destination').disabled = true;
        document.getElementById('review-title').value = r.title;
        document.getElementById('review-comment').value = r.comment;
        if (r.visitDate) document.getElementById('review-visit-date').value = r.visitDate.split('T')[0];
        selectedRating = r.rating;
        document.querySelectorAll('.star-input__star').forEach(s => {
          s.classList.toggle('star-input__star--active', parseInt(s.dataset.rating) <= r.rating);
        });
        document.getElementById('rating-value').textContent = `${r.rating}/5`;
      }
    } catch (e) {}
  }

  const form = document.getElementById('review-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dest = document.getElementById('review-destination').value;
      const title = document.getElementById('review-title').value.trim();
      const comment = document.getElementById('review-comment').value.trim();
      const visitDate = document.getElementById('review-visit-date').value;
      const submitBtn = document.getElementById('review-submit-btn');

      if (!dest || !selectedRating || !title || !comment) {
        toast.error('Please complete all required fields and star rating.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
      try {
        const body = { rating: selectedRating, title, comment, visitDate: visitDate || null };
        if (editingReviewId) {
          await api.put(`/reviews/${editingReviewId}`, body);
          toast.success('Review updated successfully!');
        } else {
          await api.post(`/destinations/${dest}/reviews`, body);
          toast.success('Review submitted successfully!');
        }
        setTimeout(() => window.location.href = `/destination.html?id=${dest}`, 800);
      } catch (err) {
        toast.error(err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = editingReviewId ? 'Update Review' : 'Submit Review';
      }
    });
  }
}

/* ==========================================================================
   5. PROFILE PAGE
   ========================================================================== */
async function initProfilePage() {
  await checkAuth();
  if (!requireAuth()) return;

  const avatar = document.getElementById('profile-avatar');
  const name = document.getElementById('profile-name');
  const username = document.getElementById('profile-username');
  const joined = document.getElementById('profile-joined');
  const nameIn = document.getElementById('edit-name');
  const userIn = document.getElementById('edit-username');

  if (avatar) avatar.textContent = getInitials(currentUser.name);
  if (name) name.textContent = currentUser.name;
  if (username) username.textContent = `@${currentUser.username}`;
  if (joined) joined.textContent = `Member since ${formatDate(currentUser.createdAt)}`;
  if (nameIn) nameIn.value = currentUser.name;
  if (userIn) userIn.value = currentUser.username;

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('tab-panel--active'));
      btn.classList.add('tab-btn--active');
      document.getElementById(btn.dataset.tab).classList.add('tab-panel--active');
    });
  });

  // Profile Form
  const form = document.getElementById('profile-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api.put('/users/me', { name: nameIn.value.trim(), username: userIn.value.trim() });
        toast.success('Profile updated.');
        await checkAuth();
        if (avatar) avatar.textContent = getInitials(currentUser.name);
        if (name) name.textContent = currentUser.name;
        if (username) username.textContent = `@${currentUser.username}`;
      } catch (err) {
        toast.error(err.message);
      }
    });
  }

  // Load reviews
  const container = document.getElementById('user-reviews');
  const countEl = document.getElementById('review-count');
  if (container) {
    showLoading(container);
    try {
      const data = await api.get('/reviews/mine');
      if (countEl) countEl.textContent = data.data.length;
      if (!data.data.length) {
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
    } catch (e) {
      container.innerHTML = '<p style="text-align:center;">Unable to load reviews.</p>';
    }
  }
}

async function deleteMyReview(id) {
  const confirmed = await showConfirm('Delete Review', 'Are you sure you want to delete this review?');
  if (!confirmed) return;
  try {
    await api.delete(`/reviews/${id}`);
    toast.success('Review deleted.');
    initProfilePage();
  } catch (err) {
    toast.error(err.message);
  }
}
window.deleteMyReview = deleteMyReview;

/* ==========================================================================
   6. ADMIN DASHBOARD
   ========================================================================== */
let editingDestId = null;

async function initAdminPage() {
  await checkAuth();
  if (!requireAdmin()) return;

  // Tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('admin-tab--active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('tab-panel--active'));
      tab.classList.add('admin-tab--active');
      const target = tab.dataset.tab;
      document.getElementById(`panel-${target}`).classList.add('tab-panel--active');
      if (target === 'destinations') loadAdminDestinations();
      if (target === 'reviews') loadAdminReviews();
      if (target === 'users') loadAdminUsers();
    });
  });

  loadAdminStats();
  loadAdminDestinations();
  initAdminDestForm();
}

async function loadAdminStats() {
  try {
    const s = (await api.get('/admin/stats')).data;
    document.getElementById('stat-destinations').textContent = s.totalDestinations;
    document.getElementById('stat-users').textContent = s.totalUsers;
    document.getElementById('stat-reviews').textContent = s.totalReviews;
    document.getElementById('stat-rating').textContent = s.averageRating.toFixed(1);
  } catch (e) {}
}

async function loadAdminDestinations() {
  const container = document.getElementById('admin-destinations');
  if (!container) return;
  showLoading(container);
  try {
    const list = (await api.get('/destinations?limit=100')).data;
    container.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Name</th><th>City</th><th>State</th><th>Category</th><th>Rating</th><th>Actions</th></tr></thead>
        <tbody>
          ${list.map(d => `
            <tr>
              <td><a href="/destination.html?id=${d._id}">${d.name}</a></td>
              <td>${d.city}</td><td>${d.state}</td><td>${d.category}</td>
              <td>${d.averageRating ? d.averageRating.toFixed(1) : '—'}★</td>
              <td>
                <button class="btn btn--ghost btn--sm" onclick="editAdminDest('${d._id}')">Edit</button>
                <button class="btn btn--ghost btn--sm" onclick="deleteAdminDest('${d._id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (e) {
    container.innerHTML = '<p>Error loading destinations.</p>';
  }
}

async function editAdminDest(id) {
  try {
    const d = (await api.get(`/destinations/${id}`)).data;
    editingDestId = id;
    document.getElementById('dest-name').value = d.name;
    document.getElementById('dest-city').value = d.city;
    document.getElementById('dest-state').value = d.state;
    document.getElementById('dest-category').value = d.category;
    document.getElementById('dest-description').value = d.description;
    document.getElementById('dest-images').value = (d.images || []).join('\n');
    document.getElementById('dest-besttime').value = d.bestTimeToVisit || '';
    document.getElementById('dest-fee').value = d.entryFee || '';
    document.getElementById('dest-hours').value = d.openingHours || '';
    document.getElementById('dest-tips').value = (d.visitorTips || []).join('\n');
    document.getElementById('dest-nearby').value = (d.nearbyAttractions || []).join('\n');
    document.getElementById('dest-featured').checked = d.isFeatured || false;

    document.getElementById('dest-form-title').textContent = 'Edit Destination';
    document.getElementById('dest-submit-btn').textContent = 'Update Destination';
    document.getElementById('dest-cancel-btn').style.display = 'inline-flex';
    document.getElementById('dest-form').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    toast.error('Failed to load destination details.');
  }
}

async function deleteAdminDest(id) {
  const confirmed = await showConfirm('Delete Destination', 'Are you sure you want to delete this destination?');
  if (!confirmed) return;
  try {
    await api.delete(`/destinations/${id}`);
    toast.success('Destination deleted.');
    loadAdminDestinations();
    loadAdminStats();
  } catch (err) {
    toast.error(err.message);
  }
}

function initAdminDestForm() {
  const form = document.getElementById('dest-form');
  const cancelBtn = document.getElementById('dest-cancel-btn');
  if (!form) return;

  cancelBtn.addEventListener('click', () => {
    editingDestId = null;
    form.reset();
    document.getElementById('dest-form-title').textContent = 'Add Destination';
    document.getElementById('dest-submit-btn').textContent = 'Add Destination';
    cancelBtn.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      name: document.getElementById('dest-name').value.trim(),
      city: document.getElementById('dest-city').value.trim(),
      state: document.getElementById('dest-state').value.trim(),
      category: document.getElementById('dest-category').value,
      description: document.getElementById('dest-description').value.trim(),
      images: document.getElementById('dest-images').value.split('\n').map(s => s.trim()).filter(Boolean),
      bestTimeToVisit: document.getElementById('dest-besttime').value.trim(),
      entryFee: document.getElementById('dest-fee').value.trim() || 'Information not available',
      openingHours: document.getElementById('dest-hours').value.trim() || 'Information not available',
      visitorTips: document.getElementById('dest-tips').value.split('\n').map(s => s.trim()).filter(Boolean),
      nearbyAttractions: document.getElementById('dest-nearby').value.split('\n').map(s => s.trim()).filter(Boolean),
      isFeatured: document.getElementById('dest-featured').checked
    };
    try {
      if (editingDestId) {
        await api.put(`/destinations/${editingDestId}`, body);
        toast.success('Destination updated.');
      } else {
        await api.post('/destinations', body);
        toast.success('Destination added.');
      }
      form.reset();
      editingDestId = null;
      document.getElementById('dest-form-title').textContent = 'Add Destination';
      document.getElementById('dest-submit-btn').textContent = 'Add Destination';
      cancelBtn.style.display = 'none';
      loadAdminDestinations();
      loadAdminStats();
    } catch (err) {
      toast.error(err.message);
    }
  });
}

async function loadAdminReviews() {
  const container = document.getElementById('admin-reviews');
  if (!container) return;
  showLoading(container);
  try {
    const list = (await api.get('/admin/reviews?limit=50')).data;
    container.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Destination</th><th>User</th><th>Rating</th><th>Title</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>
          ${list.map(r => `
            <tr>
              <td>${r.destination ? r.destination.name : 'Unknown'}</td>
              <td>${r.user ? r.user.name : 'Unknown'}</td>
              <td>${r.rating}★</td>
              <td>${r.title}</td>
              <td>${formatDate(r.createdAt)}</td>
              <td><button class="btn btn--ghost btn--sm" onclick="adminDeleteReviewItem('${r._id}')">Delete</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (e) {
    container.innerHTML = '<p>Error loading reviews.</p>';
  }
}

async function adminDeleteReviewItem(id) {
  const confirmed = await showConfirm('Delete Review', 'Delete this review?');
  if (!confirmed) return;
  try {
    await api.delete(`/admin/reviews/${id}`);
    toast.success('Review deleted.');
    loadAdminReviews();
    loadAdminStats();
  } catch (err) {
    toast.error(err.message);
  }
}

async function loadAdminUsers() {
  const container = document.getElementById('admin-users');
  if (!container) return;
  showLoading(container);
  try {
    const list = (await api.get('/admin/users?limit=50')).data;
    container.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          ${list.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>@${u.username}</td>
              <td>${u.email}</td>
              <td>${u.role === 'admin' ? '<span class="badge badge--admin">Admin</span>' : 'User'}</td>
              <td><span class="badge ${u.isActive ? 'badge--active' : 'badge--inactive'}">${u.isActive ? 'Active' : 'Suspended'}</span></td>
              <td>
                ${u.role !== 'admin' ? `<button class="btn btn--ghost btn--sm" onclick="toggleAdminUserStatus('${u._id}')">${u.isActive ? 'Suspend' : 'Activate'}</button>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (e) {
    container.innerHTML = '<p>Error loading users.</p>';
  }
}

async function toggleAdminUserStatus(id) {
  try {
    await api.put(`/admin/users/${id}/toggle-status`);
    toast.success('User status updated.');
    loadAdminUsers();
  } catch (err) {
    toast.error(err.message);
  }
}

window.editAdminDest = editAdminDest;
window.deleteAdminDest = deleteAdminDest;
window.adminDeleteReviewItem = adminDeleteReviewItem;
window.toggleAdminUserStatus = toggleAdminUserStatus;
