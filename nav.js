(function () {
  // Resume links open the PDF directly in a new tab
  document.querySelectorAll('a[href="resume.html"]').forEach(function (a) {
    a.setAttribute('href', 'FrancisFitzgerald_Resume_2026.pdf');
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');

  if (hamburger && mobileMenu && mobileClose) {
    function openMenu() {
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
    }
    function closeMenu() {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }

    hamburger.addEventListener('click', openMenu);
    mobileClose.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  // Hide-on-scroll navbar
  const nav = document.querySelector('.home-nav');
  if (!nav) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateNav() {
    const currentScrollY = window.scrollY;
    const menuOpen = mobileMenu && mobileMenu.classList.contains('open');

    if (menuOpen || currentScrollY <= 0) {
      // Always show at the very top, or while the mobile menu is open
      nav.classList.remove('nav-hidden');
    } else if (currentScrollY > lastScrollY) {
      // Scrolling down toward the bottom — hide
      nav.classList.add('nav-hidden');
    } else if (currentScrollY < lastScrollY) {
      // Scrolling up toward the top — show
      nav.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });
})();
