document.addEventListener('DOMContentLoaded', () => {
  /* -----------------------------------------
     1. Mobile Hamburger Menu Toggle & Exact Section Scroll
     ----------------------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const siteHeader = document.querySelector('.site-header');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      menuToggle.classList.toggle('active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');

        // Only handle internal section links (#services, #about, etc.)
        if (targetId && targetId.startsWith('#')) {
          event.preventDefault();

          // 1. Close the dropdown menu first
          mobileNav.classList.remove('open');
          menuToggle.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');

          const targetSection = document.querySelector(targetId);
          if (targetSection) {
            // 2. Wait briefly for the menu collapse, then scroll to exact heading position
            setTimeout(() => {
              const headerHeight = siteHeader ? siteHeader.offsetHeight : 68;
              const extraGap = 16; // Clean breathing room above the heading
              const targetPosition =
                targetSection.getBoundingClientRect().top + window.scrollY - headerHeight - extraGap;

              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });
            }, 50);
          }
        }
      });
    });
  }

  /* -----------------------------------------
     2. Dealership Type Pill Selector
     ----------------------------------------- */
  const pillButtons = document.querySelectorAll('.pill-btn');
  const dealershipTypeInput = document.getElementById('dealershipType');

  pillButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      pillButtons.forEach((item) => item.classList.remove('selected'));
      btn.classList.add('selected');
      dealershipTypeInput.value = btn.getAttribute('data-value');
    });
  });

  /* -----------------------------------------
     3. Dealership Enquiry Form Validation
     ----------------------------------------- */
  const dealershipForm = document.getElementById('dealershipForm');
  const formFeedback = document.getElementById('formFeedback');

  if (dealershipForm) {
    dealershipForm.addEventListener('submit', (event) => {
      event.preventDefault();
      formFeedback.textContent = '';
      formFeedback.className = 'form-feedback';

      const fullName = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phoneNumber').value.trim();
      const email = document.getElementById('emailAddress').value.trim();
      const location = document.getElementById('location').value.trim();
      const dealershipType = dealershipTypeInput.value.trim();

      if (!fullName || !phone || !email || !location) {
        formFeedback.textContent = 'Please fill in all required fields.';
        formFeedback.classList.add('error');
        return;
      }

      if (!dealershipType) {
        formFeedback.textContent = 'Please select a Dealership Type (Domestic LPG, Commercial LPG, or Both).';
        formFeedback.classList.add('error');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        formFeedback.textContent = 'Please enter a valid email address.';
        formFeedback.classList.add('error');
        return;
      }

      // Simulated successful submission
      formFeedback.textContent = `Thank you, ${fullName}! Your ${dealershipType} dealership enquiry for ${location} has been submitted.`;
      formFeedback.classList.add('success');

      dealershipForm.reset();
      pillButtons.forEach((item) => item.classList.remove('selected'));
      dealershipTypeInput.value = '';
    });
  }
});