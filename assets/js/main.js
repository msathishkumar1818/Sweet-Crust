/* ==========================================================================
   Sweet Crust — main.js
   Reusable, vanilla-JS site behaviour shared across every page.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var html = doc.documentElement;

  /* -------------------------------------------------------------------- */
  /* Page loader                                                          */
  /* -------------------------------------------------------------------- */
  function initLoader() {
    var loader = doc.getElementById('page-loader');
    if (!loader) return;
    function hide() {
      loader.style.opacity = '0';
      loader.setAttribute('aria-hidden', 'true');
      window.setTimeout(function () {
        loader.style.display = 'none';
      }, 650);
    }
    if (doc.readyState === 'complete') {
      window.setTimeout(hide, 300);
    } else {
      window.addEventListener('load', function () {
        window.setTimeout(hide, 300);
      });
      // Safety net so the loader never gets stuck.
      window.setTimeout(hide, 2500);
    }
  }

  /* -------------------------------------------------------------------- */
  /* Dark mode                                                            */
  /* -------------------------------------------------------------------- */
  var DARK_KEY = 'sweetcrust-theme';

  function applyTheme(isDark) {
    html.classList.toggle('dark', isDark);
    doc.querySelectorAll('[id="dark-toggle"], [id="mobile-dark-toggle"]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      var sun = btn.querySelector('.icon-sun');
      var moon = btn.querySelector('.icon-moon');
      if (sun && moon) {
        sun.classList.toggle('hidden', isDark);
        moon.classList.toggle('hidden', !isDark);
      }
    });
    ['dark-label', 'mobile-dark-label'].forEach(function (id) {
      var label = doc.getElementById(id);
      if (label) label.textContent = isDark ? 'Light mode' : 'Dark mode';
    });
  }

  function initTheme() {
    var stored = null;
    try {
      stored = window.localStorage.getItem(DARK_KEY);
    } catch (e) {
      /* localStorage unavailable */
    }
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored ? stored === 'dark' : prefersDark;
    applyTheme(isDark);

    function toggle() {
      var next = !html.classList.contains('dark');
      applyTheme(next);
      try {
        window.localStorage.setItem(DARK_KEY, next ? 'dark' : 'light');
      } catch (e) {
        /* ignore */
      }
    }

    ['dark-toggle', 'mobile-dark-toggle'].forEach(function (id) {
      var btn = doc.getElementById(id);
      if (btn) btn.addEventListener('click', toggle);
    });
  }

  /* -------------------------------------------------------------------- */
  /* RTL / LTR                                                            */
  /* -------------------------------------------------------------------- */
  var DIR_KEY = 'sweetcrust-dir';

  function applyDir(isRtl) {
    html.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    var label = doc.getElementById('rtl-label');
    var mobileLabel = doc.getElementById('mobile-rtl-label');
    if (label) label.textContent = isRtl ? 'LTR' : 'RTL';
    if (mobileLabel) mobileLabel.textContent = isRtl ? 'Switch to LTR' : 'Switch to RTL';
    ['rtl-toggle', 'mobile-rtl-toggle'].forEach(function (id) {
      var button = doc.getElementById(id);
      if (button) button.setAttribute('aria-label', isRtl ? 'Switch to left-to-right text' : 'Switch to right-to-left text');
    });
  }

  function initDir() {
    var stored = null;
    try {
      stored = window.localStorage.getItem(DIR_KEY);
    } catch (e) {
      /* ignore */
    }
    applyDir(stored === 'rtl');

    function toggle() {
      var next = html.getAttribute('dir') !== 'rtl';
      applyDir(next);
      try {
        window.localStorage.setItem(DIR_KEY, next ? 'rtl' : 'ltr');
      } catch (e) {
        /* ignore */
      }
    }

    ['rtl-toggle', 'mobile-rtl-toggle'].forEach(function (id) {
      var btn = doc.getElementById(id);
      if (btn) btn.addEventListener('click', toggle);
    });
  }

  /* -------------------------------------------------------------------- */
  /* Sticky header shadow                                                 */
  /* -------------------------------------------------------------------- */
  function initStickyHeader() {
    var header = doc.getElementById('site-header');
    if (!header) return;
    function onScroll() {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* -------------------------------------------------------------------- */
  /* Desktop "Home" dropdown                                              */
  /* -------------------------------------------------------------------- */
  function initDesktopDropdown() {
    var toggle = doc.querySelector('.dropdown-toggle');
    if (!toggle) return;
    var wrapper = toggle.closest('.group');
    var menu = wrapper.querySelector('.dropdown-menu');
    var chevron = toggle.querySelector('.dropdown-chevron');

    function open() {
      menu.classList.remove('invisible', 'opacity-0', 'scale-95');
      menu.classList.add('opacity-100', 'scale-100');
      toggle.setAttribute('aria-expanded', 'true');
      if (chevron) chevron.style.transform = 'rotate(180deg)';
    }
    function close() {
      menu.classList.add('invisible', 'opacity-0', 'scale-95');
      menu.classList.remove('opacity-100', 'scale-100');
      toggle.setAttribute('aria-expanded', 'false');
      if (chevron) chevron.style.transform = '';
    }
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) close();
      else open();
    });
    doc.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) close();
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* -------------------------------------------------------------------- */
  /* Mobile menu                                                          */
  /* -------------------------------------------------------------------- */
  function initMobileMenu() {
    var btn = doc.getElementById('mobile-menu-btn');
    var menu = doc.getElementById('mobile-menu');
    var iconOpen = doc.getElementById('menu-icon-open');
    var iconClose = doc.getElementById('menu-icon-close');
    if (!btn || !menu) return;

    function toggleMenu() {
      var isOpen = !menu.classList.contains('hidden');
      menu.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (iconOpen && iconClose) {
        iconOpen.classList.toggle('hidden', !isOpen);
        iconClose.classList.toggle('hidden', isOpen);
      }
      doc.body.classList.toggle('overflow-hidden', !isOpen);
    }
    btn.addEventListener('click', toggleMenu);

    var homeToggle = doc.getElementById('mobile-home-toggle');
    var homeSubmenu = doc.getElementById('mobile-home-submenu');
    var homeChevron = doc.getElementById('mobile-home-chevron');
    if (homeToggle && homeSubmenu) {
      homeToggle.addEventListener('click', function () {
        var isHidden = homeSubmenu.classList.contains('hidden');
        homeSubmenu.classList.toggle('hidden');
        homeToggle.setAttribute('aria-expanded', String(isHidden));
        if (homeChevron) homeChevron.style.transform = isHidden ? 'rotate(180deg)' : '';
      });
    }

    // Close menu when a link inside it is clicked (keeps navigation snappy).
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (!menu.classList.contains('hidden')) toggleMenu();
      });
    });
  }

  /* -------------------------------------------------------------------- */
  /* Smooth scrolling for in-page anchors                                 */
  /* -------------------------------------------------------------------- */
  function initSmoothScroll() {
    doc.addEventListener('click', function (e) {
      var link = e.target.closest('a[href*="#"]');
      if (!link) return;
      var url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      var target = doc.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', url.hash);
    });
  }

  /* -------------------------------------------------------------------- */
  /* Scroll reveal animations                                             */
  /* -------------------------------------------------------------------- */
  function initScrollReveal() {
    var items = doc.querySelectorAll('.reveal, .img-reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.add('reveal-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            window.setTimeout(function () {
              el.classList.add('reveal-visible');
            }, (i % 4) * 70);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* -------------------------------------------------------------------- */
  /* Counter animation                                                    */
  /* -------------------------------------------------------------------- */
  function initCounters() {
    var counters = doc.querySelectorAll('.counter');
    if (!counters.length) return;

    function animate(el) {
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      var duration = 1400;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.floor(eased * target);
        el.textContent = value.toLocaleString('en-IN');
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString('en-IN');
        }
      }
      window.requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (c) {
      observer.observe(c);
    });
  }

  /* -------------------------------------------------------------------- */
  /* Product filtering (Products page)                                    */
  /* -------------------------------------------------------------------- */
  function initProductFilter() {
    var group = doc.querySelector('[data-filter-group]');
    if (!group) return;
    var buttons = group.querySelectorAll('[data-filter]');
    var sections = doc.querySelectorAll('[data-category-section]');

    function setFilter(filter) {
      sections.forEach(function (sec) {
        var match = filter === 'all' || sec.getAttribute('data-category-section') === filter;
        sec.classList.toggle('hidden', !match);
      });
      buttons.forEach(function (btn) {
        var active = btn.getAttribute('data-filter') === filter;
        btn.classList.toggle('active', active);
        btn.classList.toggle('border-berry', active);
        btn.classList.toggle('bg-berry', active);
        btn.classList.toggle('text-cream', active);
        btn.classList.toggle('dark:border-gold-light', active);
        btn.classList.toggle('dark:bg-gold-light', active);
        btn.classList.toggle('dark:text-inkdark', active);
        btn.classList.toggle('border-ink/10', !active);
        btn.classList.toggle('text-ink/70', !active);
        btn.classList.toggle('dark:border-cream/15', !active);
        btn.classList.toggle('dark:text-cream/70', !active);
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setFilter(btn.getAttribute('data-filter'));
      });
    });

    // Respect a category hash on load (e.g. products.html#sweets).
    var hash = window.location.hash.replace('#', '');
    if (hash && group.querySelector('[data-filter="' + hash + '"]')) {
      setFilter(hash);
    }
  }

  /* -------------------------------------------------------------------- */
  /* FAQ accordion                                                        */
  /* -------------------------------------------------------------------- */
  function initAccordion() {
    var wrapper = doc.querySelector('[data-accordion]');
    if (!wrapper) return;
    var triggers = wrapper.querySelectorAll('.accordion-trigger');

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var panel = trigger.nextElementSibling;
        var icon = trigger.querySelector('.accordion-icon');
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';

        // Close all others (single-open accordion).
        triggers.forEach(function (t) {
          if (t !== trigger) {
            t.setAttribute('aria-expanded', 'false');
            var p = t.nextElementSibling;
            if (p) p.classList.add('hidden');
            var ic = t.querySelector('.accordion-icon');
            if (ic) ic.style.transform = '';
          }
        });

        trigger.setAttribute('aria-expanded', String(!isOpen));
        if (panel) panel.classList.toggle('hidden', isOpen);
        if (icon) icon.style.transform = isOpen ? '' : 'rotate(180deg)';
      });
    });
  }

  /* -------------------------------------------------------------------- */
  /* Form validation (Contact + Bulk Order)                               */
  /* -------------------------------------------------------------------- */
  function initFormValidation() {
    var forms = doc.querySelectorAll('#order-request-form, #bulk-inquiry-form');
    forms.forEach(function (form) {
      var successId = form.id + '-success';
      var successEl = doc.getElementById(successId);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var valid = true;

        form.querySelectorAll('.form-field').forEach(function (field) {
          var input = field.querySelector('input, select, textarea');
          if (!input) return;
          var fieldValid = checkField(input);
          field.classList.toggle('has-error', !fieldValid);
          if (!fieldValid) valid = false;
        });

        if (valid) {
          form.reset();
          form.querySelectorAll('.form-field').forEach(function (f) {
            f.classList.remove('has-error');
          });
          if (successEl) {
            successEl.classList.remove('hidden');
            successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            window.setTimeout(function () {
              successEl.classList.add('hidden');
            }, 6000);
          }
        } else {
          var firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
          if (firstError) firstError.focus();
        }
      });

      form.querySelectorAll('input, select, textarea').forEach(function (input) {
        input.addEventListener('blur', function () {
          var field = input.closest('.form-field');
          if (!field) return;
          field.classList.toggle('has-error', !checkField(input));
        });
      });
    });

    function checkField(input) {
      if (!input.hasAttribute('required')) return true;
      var value = input.value.trim();
      if (!value) return false;
      if (input.type === 'email') {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
      if (input.type === 'tel') {
        return /^[0-9+()\-\s]{7,}$/.test(value);
      }
      if (input.type === 'number') {
        return !isNaN(parseFloat(value)) && parseFloat(value) >= (parseFloat(input.min) || 0);
      }
      return true;
    }
  }

  /* -------------------------------------------------------------------- */
  /* Back to top                                                          */
  /* -------------------------------------------------------------------- */
  function initBackToTop() {
    var btn = doc.getElementById('back-to-top');
    if (!btn) return;
    function onScroll() {
      var show = window.scrollY > 480;
      btn.classList.toggle('opacity-0', !show);
      btn.classList.toggle('pointer-events-none', !show);
      btn.classList.toggle('translate-y-4', !show);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -------------------------------------------------------------------- */
  /* Home 2 — interactive product showcase tabs                           */
  /* -------------------------------------------------------------------- */
  function initShowcaseTabs() {
    var wrapper = doc.querySelector('[data-showcase-tabs]');
    if (!wrapper) return;
    var tabs = wrapper.querySelectorAll('.showcase-tab');
    var image = doc.querySelector('[data-showcase-image]');
    var desc = doc.querySelector('[data-showcase-desc]');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          var active = t === tab;
          t.setAttribute('aria-selected', String(active));
          t.classList.toggle('border-berry', active);
          t.classList.toggle('bg-berry/5', active);
          t.classList.toggle('dark:border-gold-light', active);
          t.classList.toggle('dark:bg-gold/10', active);
          t.classList.toggle('border-ink/10', !active);
          t.classList.toggle('dark:border-cream/10', !active);
        });
        if (image) {
          image.style.opacity = '0';
          window.setTimeout(function () {
            image.src = tab.getAttribute('data-img');
            image.style.opacity = '1';
          }, 150);
        }
        if (desc) desc.textContent = tab.getAttribute('data-desc');
      });
    });
  }

  /* -------------------------------------------------------------------- */
  /* Home 2 — testimonial slider                                          */
  /* -------------------------------------------------------------------- */
  function initTestimonialSlider() {
    var slider = doc.querySelector('[data-slider]');
    if (!slider) return;
    var slides = slider.querySelectorAll('[data-slide]');
    var dots = slider.querySelectorAll('[data-slide-dot]');
    var index = 0;
    var timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, si) {
        s.classList.toggle('active', si === index);
      });
      dots.forEach(function (d, di) {
        var active = di === index;
        d.classList.toggle('w-6', active);
        d.classList.toggle('bg-gold-light', active);
        d.classList.toggle('bg-cream/25', !active);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }

    show(0);
    restart();
  }

  /* -------------------------------------------------------------------- */
  /* Home 1 — daily specials carousel controls                            */
  /* -------------------------------------------------------------------- */
  function initSpecialsCarousel() {
    var track = doc.getElementById('specials');
    if (!track) return;
    var prev = doc.querySelector('[data-carousel-prev="specials"]');
    var next = doc.querySelector('[data-carousel-next="specials"]');

    function scrollByAmount(dir) {
      var card = track.querySelector('article');
      var amount = card ? card.getBoundingClientRect().width + 20 : 300;
      var isRtl = html.getAttribute('dir') === 'rtl';
      track.scrollBy({ left: (isRtl ? -1 : 1) * dir * amount, behavior: 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { scrollByAmount(-1); });
    if (next) next.addEventListener('click', function () { scrollByAmount(1); });
  }

  /* -------------------------------------------------------------------- */
  /* Footer year                                                          */
  /* -------------------------------------------------------------------- */
  function initFooterYear() {
    var el = doc.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* -------------------------------------------------------------------- */
  /* Init                                                                  */
  /* -------------------------------------------------------------------- */
  function init() {
    initLoader();
    initTheme();
    initDir();
    initStickyHeader();
    initDesktopDropdown();
    initMobileMenu();
    initSmoothScroll();
    initScrollReveal();
    initCounters();
    initProductFilter();
    initAccordion();
    initFormValidation();
    initBackToTop();
    initShowcaseTabs();
    initTestimonialSlider();
    initSpecialsCarousel();
    initFooterYear();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();








// <!-- ============================================================ -->
// <!-- SECTION 4 — TAB INTERACTION -->
// <!-- ============================================================ -->


document.addEventListener("DOMContentLoaded", function () {

    const tabs = document.querySelectorAll("[data-showcase-tab]");
    const image = document.querySelector("[data-showcase-image]");
    const description = document.querySelector("[data-showcase-desc]");
    const number = document.querySelector("[data-showcase-number]");

    if (!tabs.length || !image || !description) return;


    tabs.forEach((tab, index) => {

        tab.addEventListener("click", function () {

            const newImage = this.dataset.img;
            const newDescription = this.dataset.desc;


            /* ==========================================
               Remove active state from all tabs
            ========================================== */

            tabs.forEach(item => {

                item.setAttribute("aria-selected", "false");

                item.classList.remove(
                    "border-berry",
                    "bg-berry/5"
                );

                item.classList.add(
                    "border-black/10",
                    "bg-transparent"
                );

                item.classList.remove(
                    "dark:border-gold-light",
                    "dark:bg-gold/10"
                );

            });


            /* ==========================================
               Add active state
            ========================================== */

            this.setAttribute("aria-selected", "true");

            this.classList.remove(
                "border-black/10",
                "bg-transparent"
            );

            this.classList.add(
                "border-berry",
                "bg-berry/5"
            );


            /* ==========================================
               Image Fade Out
            ========================================== */

            image.classList.add("opacity-0");


            setTimeout(() => {

                image.src = newImage;

                image.alt = this.querySelector(
                    ".font-display"
                )?.textContent || "Bakery product";

                description.textContent = newDescription;

                if (number) {
                    number.textContent =
                        String(index + 1).padStart(2, "0");
                }

                image.classList.remove("opacity-0");

            }, 250);

        });

    });

});








(function(){
  var revealSelectors = '.io-fade, .io-left, .io-right, .io-scale, .zoom-slow-auto, .timeline-bar-fill, .io-stagger';
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(revealSelectors).forEach(function(el){ io.observe(el); });

  var counters = document.querySelectorAll('[data-countup]');
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseFloat(el.getAttribute('data-countup'));
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1500;
      var startTime = null;
      function step(ts){
        if(!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if(progress < 1){ requestAnimationFrame(step); }
        else { el.textContent = target + suffix; }
      }
      requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(function(el){ cio.observe(el); });
})();
