/* =========================================================
   main.js — 화면 인터랙션
   ---------------------------------------------------------
   01. 유틸 / 모바일 100vh 보정
   02. Header (스크롤 시 배경) + 현재 섹션 메뉴 표시
   03. 모바일 메뉴
   04. 부드러운 앵커 스크롤
   05. 메인 슬라이드
   06. 스크롤 등장 애니메이션 + 숫자 카운트
   07. 생산품목 탭 / 썸네일
   08. 파트너 무한 흐름
   09. 맨 위로 버튼 / 기타
   * 외부 라이브러리 없이 동작하며, 구형 브라우저 호환을 위해 ES5 문법으로 작성했습니다.
   ========================================================= */
(function () {
  'use strict';

  var CONFIG = window.SITE_CONFIG || {};
  var doc = document;
  var root = doc.documentElement;
  // true 로 바꾸면 OS에서 '애니메이션 끄기'를 설정한 사용자에게는 패럴랙스·카운트·스크롤 애니메이션을 생략합니다.
  // false(기본) = 모든 PC에서 동일하게 애니메이션 동작
  var RESPECT_REDUCED_MOTION = false;
  var reduceMotion = RESPECT_REDUCED_MOTION && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 01. 유틸 ---------- */
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function getScrollY() { return window.pageYOffset || root.scrollTop || 0; }

  var raf = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };

  // 모바일 브라우저 주소창 때문에 100vh 가 넘치는 문제 보정 → CSS 변수 --vh
  var lastW = window.innerWidth;
  function setVh() { root.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px'); }
  setVh();
  window.addEventListener('resize', function () {
    // 스크롤 중 주소창이 줄었다 늘었다 할 때마다 높이가 튀지 않도록 가로폭이 바뀔 때만 갱신
    if (window.innerWidth !== lastW) { lastW = window.innerWidth; setVh(); }
  });
  window.addEventListener('orientationchange', function () { setTimeout(setVh, 200); });

  // passive 이벤트 지원 여부 (스크롤 성능)
  var passive = false;
  try {
    var opts = Object.defineProperty({}, 'passive', { get: function () { passive = { passive: true }; return true; } });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) { /* noop */ }


  /* ---------- 02. Header ---------- */
  var header = $('#header');
  var navLinks = $$('.gnb__link');
  var sections = navLinks
    .map(function (a) { return $(a.getAttribute('href')); })
    .filter(Boolean);

  function headerOffset() { return header ? header.offsetHeight : 0; }

  function onScroll() {
    var y = getScrollY();

    // 스크롤하면 헤더 배경 생성 + 메뉴 컬러 변경
    if (header) header.classList.toggle('is-scrolled', y > 40);

    // 현재 보고 있는 섹션 메뉴 강조
    var pos = y + headerOffset() + window.innerHeight * 0.3;
    var currentId = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= pos) currentId = sections[i].id;
    }
    // 페이지 맨 끝이면 마지막 메뉴(문의)를 강조
    if (window.innerHeight + y >= doc.body.scrollHeight - 4 && sections.length) {
      currentId = sections[sections.length - 1].id;
    }
    navLinks.forEach(function (a) {
      a.classList.toggle('is-current', a.getAttribute('href') === '#' + currentId);
    });

    // 맨 위로 버튼
    if (toTop) toTop.classList.toggle('is-show', y > window.innerHeight * 0.8);

    // 메인 텍스트 살짝 위로 흐려지며 사라지는 패럴랙스
    if (!reduceMotion && heroEl && y < window.innerHeight) {
      var ratio = y / window.innerHeight;
      $$('.hero__content', heroEl).forEach(function (el) {
        el.style.transform = 'translate3d(0,' + (y * 0.35) + 'px,0)';
        el.style.opacity = String(1 - ratio * 1.2);
      });
    }
  }

  var ticking = false;
  function requestScroll() {
    if (ticking) return;
    ticking = true;
    raf(function () { onScroll(); ticking = false; });
  }


  /* ---------- 03. 모바일 메뉴 ---------- */
  var menuBtn = $('#menuToggle');

  function setMenu(open) {
    if (!header || !menuBtn) return;
    header.classList.toggle('is-menu-open', open);
    doc.body.classList.toggle('is-locked', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(!header.classList.contains('is-menu-open'));
    });
  }
  doc.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.keyCode === 27) && header.classList.contains('is-menu-open')) setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024 && header.classList.contains('is-menu-open')) setMenu(false);
  });


  /* ---------- 04. 부드러운 앵커 스크롤 ---------- */
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function smoothScrollTo(targetY) {
    var startY = getScrollY();
    var dist = targetY - startY;
    if (reduceMotion || Math.abs(dist) < 2) { window.scrollTo(0, targetY); return; }
    var duration = Math.min(1400, Math.max(600, Math.abs(dist) * 0.45));
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      window.scrollTo(0, startY + dist * easeInOutCubic(p));
      if (p < 1) raf(step);
    }
    raf(step);
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      var target = $(href);
      if (!target) return;
      e.preventDefault();
      var wasOpen = header.classList.contains('is-menu-open');
      setMenu(false);
      var y = href === '#top' ? 0 : target.getBoundingClientRect().top + getScrollY() - headerOffset() + 1;
      // 모바일 메뉴가 닫히는 애니메이션과 겹치지 않게 살짝 지연
      setTimeout(function () { smoothScrollTo(Math.max(0, y)); }, wasOpen ? 250 : 0);
    });
  });


  /* ---------- 05. 메인 슬라이드 ---------- */
  var heroEl = $('.hero');
  (function initHero() {
    if (!heroEl) return;
    var slides = $$('.hero__slide', heroEl);
    var dots = $$('.hero__dot', heroEl);
    var current = $('.hero__current', heroEl);
    var total = $('.hero__total', heroEl);
    var interval = CONFIG.HERO_INTERVAL || 6000;
    var index = 0;
    var timer = null;

    if (slides.length < 2) return;
    heroEl.style.setProperty('--hero-duration', interval + 'ms');
    if (total) total.textContent = pad(slides.length);

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function go(next) {
      next = (next + slides.length) % slides.length;
      slides[index].classList.remove('is-active');
      dots[index] && dots[index].classList.remove('is-active');
      dots[index] && dots[index].setAttribute('aria-selected', 'false');

      index = next;
      slides[index].classList.add('is-active');
      if (dots[index]) {
        // 진행 바 애니메이션 재시작 (reflow)
        var bar = dots[index].querySelector('.hero__progress');
        if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
        dots[index].classList.add('is-active');
        dots[index].setAttribute('aria-selected', 'true');
      }
      if (current) current.textContent = pad(index + 1);
      restart();
    }

    function restart() {
      clearTimeout(timer);
      if (heroEl.classList.contains('is-paused')) return;
      timer = setTimeout(function () { go(index + 1); }, interval);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { if (i !== index) go(i); });
    });

    // 스와이프 (모바일)
    var startX = 0, startY = 0;
    heroEl.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    }, passive);
    heroEl.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
    }, passive);

    // 다른 탭으로 이동하면 일시정지
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) { heroEl.classList.add('is-paused'); clearTimeout(timer); }
      else { heroEl.classList.remove('is-paused'); go(index); }
    });

    restart();
  })();


  /* ---------- 06. 스크롤 등장 애니메이션 + 숫자 카운트 ---------- */
  function formatNum(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = formatNum(target) + suffix; return; }
    var duration = 2000;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);   // easeOutExpo
      el.textContent = formatNum(Math.round(target * eased)) + suffix;
      if (p < 1) raf(step);
    }
    raf(step);
  }

  function reveal(el) {
    el.classList.add('is-visible');
    // 등장 완료 후 지연시간 제거 (hover 반응 즉시)
    setTimeout(function () { el.classList.add('is-revealed'); }, 1700);
    $$('[data-count]', el).forEach(runCounter);
  }

  var revealEls = $$('[data-reveal]');
  // data-reveal 밖에 있는 카운터 (예: about 배지)
  var looseCounters = $$('[data-count]').filter(function (el) { return !el.closest || !el.closest('[data-reveal]'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.hasAttribute('data-reveal')) reveal(el); else runCounter(el);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { io.observe(el); });
    looseCounters.forEach(function (el) { io.observe(el); });
  } else {
    // 구형 브라우저: 바로 표시
    revealEls.forEach(reveal);
    looseCounters.forEach(runCounter);
  }


  /* ---------- 07. 생산품목 탭 / 썸네일 ---------- */
  (function initTabs() {
    var nav = $('.tabs__nav');
    if (!nav) return;
    var btns = $$('.tabs__btn', nav);
    var indicator = $('.tabs__indicator', nav);

    function moveIndicator() {
      var active = $('.tabs__btn.is-active', nav);
      if (!active || !indicator) return;
      indicator.style.width = active.offsetWidth + 'px';
      indicator.style.transform = 'translateX(' + active.offsetLeft + 'px)';
    }

    function activate(btn, focus) {
      btns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.setAttribute('tabindex', on ? '0' : '-1');
        var panel = doc.getElementById(b.getAttribute('aria-controls'));
        if (panel) {
          panel.classList.toggle('is-active', on);
          if (on) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
        }
      });
      if (focus) btn.focus();
      moveIndicator();
    }

    btns.forEach(function (btn, i) {
      btn.setAttribute('tabindex', btn.classList.contains('is-active') ? '0' : '-1');
      btn.addEventListener('click', function () { activate(btn); });
      btn.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowLeft') {
          e.preventDefault();
          var n = (i + (k === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length;
          activate(btns[n], true);
        }
      });
    });

    moveIndicator();
    window.addEventListener('resize', moveIndicator);
    window.addEventListener('load', moveIndicator);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(moveIndicator);
  })();

  // 썸네일 클릭 → 메인 이미지 교체 (페이드)
  $$('.product__gallery').forEach(function (gallery) {
    var main = $('.product__main img', gallery);
    var thumbs = $$('.product__thumb', gallery);
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var img = thumb.querySelector('img');
        if (!img || !main || main.getAttribute('src') === img.getAttribute('src')) return;
        thumbs.forEach(function (t) { t.classList.toggle('is-active', t === thumb); });
        main.classList.add('is-changing');
        setTimeout(function () {
          main.setAttribute('src', img.getAttribute('src'));
          main.setAttribute('alt', img.getAttribute('alt'));
          main.classList.remove('is-changing');
        }, 250);
      });
    });
  });


  /* ---------- 08. 파트너 무한 흐름 ---------- */
  (function initMarquee() {
    var track = $('.marquee__track');
    if (!track) return;
    var originals = $$('li', track);
    if (!originals.length) return;

    // 한 세트의 폭이 화면보다 넓어질 때까지 복제한 뒤, 전체를 한 번 더 복제(-50% 루프)
    var set = originals.slice();
    var guard = 0;
    while (track.scrollWidth < window.innerWidth * 1.2 && guard < 10) {
      originals.forEach(function (li) { var c = li.cloneNode(true); track.appendChild(c); set.push(c); });
      guard++;
    }
    set.forEach(function (li) {
      var c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
    });
  })();


  /* ---------- 09. 맨 위로 / 기타 ---------- */
  var toTop = $('#toTop');
  if (toTop) toTop.addEventListener('click', function () { smoothScrollTo(0); });

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  window.addEventListener('scroll', requestScroll, passive);
  window.addEventListener('resize', requestScroll);
  onScroll();
})();
