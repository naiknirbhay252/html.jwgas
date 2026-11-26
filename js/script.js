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

        if (targetId && targetId.startsWith('#')) {
          event.preventDefault();

          mobileNav.classList.remove('open');
          menuToggle.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');

          const targetSection = document.querySelector(targetId);
          if (targetSection) {
            setTimeout(() => {
              const headerHeight = siteHeader ? siteHeader.offsetHeight : 68;
              const extraGap = 16;
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
     2.5 Indian PIN Code Auto-Fill Lookup
     ----------------------------------------- */
  const pincodeInput = document.getElementById('pincode');
  const areaSelect = document.getElementById('areaSelect');
  const locationInput = document.getElementById('location');

  if (pincodeInput && areaSelect && locationInput) {
    pincodeInput.addEventListener('input', async () => {
      const pin = pincodeInput.value.replace(/\D/g, '');
      pincodeInput.value = pin;

      if (pin.length < 6) {
        areaSelect.innerHTML = '<option value="">Enter 6-digit PIN first</option>';
        areaSelect.disabled = true;
        locationInput.value = '';
        return;
      }

      if (pin.length === 6) {
        areaSelect.innerHTML = '<option value="">Fetching areas...</option>';
        areaSelect.disabled = true;

        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
          const data = await res.json();

          if (data[0].Status === 'Success' && data[0].PostOffice.length > 0) {
            const offices = data[0].PostOffice;
            const district = offices[0].District;
            const state = offices[0].State;

            locationInput.value = `${district}, ${state}`;
            areaSelect.innerHTML = '<option value="">Select Area / Locality</option>';

            offices.forEach((office) => {
              const option = document.createElement('option');
              option.value = office.Name;
              option.textContent = office.Name;
              areaSelect.appendChild(option);
            });

            areaSelect.disabled = false;
          } else {
            areaSelect.innerHTML = '<option value="">Invalid PIN code</option>';
            locationInput.value = '';
          }
        } catch (err) {
          areaSelect.innerHTML = '<option value="">Could not fetch area</option>';
          locationInput.readOnly = false;
          locationInput.placeholder = 'Enter City / District / State manually';
        }
      }
    });
  }

  /* -----------------------------------------
     3. Dealership Enquiry Form Submission
     ----------------------------------------- */
  const dealershipForm = document.getElementById('dealershipForm');
  const formFeedback = document.getElementById('formFeedback');

  if (dealershipForm) {
    dealershipForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      formFeedback.textContent = '';
      formFeedback.className = 'form-feedback';

      const fullName = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phoneNumber').value.trim();
      const email = document.getElementById('emailAddress').value.trim();
      const location = document.getElementById('location').value.trim();
      const pincode = document.getElementById('pincode').value.trim();
      const area = document.getElementById('areaSelect').value.trim();
      const fullLocation = area ? `${area}, ${location} - ${pincode}` : `${location} - ${pincode}`;
      const dealershipType = dealershipTypeInput.value.trim();
      const experience = document.getElementById('experience').value.trim();
      const additionalInfo = document.getElementById('additionalInfo').value.trim();

      if (!fullName || !phone || !email || !pincode || !area || !location) {
        formFeedback.textContent = 'Please fill in all required fields including PIN Code and Area.';
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

      const submitBtn = dealershipForm.querySelector('.submit-btn');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Enquiry...';

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: 'PASTE_YOUR_ACCESS_KEY_HERE',
            subject: `New Jwala Gas Dealership Enquiry - ${fullLocation}`,
            from_name: 'Jwala Gas Website',
            Name: fullName,
            Phone_Number: phone,
            Email_Address: email,
            Preferred_Location: fullLocation,
            Cylinder_Dealership_Type: dealershipType,
            Business_Experience: experience || 'Not specified',
            Additional_Information: additionalInfo || 'None'
          })
        });

        const result = await response.json();

        if (result.success) {
          formFeedback.textContent = `Thank you, ${fullName}! Your ${dealershipType} dealership enquiry for ${fullLocation} has been submitted successfully.`;
          formFeedback.classList.add('success');

          dealershipForm.reset();
          areaSelect.innerHTML = '<option value="">Enter 6-digit PIN first</option>';
          areaSelect.disabled = true;
          pillButtons.forEach((item) => item.classList.remove('selected'));
          dealershipTypeInput.value = '';
        } else {
          formFeedback.textContent = 'Something went wrong. Please try again or call us directly.';
          formFeedback.classList.add('error');
        }
      } catch (error) {
        formFeedback.textContent = 'Network error. Please check your internet connection and try again.';
        formFeedback.classList.add('error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }
});
