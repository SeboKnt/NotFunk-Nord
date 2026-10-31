// Enhanced app.js with improved functionality and reduced AI feel

(function () {
  'use strict';

  // Clock (UTC) - NATO DTTM format: DDMMYYHHMMZ
  // Example: 2612241511Z = 15:11 UTC on 26 Dec 2024
  function updateClock() {
    var el = document.getElementById('utc-clock');
    if (!el) return;
    var now = new Date();
    var d = String(now.getUTCDate()).padStart(2, '0');      // Day
    var m = String(now.getUTCMonth() + 1).padStart(2, '0'); // Month (01-12)
    var y = String(now.getUTCFullYear()).slice(-2);         // Year (2 digits)
    var h = String(now.getUTCHours()).padStart(2, '0');
    var min = String(now.getUTCMinutes()).padStart(2, '0');
    el.textContent = d + m + y + h + min + 'Z';
  }
  setInterval(updateClock, 30000); // Update every 30 seconds
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
    el.textContent = '✓ Kopiert';
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

  // Enhanced form validation
  document.querySelectorAll('form').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      var isValid = true;
      var inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach(function(input) {
        if (input.hasAttribute('required') && !input.value.trim()) {
          isValid = false;
          input.style.borderColor = 'var(--accent-red)';
          setTimeout(() => input.style.borderColor = '', 2000);
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        var errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Bitte füllen Sie alle Pflichtfelder aus.';
        errorMsg.style.color = 'var(--accent-red)';
        errorMsg.style.marginTop = '0.5rem';
        form.insertBefore(errorMsg, form.firstChild);
        setTimeout(() => errorMsg.remove(), 3000);
      }
    });
  });

  // Dark mode toggle (if implemented)
  window.toggleDarkMode = function() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  };

  // Initialize dark mode from localStorage
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

})();