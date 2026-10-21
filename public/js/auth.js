/* ============================================
   ROAMLY — Auth Module
   ============================================ */

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

/* --- Mobile Nav Toggle --- */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('nav-mobile');
  if (!toggle || !mobileMenu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('nav__toggle--open');
    mobileMenu.classList.toggle('nav__mobile--open');
  });

  // Close on link click
  mobileMenu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('nav__toggle--open');
      mobileMenu.classList.remove('nav__mobile--open');
    });
  });
}

/* --- Init on page load --- */
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initMobileNav();
});
