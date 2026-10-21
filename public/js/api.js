/* ============================================
   ROAMLY — API Utility Module
   ============================================ */

const API_BASE = '/api';

const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = localStorage.getItem('roamly_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    const config = {
      headers: { ...headers, ...(options.headers || {}) },
      credentials: 'same-origin',
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw { status: response.status, message: data.message || 'Something went wrong', data };
      }

      return data;
    } catch (error) {
      if (error.status) throw error;
      throw { status: 0, message: 'Network error. Please check your connection.' };
    }
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

/* --- Toast System --- */
const toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 4000) {
    this.init();
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.innerHTML = `
      <span>${message}</span>
      <button class="toast__close" aria-label="Dismiss">&times;</button>
    `;

    el.querySelector('.toast__close').addEventListener('click', () => this.dismiss(el));
    this.container.appendChild(el);

    setTimeout(() => this.dismiss(el), duration);
  },

  dismiss(el) {
    if (!el.parentNode) return;
    el.classList.add('toast--out');
    setTimeout(() => el.remove(), 200);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  warning(msg) { this.show(msg, 'warning'); }
};

/* --- Star Rating HTML --- */
function renderStars(rating, showValue = true, count = null) {
  let html = '<span class="stars">';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      html += '<span class="stars__star stars__star--filled">★</span>';
    } else if (rating >= i - 0.5) {
      html += '<span class="stars__star stars__star--half">★</span>';
    } else {
      html += '<span class="stars__star">★</span>';
    }
  }
  if (showValue) html += `<span class="stars__value">${rating.toFixed(1)}</span>`;
  if (count !== null) html += `<span class="stars__count">(${count})</span>`;
  html += '</span>';
  return html;
}

/* --- Image Error Handling --- */
function handleImageError(img, fallbackText) {
  img.onerror = null;
  const parent = img.parentElement;
  img.style.display = 'none';
  const fallback = document.createElement('div');
  fallback.className = 'card__image--fallback';
  fallback.textContent = fallbackText || 'Roamly';
  parent.appendChild(fallback);
}

/* --- Date Formatting --- */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* --- Get Initials --- */
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/* --- Confirm Modal --- */
function showConfirm(title, text) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-overlay--open';
    overlay.innerHTML = `
      <div class="modal">
        <h3 class="modal__title">${title}</h3>
        <p class="modal__text">${text}</p>
        <div class="modal__actions">
          <button class="btn btn--ghost" id="modal-cancel">Cancel</button>
          <button class="btn btn--primary" id="modal-confirm">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#modal-cancel').addEventListener('click', () => {
      overlay.remove();
      resolve(false);
    });
    overlay.querySelector('#modal-confirm').addEventListener('click', () => {
      overlay.remove();
      resolve(true);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { overlay.remove(); resolve(false); }
    });
  });
}

/* --- Destination Card HTML --- */
function renderDestinationCard(dest) {
  const img = dest.images && dest.images[0] ? dest.images[0] : '';
  return `
    <article class="card" onclick="window.location.href='/destination.html?id=${dest._id}'">
      <div class="card__image">
        ${img
          ? `<img src="${img}" alt="${dest.name}" loading="lazy" onerror="handleImageError(this, '${dest.name}')">`
          : `<div class="card__image--fallback">${dest.name}</div>`
        }
        <span class="card__badge">${dest.category}</span>
      </div>
      <div class="card__body">
        <div class="card__category">${dest.category}</div>
        <h3 class="card__title"><a href="/destination.html?id=${dest._id}">${dest.name}</a></h3>
        <div class="card__location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${dest.city}, ${dest.state}
        </div>
        <p class="card__description">${dest.description}</p>
        <div class="card__meta">
          ${renderStars(dest.averageRating || 0, true, dest.reviewCount || 0)}
        </div>
      </div>
    </article>
  `;
}

/* --- Loading State --- */
function showLoading(container) {
  container.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';
}

/* --- Empty State --- */
function showEmpty(container, title, text) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">📍</div>
      <h3 class="empty-state__title">${title}</h3>
      <p class="empty-state__text">${text}</p>
    </div>
  `;
}

/* --- Pagination --- */
function renderPagination(pagination, onPageChange) {
  if (!pagination || pagination.pages <= 1) return '';

  const fnName = typeof onPageChange === 'function' ? onPageChange.name : onPageChange;

  let html = '<div class="pagination">';
  html += `<button class="pagination__btn" ${pagination.page <= 1 ? 'disabled' : ''} onclick="${fnName}(${pagination.page - 1})">← Prev</button>`;

  const maxVisible = 5;
  let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
  let end = Math.min(pagination.pages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) {
    html += `<button class="pagination__btn ${i === pagination.page ? 'pagination__btn--active' : ''}" onclick="${fnName}(${i})">${i}</button>`;
  }

  html += `<button class="pagination__btn" ${pagination.page >= pagination.pages ? 'disabled' : ''} onclick="${fnName}(${pagination.page + 1})">Next →</button>`;
  html += '</div>';
  return html;
}

/* --- Category Icons (SVG-based) --- */
const categoryIcons = {
  'Mountains': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
  'Beaches': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="17" cy="5" r="3"/><path d="M3 20c2.5-3.5 8-3.5 10.5 0"/><path d="M12.5 20c2-3 6-3 8.5 0"/><path d="M19 13c-2 1-4.5 1-7 0s-5-1-7 0"/></svg>',
  'Historical': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18M3 7v14M21 7v14M6 7V4l6-2 6 2v3M9 21v-4h6v4M9 7h6M12 7v4"/></svg>',
  'Nature & Wildlife': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10 .1-4 3-7.5 3-7.5S13 6 10 10c-2.2 3.6-7.5 7.5-3 10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2 3.7"/></svg>',
  'Spiritual': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="4"/></svg>',
  'Adventure': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  'Hill Stations': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.7 7.7A7.1 7.1 0 0 0 6.3 7.7c-1.7.9-2.8 2.6-2.8 4.5 0 2.5 1.8 4.6 4.3 5a6 6 0 0 0 8.4 0c2.5-.4 4.3-2.5 4.3-5 0-1.9-1.1-3.6-2.8-4.5z"/></svg>',
  'Heritage': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="10" rx="1"/><path d="M12 2L3 11h18L12 2z"/><path d="M8 21v-4h3v4M13 21v-4h3v4"/></svg>',
  'Urban': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="6" width="8" height="15"/><rect x="9" y="2" width="6" height="19"/><rect x="15" y="9" width="8" height="12"/><path d="M4 9h2M4 12h2M4 15h2M11 5h2M11 8h2M11 11h2M11 14h2M18 12h2M18 15h2"/></svg>'
};
