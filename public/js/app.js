/* ==========================================================================
   ROAMLY — Client Application Core (API, Auth & UI Utilities)
   ========================================================================== */

const API_BASE = '/api';

/* --- REST API Client --- */
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

/* --- Toast Notification System --- */
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

/* --- Star Rating Renderer --- */
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

/* --- Image Fallback Handler --- */
function handleImageError(img, fallbackText) {
  img.onerror = null;
  const parent = img.parentElement;
  img.style.display = 'none';
  const fallback = document.createElement('div');
  fallback.className = 'card__image--fallback';
  fallback.textContent = fallbackText || 'Roamly';
  parent.appendChild(fallback);
}

/* --- Date Formatter --- */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* --- User Initials --- */
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/* --- Confirmation Modal --- */
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

/* --- Destination Card Generator --- */
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

/* --- UI State Helpers --- */
function showLoading(container) {
  container.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';
}

function showEmpty(container, title, text) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">📍</div>
      <h3 class="empty-state__title">${title}</h3>
      <p class="empty-state__text">${text}</p>
    </div>
  `;
}

/* --- Pagination Controls --- */
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

  html += `<button class="pagination__btn ${pagination.page >= pagination.pages ? 'disabled' : ''} onclick="${fnName}(${pagination.page + 1})">Next →</button>`;
  html += '</div>';
  return html;
}

/* --- Authentication & Navigation Management --- */
let currentUser = null;

async function checkAuth() {
  try {
    const data = await api.get('/auth/me');
    currentUser = data.user;
    updateNavAuth();
    return currentUser;
  } catch (e) {
    currentUser = null;
    updateNavAuth();
    return null;
  }
}

function updateNavAuth() {
  const authLinks = document.getElementById('nav-auth');
  const mobileAuth = document.getElementById('nav-mobile-auth');
  if (!authLinks) return;

  if (currentUser) {
    const initials = getInitials(currentUser.name);
    authLinks.innerHTML = `
      <div class="nav__user" id="nav-user-toggle">
        <div class="nav__avatar">${initials}</div>
        <span>${currentUser.name.split(' ')[0]}</span>
        <div class="nav__dropdown" id="nav-dropdown">
          <a href="/profile.html" class="nav__dropdown-item">My Profile</a>
          <a href="/write-review.html" class="nav__dropdown-item">Write a Review</a>
          ${currentUser.role === 'admin' ? '<a href="/admin.html" class="nav__dropdown-item">Admin Dashboard</a>' : ''}
          <div class="nav__dropdown-divider"></div>
          <a href="#" class="nav__dropdown-item" id="nav-logout">Log Out</a>
        </div>
      </div>
    `;

    // Dropdown toggle
    const toggle = document.getElementById('nav-user-toggle');
    const dropdown = document.getElementById('nav-dropdown');
    toggle.addEventListener('click', (e) => {
      if (e.target.closest('.nav__dropdown-item')) return;
      e.stopPropagation();
      dropdown.classList.toggle('nav__dropdown--open');
    });
    document.addEventListener('click', () => {
      dropdown.classList.remove('nav__dropdown--open');
    });

    // Logout
    document.getElementById('nav-logout').addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await api.post('/auth/logout');
        localStorage.removeItem('roamly_token');
        currentUser = null;
        toast.success('Logged out successfully.');
        setTimeout(() => window.location.href = '/', 500);
      } catch (err) {
        toast.error('Logout failed.');
      }
    });
  } else {
    authLinks.innerHTML = `
      <a href="/login.html" class="btn btn--ghost btn--sm">Log In</a>
      <a href="/register.html" class="btn btn--primary btn--sm">Sign Up</a>
    `;
  }

  // Mobile auth
  if (mobileAuth) {
    if (currentUser) {
      mobileAuth.innerHTML = `
        <a href="/profile.html" class="nav__link">My Profile</a>
        <a href="/write-review.html" class="nav__link">Write a Review</a>
        ${currentUser.role === 'admin' ? '<a href="/admin.html" class="nav__link">Admin Dashboard</a>' : ''}
        <a href="#" class="nav__link" id="nav-mobile-logout">Log Out</a>
      `;
      const mobileLogout = document.getElementById('nav-mobile-logout');
      if (mobileLogout) {
        mobileLogout.addEventListener('click', async (e) => {
          e.preventDefault();
          await api.post('/auth/logout');
          localStorage.removeItem('roamly_token');
          currentUser = null;
          window.location.href = '/';
        });
      }
    } else {
      mobileAuth.innerHTML = `
        <a href="/login.html" class="nav__link">Log In</a>
        <a href="/register.html" class="nav__link">Sign Up</a>
      `;
    }
  }
}

function requireAuth() {
  if (!currentUser) {
    toast.warning('Please log in to continue.');
    setTimeout(() => {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }, 500);
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!currentUser || currentUser.role !== 'admin') {
    toast.error('Access denied.');
    setTimeout(() => window.location.href = '/', 500);
    return false;
  }
  return true;
}

function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('nav-mobile');
  if (!toggle || !mobileMenu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('nav__toggle--open');
    mobileMenu.classList.toggle('nav__mobile--open');
  });

  mobileMenu.addEventListener('click', (e) => {
    if (e.target.closest('.nav__link')) {
      toggle.classList.remove('nav__toggle--open');
      mobileMenu.classList.remove('nav__mobile--open');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initMobileNav();
});
