(function () {
  'use strict';

  /* ---------- 1. Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav    = document.getElementById('nav');

  function closeNav() {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }

  burger.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  // Закрываем меню при клике по ссылке
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // Закрываем меню при клике вне его
  document.addEventListener('click', function (e) {
    if (!nav.classList.contains('is-open')) return;
    if (!nav.contains(e.target) && !burger.contains(e.target)) closeNav();
  });

  // Закрываем по Esc
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  // При ресайзе до десктопа — сбрасываем состояние
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) closeNav();
  });

  /* ---------- 2. Тень шапки при скролле ---------- */
  var header = document.getElementById('header');

  function onScroll() {
    header.classList.toggle('header--scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 3. Плавная прокрутка (fallback + оффсет шапки) ---------- */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;

      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      var headerH = header.offsetHeight;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 12;

      window.scrollTo({
        top: top < 0 ? 0 : top,
        behavior: prefersReduced ? 'auto' : 'smooth'
      });

      // Обновляем hash без прыжка
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* ---------- 4. Появление элементов при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReduced) {
    revealEls.forEach(function (el) {
      var siblings = Array.prototype.slice.call(el.parentElement.children);
      var index = siblings.indexOf(el);
      if (index > 0) {
        el.style.transitionDelay = Math.min(index, 4) * 90 + 'ms';
      }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 5. Корзина ---------- */
  var cartCountEl = document.getElementById('cartCount');
  var cartBtn     = document.getElementById('cartBtn');
  var count = 0;
  var popTimer = null;

  function bumpCounter() {
    cartCountEl.classList.add('pop');
    clearTimeout(popTimer);
    popTimer = setTimeout(function () {
      cartCountEl.classList.remove('pop');
    }, 260);
  }

  document.querySelectorAll('.add-to-cart').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;

      count += 1;
      cartCountEl.textContent = count;
      bumpCounter();

      var original = btn.textContent;
      btn.textContent = 'Добавлено ✓';
      btn.disabled = true;

      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
      }, 1300);
    });
  });

  // Лёгкий отклик на кнопку корзины
  cartBtn.addEventListener('click', function () {
    if (count === 0) {
      document.getElementById('catalog').scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start'
      });
    } else {
      bumpCounter();
    }
  });

})();