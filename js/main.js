/* ==========================================================================
   RAPID DRY RESTORATION — main.js
   Shared interactivity: nav, scroll reveal, counters, gauge, forms
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.classList.remove('is-open');
      });
    });
  }

  /* ---------- Active nav link ---------- */
  var here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a[href]').forEach(function (a) {
    var target = a.getAttribute('href');
    if (target === here || (here === '' && target === 'index.html')) {
      a.classList.add('is-active');
    }
  });

  /* ---------- Sticky header shrink ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCounter(el) {
    if (el.dataset.counted === 'true') return; // never double-animate
    el.dataset.counted = 'true';
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
    var duration = 2000;
    var start = null;
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = value.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ---------- Timeline progress-on-scroll ---------- */
  var timeline = document.querySelector('.timeline');
  if (timeline) {
    var progress = timeline.querySelector('.timeline-progress');
    var steps = timeline.querySelectorAll('.timeline-step');
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (progress) progress.style.width = '100%';
          steps.forEach(function (step, i) {
            setTimeout(function () { step.classList.add('is-active'); }, i * 220);
          });
          tio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    tio.observe(timeline);
  }

  /* ---------- Hero ambient moisture gauge ---------- */
  var heroNeedle = document.getElementById('gaugeNeedle');
  var heroReadout = document.getElementById('gaugeReadoutNum');
  if (heroNeedle) {
    // Sweep from 0 to a "response urgency" value on load, then idle-drift gently.
    var heroValue = 72; // out of 100 — illustrates elevated moisture needing fast response
    var angle = -90 + (heroValue / 100) * 180;
    requestAnimationFrame(function () {
      setTimeout(function () {
        heroNeedle.style.transform = 'rotate(' + angle + 'deg)';
      }, 300);
    });
    if (heroReadout) {
      var cur = 0;
      var target = heroValue;
      var dur = 1600;
      var t0 = null;
      if (!reduceMotion) {
        function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          heroReadout.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        }
        setTimeout(function () { requestAnimationFrame(tick); }, 300);
      } else {
        heroReadout.textContent = target;
      }
    }
  }

  /* ---------- Testimonial slider (simple auto-rotate on mobile-width, static grid otherwise handled by CSS) ---------- */

  /* ---------- Generic contact-style form success handling ---------- */
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var action = form.getAttribute('action') || '';
      // If it's still the placeholder Formspree endpoint, don't actually submit — show demo success.
      if (action.indexOf('YOUR_FORM_ID') !== -1 || action === '') {
        e.preventDefault();
        var card = form.closest('.form-card') || form.parentElement;
        var success = card ? card.querySelector('.form-success') : null;
        if (success) {
          form.style.display = 'none';
          success.classList.add('is-visible');
        }
      }
      // Otherwise let it submit normally to the configured Formspree/Netlify endpoint.
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

})();
