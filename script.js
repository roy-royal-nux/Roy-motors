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

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let allValid = true;
    Object.entries(fields).forEach(([key, field]) => {
      if (!validateField(key, field)) allValid = false;
    });

    if (!allValid) {
      showToast('Please fix the highlighted fields.', true);
      return;
    }

    // No backend connected yet — this is where a service like
    // Formspree or EmailJS would receive the submission.
    showToast('Message sent. We\u2019ll be in touch soon.');
    form.reset();
  });
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
