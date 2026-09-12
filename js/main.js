/* ==========================================================================
   JYGA ARCHITECTS — main.js
   Vanilla JS: header scroll state, fullscreen nav overlay, overlay search,
   scroll reveals, projects filter/sort/search, footer year.
   No dependencies/build step required.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector('.site-header');
  var isLightPage = header && header.classList.contains('is-light');

  function onScroll() {
    if (!header || isLightPage) return;
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Fullscreen nav overlay toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var htmlEl = document.documentElement;

  function closeNav() {
    htmlEl.classList.remove('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function openNav() {
    htmlEl.classList.add('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var input = document.getElementById('overlaySearchInput');
    if (input) setTimeout(function () { input.focus(); }, 350);
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      htmlEl.classList.contains('nav-open') ? closeNav() : openNav();
    });
    document.querySelectorAll('.site-nav-overlay a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* Header's own search icon opens the same overlay, focused on the input */
  var searchTrigger = document.getElementById('searchTrigger');
  if (searchTrigger) {
    searchTrigger.addEventListener('click', openNav);
  }

  /* Overlay search: Enter navigates to the projects page with a query */
  var overlaySearch = document.getElementById('overlaySearchInput');
  if (overlaySearch) {
    overlaySearch.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && overlaySearch.value.trim()) {
        window.location.href = 'projects.html?q=' + encodeURIComponent(overlaySearch.value.trim());
      }
    });
  }

  /* ---------- Hero video slider ---------- */
  var heroSlides = document.querySelectorAll('.hero-video-wrap');
  var heroDots = document.querySelectorAll('.hero-dots button');
  if (heroSlides.length > 1) {
    var heroCurrent = 0;
    var heroIntervalMs = 7000;
    var heroTimer;

    function heroPlay(index) {
      var wrap = heroSlides[index];
      var v = wrap.querySelector('video');
      if (v) { v.currentTime = 0; v.play().catch(function () {}); }
    }
    function heroPause(index) {
      var wrap = heroSlides[index];
      var v = wrap.querySelector('video');
      if (v) v.pause();
    }
    function heroGoTo(index) {
      heroPause(heroCurrent);
      heroSlides[heroCurrent].classList.remove('is-active');
      if (heroDots[heroCurrent]) heroDots[heroCurrent].classList.remove('is-active');
      heroCurrent = (index + heroSlides.length) % heroSlides.length;
      heroSlides[heroCurrent].classList.add('is-active');
      if (heroDots[heroCurrent]) heroDots[heroCurrent].classList.add('is-active');
      heroPlay(heroCurrent);
    }
    function heroNext() { heroGoTo(heroCurrent + 1); }
    function heroStart() { heroStop(); heroTimer = setInterval(heroNext, heroIntervalMs); }
    function heroStop() { if (heroTimer) clearInterval(heroTimer); }

    heroDots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        heroGoTo(i);
        heroStart();
      });
    });

    heroPlay(0);
    heroStart();
  }

  /* ---------- Scroll reveals ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Contact form (static-site friendly placeholder) ---------- */
  var contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = contactForm.querySelector('[data-form-note]');
      if (note) {
        note.textContent = 'Thanks — your message has been noted. Wire this form up to Formspree, or your host\u2019s mail handler, before going live.';
        note.hidden = false;
      }
      contactForm.reset();
    });
  }

  /* ======================================================================
     Projects page — search, type/location filter, alphabetical/featured sort
     ====================================================================== */
  var grid = document.getElementById('projectsGrid');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.project-card'));
    var searchInput = document.getElementById('projectsSearchInput');
    var typeSelect = document.getElementById('projectsTypeFilter');
    var locSelect = document.getElementById('projectsLocationFilter');
    var sortBtns = document.querySelectorAll('.projects-sort button');
    var countEl = document.getElementById('projectsCount');
    var emptyEl = document.getElementById('projectsEmpty');
    var currentSort = 'featured';

    // Pre-fill search from ?q= param (set by the nav overlay search)
    var params = new URLSearchParams(window.location.search);
    if (params.get('q') && searchInput) searchInput.value = params.get('q');

    function applyFilters() {
      var q = (searchInput ? searchInput.value : '').trim().toLowerCase();
      var type = typeSelect ? typeSelect.value : '';
      var loc = locSelect ? locSelect.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var title = (card.dataset.title || '').toLowerCase();
        var cardType = card.dataset.type || '';
        var cardLoc = card.dataset.location || '';
        var matchesQ = !q || title.indexOf(q) !== -1 || cardType.toLowerCase().indexOf(q) !== -1 || cardLoc.toLowerCase().indexOf(q) !== -1;
        var matchesType = !type || cardType === type;
        var matchesLoc = !loc || cardLoc === loc;
        var show = matchesQ && matchesType && matchesLoc;
        card.hidden = !show;
        if (show) visibleCount++;
      });

      if (countEl) countEl.textContent = visibleCount + (visibleCount === 1 ? ' Project' : ' Projects');
      if (emptyEl) emptyEl.classList.toggle('is-visible', visibleCount === 0);
      applySort();
    }

    function applySort() {
      var visible = cards.filter(function (c) { return !c.hidden; });
      if (currentSort === 'alpha') {
        visible.sort(function (a, b) { return a.dataset.title.localeCompare(b.dataset.title); });
      } else {
        visible.sort(function (a, b) { return (+a.dataset.order) - (+b.dataset.order); });
      }
      visible.forEach(function (c) { grid.appendChild(c); });
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (typeSelect) typeSelect.addEventListener('change', applyFilters);
    if (locSelect) locSelect.addEventListener('change', applyFilters);
    sortBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        sortBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        currentSort = btn.dataset.sort;
        applySort();
      });
    });

    applyFilters();
  }
})();
