const SUPABASE_URL = 'https://supabase.com/dashboard/project/qosjaysnpyumgjifckhi/settings/general';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvc2pheXNucHl1bWdqaWZja2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTMwNzYsImV4cCI6MjA5OTUyOTA3Nn0.Zg8xXSNs16_igOHrP4bAT8MT0tMjVU_SMRWPv3aEQSs';

// ============================================
// RICHROY MOTORS — Site Interactivity
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  initNavToggle();
  initSmoothNavClose();
  initScrollReveal();
  initCounters();
  initContactForm();
});

// ---- Footer year ----
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

// ---- Mobile nav toggle ----
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// ---- Close mobile nav on link click ----
function initSmoothNavClose() {
  const links = document.getElementById('navLinks');
  const toggle = document.getElementById('navToggle');
  if (!links || !toggle) return;

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---- Scroll-triggered reveal animations ----
function initScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = (i % 3) * 80;
        setTimeout(() => el.classList.add('is-visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => observer.observe(el));
}

// ---- Animated stat counters ----
function initCounters() {
  const stats = document.querySelectorAll('.stat');
  if (!stats.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCount = (statEl) => {
    const target = parseInt(statEl.getAttribute('data-count'), 10) || 0;
    const suffix = statEl.getAttribute('data-suffix') || '';
    const numberEl = statEl.querySelector('.stat-number');
    if (!numberEl) return;

    if (prefersReducedMotion) {
      numberEl.textContent = target + suffix;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * eased);
      numberEl.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  stats.forEach(stat => observer.observe(stat));
}

// ---- Contact form validation + submit feedback ----
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fields = {
    name: { el: document.getElementById('name'), validate: v => v.trim().length > 0 },
    email: { el: document.getElementById('email'), validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    message: { el: document.getElementById('message'), validate: v => v.trim().length > 0 }
  };

  Object.entries(fields).forEach(([key, field]) => {
    field.el.addEventListener('blur', () => validateField(key, field));
    field.el.addEventListener('input', () => {
      const row = field.el.closest('.form-row');
      if (row && row.classList.contains('has-error') && field.validate(field.el.value)) {
        row.classList.remove('has-error');
      }
    });
  });

  function validateField(key, field) {
    const row = field.el.closest('.form-row');
    const valid = field.validate(field.el.value);
    if (row) row.classList.toggle('has-error', !valid);
    return valid;
  }

  const name = document.getElementById('name').value;
const email = document.getElementById('email').value;
const bike = document.getElementById('bike').value;
const message = document.getElementById('message').value;

const text = `Hello Richroy Motors!%0AMy name is ${name}%0AContact: ${email}%0ABike interested in: ${bike}%0AMessage: ${message}`;

window.open(`https://wa.me/+237652139226?text=${text}`, '_blank');
showToast('Opening WhatsApp...');
form.reset();
}

// ---- Toast notifications ----
let toastTimeout;
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.toggle('toast-error', isError);
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// ---- Fetch bikes from Supabase ----
async function loadBikes() {
  const grid = document.getElementById('bikesGrid');
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bikes?select=*&order=id.asc`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const bikes = await response.json();

    if (!bikes.length) {
      grid.innerHTML = '<p class="loading">No bikes available right now.</p>';
      return;
    }

    grid.innerHTML = bikes.map(bike => `
      <article class="bike-card is-visible">
        <div class="bike-image" style="background: linear-gradient(135deg, #0B2A4A, #1B4570 75%)"></div>
        <div class="price-tag">From <strong>${bike.price.toLocaleString()}</strong> FCFA</div>
        <div class="bike-body">
          <span class="bike-brand">${bike.brand}</span>
          <h3>${bike.model}</h3>
          <ul class="bike-specs">
            <li>${bike.cc}</li>
            <li>${bike.transmission}</li>
            <li>${bike.start_type}</li>
          </ul>
          <p class="bike-note">${bike.note}</p>
        </div>
      </article>
    `).join('');

  } catch (error) {
    grid.innerHTML = '<p class="loading">Failed to load bikes. Please try again.</p>';
    console.error('Supabase error:', error);
  }
}

// Call it on page load
document.addEventListener('DOMContentLoaded', loadBikes);