/* ================================================================
   CodeTech — script.js
   All interactive features: loader, nav, theme, typing, counters,
   scroll reveal, particles, portfolio filter, carousel, FAQ,
   tech tabs, contact form, AI assistant, FAB, toast, back-to-top
   ================================================================ */

/* ---- Loader ---- */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('hide');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    initScrollReveal();
    initCounters();
  }, 2200);
});

/* ---- Scroll Progress Bar ---- */
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  if (progressBar) progressBar.style.width = `${Math.min(pct, 100)}%`;
}, { passive: true });

/* ---- Navbar scroll state ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 32);
}, { passive: true });

/* ---- Mobile hamburger ---- */
const hamburger = document.getElementById('navHamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('active');
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---- Active nav link on scroll ---- */
const sections = document.querySelectorAll('section[id], header[id]');
const navItems = document.querySelectorAll('.nav-link');
const observerNav = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navItems.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => observerNav.observe(s));

/* ---- Dark / Light Theme ---- */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  if (themeIcon) {
    themeIcon.className = dark ? 'fas fa-moon' : 'fas fa-sun';
  }
  localStorage.setItem('ct-theme', dark ? 'dark' : 'light');
}

const savedTheme = localStorage.getItem('ct-theme');
setTheme(savedTheme ? savedTheme === 'dark' : true);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(!isDark);
  });
}

/* ---- Typing Effect ---- */
const typingEl = document.getElementById('typingText');
const words = [
  'Intelligent Digital Products',
  'AI-Powered Applications',
  'Scalable Web Platforms',
  'Beautiful Mobile Apps',
  'Enterprise Solutions',
];
let wIdx = 0, cIdx = 0, deleting = false, typingTimer = null;

function typeStep() {
  if (!typingEl) return;
  const word = words[wIdx];
  if (!deleting) {
    typingEl.textContent = word.slice(0, ++cIdx);
    if (cIdx === word.length) {
      deleting = true;
      typingTimer = setTimeout(typeStep, 2200);
      return;
    }
  } else {
    typingEl.textContent = word.slice(0, --cIdx);
    if (cIdx === 0) {
      deleting = false;
      wIdx = (wIdx + 1) % words.length;
      typingTimer = setTimeout(typeStep, 300);
      return;
    }
  }
  typingTimer = setTimeout(typeStep, deleting ? 45 : 80);
}
setTimeout(typeStep, 2500);

/* ---- Animated Counters ---- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

/* ---- Scroll Reveal ---- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = parseFloat(entry.target.dataset.delay || 0) * 80;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });
  revealEls.forEach(el => obs.observe(el));
}

/* ---- Particle Canvas ---- */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    const count = Math.floor((W * H) / 18000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.5 + 0.1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const col = isDark ? '255,255,255' : '0,0,0';
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${col},${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
})();

/* ---- Portfolio Filter ---- */
(function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
        if (match) {
          card.style.animation = 'none';
          card.offsetHeight;
          card.style.animation = '';
        }
      });
    });
  });
})();

/* ---- Tech Tabs ---- */
(function initTechTabs() {
  const tabs = document.querySelectorAll('.tech-tab');
  const panels = document.querySelectorAll('.tech-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(`tab-${tab.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  });
})();

/* ---- Testimonials Carousel ---- */
(function initCarousel() {
  const track = document.getElementById('testimonialTrack');
  const dotsContainer = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (!track || !dotsContainer) return;

  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0;
  let autoTimer;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `dot${i === 0 ? ' active' : ''}`;
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  // Swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? goTo(current + 1) : goTo(current - 1); startAuto(); }
  }, { passive: true });

  startAuto();
})();

/* ---- FAQ Accordion ---- */
(function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* ---- Contact Form ---- */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();
    if (!name || !email || !message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    const origHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    setTimeout(() => {
      form.reset();
      btn.innerHTML = origHTML;
      btn.disabled = false;
      showToast('Message sent! We\'ll be in touch within 24 hours.', 'success');
    }, 1800);
  });
})();

