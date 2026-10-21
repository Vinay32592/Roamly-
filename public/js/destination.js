/* ============================================
   ROAMLY — Destination Detail Page
   ============================================ */

let destId = null;
let destData = null;
let reviewsPage = 1;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  destId = params.get('id');

  if (!destId) {
    window.location.href = '/404.html';
    return;
  }

  await loadDestination();
  await loadReviews();
});

async function loadDestination() {
  const container = document.getElementById('dest-content');
  if (!container) return;

  showLoading(container);

  try {
    const data = await api.get(`/destinations/${destId}`);
    destData = data.data;
    renderDestination(container, destData);
    document.title = `${destData.name} — Roamly`;
  } catch (error) {
    if (error.status === 404) {
      window.location.href = '/404.html';
    } else {
      container.innerHTML = `<div class="empty-state"><h3 class="empty-state__title">Error loading destination</h3><p class="empty-state__text">${error.message}</p></div>`;
    }
  }
}

function renderDestination(container, d) {
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

        <!-- Reviews Section -->
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

          ${d.bestTimeToVisit ? `
            <div class="info-box__item">
              <div class="info-box__label">Best Time to Visit</div>
              <div class="info-box__value">${d.bestTimeToVisit}</div>
            </div>
          ` : ''}

          <div class="info-box__item">
            <div class="info-box__label">Entry Fee</div>
            <div class="info-box__value">${d.entryFee || 'Information not available'}</div>
          </div>

          <div class="info-box__item">
            <div class="info-box__label">Opening Hours</div>
            <div class="info-box__value">${d.openingHours || 'Information not available'}</div>
          </div>

          ${d.accessibility && d.accessibility !== 'Information not available' ? `
            <div class="info-box__item">
              <div class="info-box__label">Accessibility</div>
              <div class="info-box__value">${d.accessibility}</div>
            </div>
          ` : ''}

          ${d.nearbyAttractions && d.nearbyAttractions.length > 0 ? `
            <div class="info-box__item">
              <div class="info-box__label">Nearby Attractions</div>
              <div class="info-box__tags">
                ${d.nearbyAttractions.map(a => `<span class="info-box__tag">${a}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

async function loadReviews() {
  const container = document.getElementById('reviews-list');
  const distContainer = document.getElementById('rating-distribution');
  const paginationEl = document.getElementById('reviews-pagination');
  if (!container) return;

  // Wait for destId
  if (!destId) return;

  try {
    const data = await api.get(`/destinations/${destId}/reviews?page=${reviewsPage}&limit=10`);

    // Rating distribution
    if (distContainer && data.ratingDistribution) {
      const total = Object.values(data.ratingDistribution).reduce((a, b) => a + b, 0);
      distContainer.innerHTML = `
        <div class="rating-dist">
          ${[5,4,3,2,1].map(r => `
            <div class="rating-dist__row">
              <span class="rating-dist__label">${r}★</span>
              <div class="rating-dist__bar">
                <div class="rating-dist__fill" style="width: ${total > 0 ? (data.ratingDistribution[r] / total * 100) : 0}%"></div>
              </div>
              <span class="rating-dist__count">${data.ratingDistribution[r]}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (data.data.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: var(--space-xl);">
          <h3 class="empty-state__title">No reviews yet</h3>
          <p class="empty-state__text">Be the first to share your experience at this destination.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.data.map(r => renderReviewCard(r)).join('');

    if (paginationEl) {
      paginationEl.innerHTML = renderPagination(data.pagination, goToReviewPage);
    }
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
            <button class="review-card__action-btn" onclick="editReview('${review._id}')">Edit</button>
            <button class="review-card__action-btn review-card__action-btn--delete" onclick="deleteReview('${review._id}')">Delete</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

async function voteHelpful(reviewId, btn) {
  if (!currentUser) {
    toast.warning('Please log in to vote.');
    return;
  }
  try {
    const data = await api.post(`/reviews/${reviewId}/helpful`);
    btn.classList.toggle('review-card__helpful--voted', data.data.voted);
    btn.innerHTML = `👍 Helpful (${data.data.helpfulVotes})`;
  } catch (error) {
    toast.error(error.message);
  }
}

async function deleteReview(reviewId) {
  const confirmed = await showConfirm('Delete Review', 'Are you sure you want to delete this review? This action cannot be undone.');
  if (!confirmed) return;

  try {
    await api.delete(`/reviews/${reviewId}`);
    toast.success('Review deleted.');
    loadReviews();
    loadDestination(); // Refresh rating
  } catch (error) {
    toast.error(error.message);
  }
}

function editReview(reviewId) {
  window.location.href = `/write-review.html?edit=${reviewId}`;
}

function goToReviewPage(page) {
  reviewsPage = page;
  loadReviews();
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

window.goToReviewPage = goToReviewPage;
window.voteHelpful = voteHelpful;
window.deleteReview = deleteReview;
window.editReview = editReview;
window.switchMainImage = switchMainImage;
