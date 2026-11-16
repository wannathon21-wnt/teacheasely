/* =========================================================
   TeachEasely — main.js
   ========================================================= */

/* ---------- ตั้งค่า (แก้แค่ตรงนี้) ---------- */
var CONFIG = {
  // ลิงก์ไปหน้า Teasy Prompt Builder
  // ตัวอย่าง: 'prompt-builder/' หรือ 'https://teacheasely.com/prompt-builder/'
  // ถ้าเว้นว่างไว้ ปุ่มทุกปุ่มจะเลื่อนไปที่ส่วน "เครื่องมือแนะนำ" ในหน้านี้แทน
  PROMPT_BUILDER_URL: '',

  // ฟอร์มสมัครรับข่าวสาร (เชื่อมกับ Google Forms ได้ — ดูวิธีใน README.md)
  // formAction = ลิงก์ที่ลงท้ายด้วย /formResponse
  // emailField = ชื่อช่องอีเมล เช่น 'entry.123456789'
  NEWSLETTER: {
    formAction: '',
    emailField: ''
  }
};

(function () {
  'use strict';

  /* ---------- 1. ลิงก์ Prompt Builder ---------- */
  if (CONFIG.PROMPT_BUILDER_URL) {
    document.querySelectorAll('[data-link="prompt-builder"]').forEach(function (a) {
      a.setAttribute('href', CONFIG.PROMPT_BUILDER_URL);
    });
  }

  /* ---------- 2. เมนูมือถือ ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('main-nav');
  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'เปิดเมนู');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- 3. กรองเครื่องมือ + ค้นหา ---------- */
  var cards = Array.prototype.slice.call(document.querySelectorAll('.tool-card'));
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
  var noResults = document.getElementById('no-results');
  var statusEl = document.getElementById('search-status');
  var searchInput = document.getElementById('site-search');
  var state = { cat: 'all', q: '' };

  function normalize(s) { return (s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }

  function applyFilters() {
    var q = normalize(state.q);
    var shown = 0;
    cards.forEach(function (card) {
      var catOk = state.cat === 'all' || card.dataset.cat === state.cat;
      var text = normalize(card.textContent + ' ' + (card.dataset.keywords || ''));
      var qOk = !q || q.split(' ').every(function (w) { return text.indexOf(w) !== -1; });
      var visible = catOk && qOk;
      card.hidden = !visible;
      if (visible) shown++;
    });
    noResults.classList.toggle('is-visible', shown === 0);
    if (q) {
      statusEl.innerHTML = '';
      statusEl.appendChild(document.createTextNode('ผลการค้นหา “' + state.q + '” พบ ' + shown + ' รายการ · '));
      var clear = document.createElement('a');
      clear.href = '#tools';
      clear.textContent = 'ล้างการค้นหา';
      clear.addEventListener('click', function (e) { e.preventDefault(); resetSearch(); });
      statusEl.appendChild(clear);
    } else {
      statusEl.textContent = '';
    }
  }

  function setCat(cat) {
    state.cat = cat;
    filterBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.filter === cat ? 'true' : 'false');
    });
    applyFilters();
  }

  function resetSearch() {
    state.q = '';
    if (searchInput) searchInput.value = '';
    setCat('all');
  }

  function runSearch(q) {
    state.q = q;
    setCat('all');
    document.getElementById('tools').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () { setCat(b.dataset.filter); });
  });

  var searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      runSearch(searchInput.value);
    });
  }
  document.querySelectorAll('.chip[data-q]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      searchInput.value = chip.dataset.q;
      runSearch(chip.dataset.q);
    });
  });
  var clearLink = document.getElementById('clear-search');
  if (clearLink) clearLink.addEventListener('click', function (e) { e.preventDefault(); resetSearch(); });

  /* ---------- 4. ฟอร์มสมัครรับข่าวสาร ---------- */
  var nlForm = document.getElementById('newsletter-form');
  var nlMsg = document.getElementById('nl-msg');
  if (nlForm) {
    nlForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('nl-email');
      var email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nlMsg.textContent = 'กรอกอีเมลให้ถูกต้องก่อนนะ เช่น teacher@example.com';
        input.focus();
        return;
      }
      var cfg = CONFIG.NEWSLETTER;
      if (!cfg.formAction || !cfg.emailField) {
        nlMsg.textContent = 'ระบบสมัครทางอีเมลกำลังจะเปิดเร็วๆ นี้ ระหว่างนี้ติดตามข่าวทางเพจ Facebook ไปก่อนนะ';
        return;
      }
      var body = new FormData();
      body.append(cfg.emailField, email);
      nlMsg.textContent = 'กำลังส่ง…';
      fetch(cfg.formAction, { method: 'POST', mode: 'no-cors', body: body })
        .then(function () {
          nlMsg.textContent = 'เย่! สมัครเรียบร้อยแล้ว ขอบคุณที่เป็นเพื่อนกับ Teasy นะ';
          nlForm.reset();
        })
        .catch(function () {
          nlMsg.textContent = 'ส่งไม่สำเร็จ ลองใหม่อีกครั้งนะ';
        });
    });
  }

  /* ---------- 5. ไฮไลต์เมนูตามส่วนที่กำลังดู ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- 6. แอนิเมชันค่อยๆ ปรากฏ ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 7. ปีปัจจุบันใน footer ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
