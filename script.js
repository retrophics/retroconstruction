

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav-links');

  /* Sticky header depth */
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* Mobile navigation */
  if (menuBtn && nav) {
    const closeMenu = () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    };

    menuBtn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', event => {
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(event.target) && !menuBtn.contains(event.target)) closeMenu();
    });
  }

  /* FAQ accordion — only one open at a time */
  document.querySelectorAll('.faq-q').forEach(button => {
    button.addEventListener('click', () => {
      const currentItem = button.closest('.faq-item');
      if (!currentItem) return;

      document.querySelectorAll('.faq-item.open').forEach(item => {
        if (item !== currentItem) item.classList.remove('open');
      });

      currentItem.classList.toggle('open');
    });
  });

  /* Project filtering with a soft transition */
  const filters = [...document.querySelectorAll('.filter-btn')];
  const projects = [...document.querySelectorAll('.project-card[data-category], [data-category].project-card')];

  filters.forEach(button => {
    button.addEventListener('click', () => {
      const selected = button.dataset.filter || 'all';

      filters.forEach(item => item.classList.remove('active'));
      button.classList.add('active');

      projects.forEach((card, index) => {
        const shouldShow = selected === 'all' || card.dataset.category === selected;

        if (shouldShow) {
          card.classList.remove('hide', 'filter-leaving');
          card.classList.remove('filter-entering');
          void card.offsetWidth;
          card.style.animationDelay = `${Math.min(index * 45, 260)}ms`;
          card.classList.add('filter-entering');
          setTimeout(() => card.classList.remove('filter-entering'), 800);
        } else {
          card.classList.add('filter-leaving');
          setTimeout(() => card.classList.add('hide'), 280);
        }
      });
    });
  });

  /* Contact-form demo */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();

      const toast = document.querySelector('.toast');
      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      const originalText = submitButton?.textContent;

      if (submitButton) {
        submitButton.classList.add('is-loading');
        submitButton.textContent = 'Sending...';
      }

      setTimeout(() => {
        toast?.classList.add('show');
        form.reset();

        if (submitButton) {
          submitButton.classList.remove('is-loading');
          submitButton.textContent = originalText || 'Send Message';
        }

        setTimeout(() => toast?.classList.remove('show'), 3500);
      }, 550);
    });
  }

  /* Scroll reveal animations */
  const revealSelectors = [
    '.card',
    '.project-card',
    '.quote',
    '.service-tile',
    '.stat',
    '.process-step',
    '.section-heading',
    '.split > *',
    '.contact-panel',
    '.form',
    '.cta-banner'
  ];

  const revealElements = [...document.querySelectorAll(revealSelectors.join(','))];

  revealElements.forEach((element, index) => {
    element.classList.add('reveal');

    const parent = element.parentElement;
    if (parent) {
      const siblings = [...parent.children].filter(child =>
        revealSelectors.some(selector => child.matches?.(selector))
      );
      const siblingIndex = siblings.indexOf(element);

      if (siblingIndex >= 0) {
        element.style.setProperty('--reveal-delay', `${Math.min(siblingIndex * 90, 360)}ms`);
      }
    } else {
      element.style.setProperty('--reveal-delay', `${Math.min(index * 35, 250)}ms`);
    }
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach(element => element.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -45px'
    });

    revealElements.forEach(element => revealObserver.observe(element));
  }

  /* Animated counters */
  const statNumbers = [...document.querySelectorAll('.stat strong, .trust-item b')];

  const animateCounter = element => {
    if (element.dataset.counted === 'true') return;

    const original = element.textContent.trim();
    const match = original.match(/([\d,.]+)/);

    if (!match) return;

    const target = Number(match[1].replace(/,/g, ''));

    if (!Number.isFinite(target)) return;

    const prefix = original.slice(0, match.index);
    const suffix = original.slice((match.index || 0) + match[1].length);

    const duration = 1450;
    const startTime = performance.now();

    element.dataset.counted = 'true';

    const tick = now => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const value = Math.round(target * eased);

      element.textContent = `${prefix}${value.toLocaleString()}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        element.textContent = original;
      }
    };

    requestAnimationFrame(tick);
  };

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    statNumbers.forEach(el => el.dataset.counted = 'true');
  } else {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.55 });

    statNumbers.forEach(el => counterObserver.observe(el));
  }

  /* Hero parallax */
  const hero = document.querySelector('.hero');

  if (hero &&
      !prefersReducedMotion &&
      window.matchMedia('(pointer: fine)').matches) {

    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      hero.style.backgroundPosition =
        `${50 + x * 1.8}% ${50 + y * 1.2}%`;
    });

    hero.addEventListener('pointerleave', () => {
      hero.style.backgroundPosition = '';
    });
  }

})();