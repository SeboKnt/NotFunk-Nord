// Shared utilities for NotFunk-Nord

(function () {
  'use strict';

  // Clock (UTC)
  function updateClock() {
    var el = document.getElementById('utc-clock');
    if (!el) return;
    var now = new Date();
    var h = String(now.getUTCHours()).padStart(2, '0');
    var m = String(now.getUTCMinutes()).padStart(2, '0');
    var s = String(now.getUTCSeconds()).padStart(2, '0');
    el.textContent = h + ':' + m + ':' + s + ' UTC';
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Mobile menu toggle
  var menuBtn = document.querySelector('.menu-toggle');
  var navLinks = document.getElementById('nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Copy to clipboard utility
  window.copyToClipboard = function (text, el) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showCopiedFeedback(el);
      });
    } else {
      // Fallback
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showCopiedFeedback(el);
    }
  };

  function showCopiedFeedback(el) {
    if (!el) return;
    var orig = el.textContent;
    el.textContent = 'Kopiert!';
    el.style.color = 'var(--accent-green)';
    setTimeout(function () {
      el.textContent = orig;
      el.style.color = '';
    }, 1500);
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').substring(1);
      var el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Active nav highlight on scroll
  window.addEventListener('scroll', function () {
    var sections = document.querySelectorAll('section[id]');
    var current = '';
    sections.forEach(function (s) {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href');
      a.classList.toggle('active', href === '#' + current || (current === '' && href === '/'));
    });
  });

})();
