/* ============================================
   ROAMLY — Admin Dashboard
   ============================================ */

let activeAdminTab = 'destinations';

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  if (!requireAdmin()) return;

  loadAdminStats();
  loadAdminDestinations();
  initAdminTabs();
  initDestinationForm();
});

function initAdminTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('admin-tab--active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('tab-panel--active'));
      tab.classList.add('admin-tab--active');
      activeAdminTab = tab.dataset.tab;
      document.getElementById(`panel-${activeAdminTab}`).classList.add('tab-panel--active');

      if (activeAdminTab === 'destinations') loadAdminDestinations();
      if (activeAdminTab === 'reviews') loadAdminReviews();
      if (activeAdminTab === 'users') loadAdminUsers();
    });
  });
}

async function loadAdminStats() {
  try {
    const data = await api.get('/admin/stats');
    const s = data.data;
    document.getElementById('stat-destinations').textContent = s.totalDestinations;
    document.getElementById('stat-users').textContent = s.totalUsers;
    document.getElementById('stat-reviews').textContent = s.totalReviews;
    document.getElementById('stat-rating').textContent = s.averageRating.toFixed(1);
  } catch (error) {
    toast.error('Failed to load stats.');
  }
}

async function loadAdminDestinations() {
  const container = document.getElementById('admin-destinations');
  if (!container) return;
  showLoading(container);

  try {
    const data = await api.get('/destinations?limit=100');
    if (data.data.length === 0) {
      showEmpty(container, 'No destinations', 'Add your first destination.');
      return;
    }

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Name</th><th>City</th><th>State</th><th>Category</th><th>Rating</th><th>Reviews</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(d => `
            <tr>
              <td><a href="/destination.html?id=${d._id}">${d.name}</a></td>
              <td>${d.city}</td>
              <td>${d.state}</td>
              <td>${d.category}</td>
              <td>${d.averageRating ? d.averageRating.toFixed(1) : '—'}</td>
              <td>${d.reviewCount || 0}</td>
              <td>
                <button class="btn btn--ghost btn--sm" onclick="editDestination('${d._id}')">Edit</button>
                <button class="btn btn--ghost btn--sm" onclick="deleteDestination('${d._id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    container.innerHTML = '<p>Error loading destinations.</p>';
  }
}

async function deleteDestination(id) {
  const confirmed = await showConfirm('Delete Destination', 'Are you sure you want to delete this destination and all of its reviews? This action cannot be undone.');
  if (!confirmed) return;

  try {
    await api.delete(`/destinations/${id}`);
    toast.success('Destination deleted.');
    loadAdminDestinations();
    loadAdminStats();
  } catch (error) {
    toast.error(error.message);
  }
}

let editingDestId = null;

async function editDestination(id) {
  try {
    const data = await api.get(`/destinations/${id}`);
    const d = data.data;
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

    // Switch to destinations tab
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('admin-tab--active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('tab-panel--active'));
    document.querySelector('[data-tab="destinations"]').classList.add('admin-tab--active');
    document.getElementById('panel-destinations').classList.add('tab-panel--active');

    document.getElementById('dest-form').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    toast.error('Failed to load destination.');
  }
}

function resetDestForm() {
  editingDestId = null;
  document.getElementById('dest-form').reset();
  document.getElementById('dest-form-title').textContent = 'Add Destination';
  document.getElementById('dest-submit-btn').textContent = 'Add Destination';
  document.getElementById('dest-cancel-btn').style.display = 'none';
}

function initDestinationForm() {
  const form = document.getElementById('dest-form');
  const cancelBtn = document.getElementById('dest-cancel-btn');
  if (!form) return;

  cancelBtn.addEventListener('click', resetDestForm);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('dest-submit-btn');
    btn.disabled = true;

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
      resetDestForm();
      loadAdminDestinations();
      loadAdminStats();
    } catch (error) {
      toast.error(error.message);
    } finally {
      btn.disabled = false;
    }
  });
}

async function loadAdminReviews() {
  const container = document.getElementById('admin-reviews');
  if (!container) return;
  showLoading(container);

  try {
    const data = await api.get('/admin/reviews?limit=50');

    if (data.data.length === 0) {
      showEmpty(container, 'No reviews', 'No reviews submitted yet.');
      return;
    }

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Destination</th><th>User</th><th>Rating</th><th>Title</th><th>Date</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(r => `
            <tr>
              <td>${r.destination ? r.destination.name : 'Unknown'}</td>
              <td>${r.user ? r.user.name : 'Unknown'}</td>
              <td>${r.rating}★</td>
              <td>${r.title}</td>
              <td>${formatDate(r.createdAt)}</td>
              <td>
                <button class="btn btn--ghost btn--sm" onclick="adminDeleteReview('${r._id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    container.innerHTML = '<p>Error loading reviews.</p>';
  }
}

async function adminDeleteReview(id) {
  const confirmed = await showConfirm('Delete Review', 'Delete this review?');
  if (!confirmed) return;

  try {
    await api.delete(`/admin/reviews/${id}`);
    toast.success('Review deleted.');
    loadAdminReviews();
    loadAdminStats();
  } catch (error) {
    toast.error(error.message);
  }
}

async function loadAdminUsers() {
  const container = document.getElementById('admin-users');
  if (!container) return;
  showLoading(container);

  try {
    const data = await api.get('/admin/users?limit=50');

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>@${u.username}</td>
              <td>${u.email}</td>
              <td>${u.role === 'admin' ? '<span class="badge badge--admin">Admin</span>' : 'User'}</td>
              <td><span class="badge ${u.isActive ? 'badge--active' : 'badge--inactive'}">${u.isActive ? 'Active' : 'Suspended'}</span></td>
              <td>${formatDate(u.createdAt)}</td>
              <td>
                ${u.role !== 'admin' ? `<button class="btn btn--ghost btn--sm" onclick="toggleUserStatus('${u._id}')">${u.isActive ? 'Suspend' : 'Activate'}</button>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    container.innerHTML = '<p>Error loading users.</p>';
  }
}

async function toggleUserStatus(id) {
  try {
    await api.put(`/admin/users/${id}/toggle-status`);
    toast.success('User status updated.');
    loadAdminUsers();
  } catch (error) {
    toast.error(error.message);
  }
}

window.editDestination = editDestination;
window.deleteDestination = deleteDestination;
window.adminDeleteReview = adminDeleteReview;
window.toggleUserStatus = toggleUserStatus;
