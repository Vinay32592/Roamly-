/* ============================================
   ROAMLY — Home Page
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedDestinations();
  loadRecentlyReviewed();
  initHeroSearch();
  initCategoryCards();
  initNaturalAtmosphere();
});

async function loadFeaturedDestinations() {
  const container = document.getElementById('featured-destinations');
  if (!container) return;

  showLoading(container);

  try {
    const data = await api.get('/destinations?featured=true&limit=6');
    if (data.data.length === 0) {
      // Fallback: load any destinations
      const fallback = await api.get('/destinations?limit=6&sort=rating');
      renderFeatured(container, fallback.data);
    } else {
      renderFeatured(container, data.data);
    }
  } catch (error) {
    container.innerHTML = '<p style="text-align:center;color:var(--color-charcoal-light)">Unable to load destinations.</p>';
  }
}

function renderFeatured(container, destinations) {
  if (destinations.length === 0) {
    showEmpty(container, 'No destinations yet', 'Check back soon for featured destinations.');
    return;
  }
  container.innerHTML = `<div class="dest-grid">${destinations.map(renderDestinationCard).join('')}</div>`;
}

async function loadRecentlyReviewed() {
  const container = document.getElementById('recent-destinations');
  if (!container) return;

  try {
    const data = await api.get('/destinations?sort=newest&limit=4');
    if (data.data.length > 0) {
      container.innerHTML = `<div class="dest-grid">${data.data.map(renderDestinationCard).join('')}</div>`;
    }
  } catch (error) {
    // Silently fail for non-critical section
  }
}

function initHeroSearch() {
  const form = document.getElementById('hero-search-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('hero-search-input').value.trim();
    if (query) {
      window.location.href = `/explore.html?search=${encodeURIComponent(query)}`;
    } else {
      window.location.href = '/explore.html';
    }
  });
}

function initCategoryCards() {
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = card.dataset.category;
      if (cat) {
        window.location.href = `/explore.html?category=${encodeURIComponent(cat)}`;
      }
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

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
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