/* ---- Career Apply Buttons ---- */
document.querySelectorAll('.career-apply').forEach(btn => {
  btn.addEventListener('click', () => {
    const job = btn.dataset.job;
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const msg = document.getElementById('cMessage');
      if (msg) msg.value = `Hi, I'd like to apply for the ${job} position at CodeTech.`;
      showToast(`Applying for: ${job}`, 'success');
    }, 800);
  });
});

/* ---- FAB (Floating Action Buttons) ---- */
(function initFAB() {
  const mainBtn = document.getElementById('fabMain');
  const actions = document.getElementById('fabActions');
  if (!mainBtn || !actions) return;
  mainBtn.addEventListener('click', () => {
    const open = mainBtn.classList.toggle('open');
    actions.classList.toggle('open', open);
    mainBtn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', e => {
    if (!mainBtn.contains(e.target) && !actions.contains(e.target)) {
      mainBtn.classList.remove('open');
      actions.classList.remove('open');
      mainBtn.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ---- AI Assistant ---- */
(function initAIAssistant() {
  const fabAIBtn = document.getElementById('fabAIBtn');
  const overlay = document.getElementById('aiModalOverlay');
  const closeBtn = document.getElementById('aiClose');
  const sendBtn = document.getElementById('aiSendBtn');
  const input = document.getElementById('aiInput');
  const chatArea = document.getElementById('aiChatArea');
  if (!fabAIBtn || !overlay || !chatArea) return;

  const responses = {
    services: 'We offer Website Development, AI Applications, Mobile Apps, Web Applications, UI/UX Design, E-Commerce, Cloud Solutions, DevOps, API Development, Business Automation, SEO, Digital Marketing, Software Maintenance, Custom Software, and AI Chatbots.',
    pricing: 'Our pricing depends on the project scope. A basic website starts around ₹25,000, web applications from ₹1,00,000, and AI applications from ₹2,00,000. Contact us for a detailed, free estimate tailored to your project.',
    timeline: 'A standard website takes 2–4 weeks, web applications 4–12 weeks, and mobile apps 6–16 weeks depending on complexity. We provide detailed project timelines during our discovery call.',
    support: 'Yes! All projects include 30 days of free post-launch support. We also offer monthly retainer plans for ongoing maintenance, bug fixes, updates, and feature development.',
    default: 'That\'s a great question! Our team would love to discuss this in detail. You can reach us at codetech@gmail.com or call +91 83418 27908. Or fill out the contact form below for a quick response.',
  };

  function getResponse(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes('service') || lower.includes('what do you')) return responses.services;
    if (lower.includes('pric') || lower.includes('cost') || lower.includes('budget')) return responses.pricing;
    if (lower.includes('time') || lower.includes('long') || lower.includes('how fast')) return responses.timeline;
    if (lower.includes('support') || lower.includes('maintenance') || lower.includes('after')) return responses.support;
    return responses.default;
  }

  function addMessage(text, isUser) {
    const div = document.createElement('div');
    div.className = `ai-msg${isUser ? ' user' : ''}`;
    div.innerHTML = isUser
      ? `<p>${text}</p>`
      : `<div class="ai-msg-icon"><i class="fas fa-robot"></i></div><p>${text}</p>`;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function sendMessage(text) {
    if (!text.trim()) return;
    addMessage(text, true);
    if (input) input.value = '';
    setTimeout(() => addMessage(getResponse(text), false), 800);
  }

  const openModal = () => {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    if (input) input.focus();
  };
  const closeModal = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  };

  fabAIBtn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  sendBtn?.addEventListener('click', () => sendMessage(input?.value || ''));
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(input.value); });

  document.querySelectorAll('.ai-q-btn').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.q));
  });
})();

/* ---- Back to Top ---- */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ---- Toast Notifications ---- */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i>${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('exiting');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3500);
}

/* ---- Smooth scroll for anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || 72, 10);
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});
