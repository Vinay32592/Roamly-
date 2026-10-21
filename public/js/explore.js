/* ============================================
   ROAMLY — Explore Page
   ============================================ */

let currentFilters = { search: '', category: '', minRating: '', sort: 'newest', page: 1 };

document.addEventListener('DOMContentLoaded', () => {
  parseURLParams();
  initFilters();
  loadDestinations();
});

function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('search')) currentFilters.search = params.get('search');
  if (params.get('category')) currentFilters.category = params.get('category');
  if (params.get('minRating')) currentFilters.minRating = params.get('minRating');
  if (params.get('sort')) currentFilters.sort = params.get('sort');
  if (params.get('page')) currentFilters.page = parseInt(params.get('page'));

  // Set form values
  const searchInput = document.getElementById('explore-search');
  const categorySelect = document.getElementById('explore-category');
  const ratingSelect = document.getElementById('explore-rating');
  const sortSelect = document.getElementById('explore-sort');

  if (searchInput) searchInput.value = currentFilters.search;
  if (categorySelect) categorySelect.value = currentFilters.category;
  if (ratingSelect) ratingSelect.value = currentFilters.minRating;
  if (sortSelect) sortSelect.value = currentFilters.sort;
}

function initFilters() {
  const searchInput = document.getElementById('explore-search');
  const categorySelect = document.getElementById('explore-category');
  const ratingSelect = document.getElementById('explore-rating');
  const sortSelect = document.getElementById('explore-sort');
  const clearBtn = document.getElementById('explore-clear');

  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentFilters.search = searchInput.value.trim();
        currentFilters.page = 1;
        loadDestinations();
        updateURL();
      }, 400);
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      currentFilters.category = categorySelect.value;
      currentFilters.page = 1;
      loadDestinations();
      updateURL();
    });
  }

  if (ratingSelect) {
    ratingSelect.addEventListener('change', () => {
      currentFilters.minRating = ratingSelect.value;
      currentFilters.page = 1;
      loadDestinations();
      updateURL();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentFilters.sort = sortSelect.value;
      currentFilters.page = 1;
      loadDestinations();
      updateURL();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      currentFilters = { search: '', category: '', minRating: '', sort: 'newest', page: 1 };
      if (searchInput) searchInput.value = '';
      if (categorySelect) categorySelect.value = '';
      if (ratingSelect) ratingSelect.value = '';
      if (sortSelect) sortSelect.value = 'newest';
      loadDestinations();
      updateURL();
    });
  }
}

function updateURL() {
  const params = new URLSearchParams();
  if (currentFilters.search) params.set('search', currentFilters.search);
  if (currentFilters.category) params.set('category', currentFilters.category);
  if (currentFilters.minRating) params.set('minRating', currentFilters.minRating);
  if (currentFilters.sort !== 'newest') params.set('sort', currentFilters.sort);
  if (currentFilters.page > 1) params.set('page', currentFilters.page);

  const url = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  history.replaceState(null, '', url);
}

async function loadDestinations() {
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

    if (countEl) {
      countEl.textContent = `${data.pagination.total} destination${data.pagination.total !== 1 ? 's' : ''} found`;
    }

    if (data.data.length === 0) {
      showEmpty(container, 'No destinations found', 'Try adjusting your search or filters.');
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    container.innerHTML = `<div class="dest-grid">${data.data.map(renderDestinationCard).join('')}</div>`;

    if (paginationEl) {
      paginationEl.innerHTML = renderPagination(data.pagination, goToPage);
    }
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3 class="empty-state__title">Unable to load destinations</h3><p class="empty-state__text">${error.message}</p></div>`;
  }
}

function goToPage(page) {
  currentFilters.page = page;
  updateURL();
  loadDestinations();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.goToPage = goToPage;
