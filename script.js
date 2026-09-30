document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // Navigation & Mobile Menu
  const nav = $('#siteNav');
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('#mobileMenu');
  const menuCloseBtn = $('#menuCloseBtn');
  const backTop = $('#backTop');

  function toggleMenu(open) {
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('no-scroll', open);
  }

  if (menuToggle) menuToggle.addEventListener('click', () => toggleMenu(true));
  if (menuCloseBtn) menuCloseBtn.addEventListener('click', () => toggleMenu(false));
  $$('.mobile-link').forEach(link => link.addEventListener('click', () => toggleMenu(false)));

  // Scroll Header & Back-to-Top
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Scroll Reveal Animations
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${Math.min(idx * 40, 200)}ms`;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  $$('.reveal').forEach(el => observer.observe(el));

  // Gallery Filter & Lightbox
  const filterBtns = $$('.filter-btn');
  const galleryItems = $$('.gallery-item');
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImage');
  const lightboxCaption = $('#lightboxCaption');
  const lightboxCount = $('#lightboxCount');
  const lightboxClose = $('#lightboxClose');
  const lightboxPrev = $('#lightboxPrev');
  const lightboxNext = $('#lightboxNext');

  let currentGalleryList = galleryItems;
  let currentIndex = 0;

  // Filter functionality
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      galleryItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

      currentGalleryList = galleryItems.filter(item => item.style.display !== 'none');
    });
  });

  function updateLightbox(index) {
    if (!currentGalleryList.length) return;
    currentIndex = (index + currentGalleryList.length) % currentGalleryList.length;
    const item = currentGalleryList[currentIndex];
    const img = $('img', item);
    const title = $('.gallery-title', item)?.textContent || img.alt;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = title;
    lightboxCount.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(currentGalleryList.length).padStart(2, '0')}`;
  }

  function openLightbox(item) {
    const visibleIndex = currentGalleryList.indexOf(item);
    if (visibleIndex === -1) return;
    updateLightbox(visibleIndex);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => updateLightbox(currentIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => updateLightbox(currentIndex + 1));

  document.addEventListener('keydown', e => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') updateLightbox(currentIndex - 1);
    if (e.key === 'ArrowRight') updateLightbox(currentIndex + 1);
  });

  // FAQ Accordion
  $$('.faq-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      const isOpen = item.classList.contains('active');

      $$('.faq-item').forEach(i => i.classList.remove('active'));
      $$('.faq-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));

      if (!isOpen) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Contact / Booking Form Validation & WhatsApp Redirect
  const bookingForm = $('#bookingForm');
  const successModal = $('#successModal');
  const modalCloseBtn = $('#modalCloseBtn');
  const refCodeEl = $('#refCode');
  const waRedirectBtn = $('#waRedirectBtn');

  if (bookingForm) {
    bookingForm.addEventListener('submit', e => {
      e.preventDefault();
      let isValid = true;

      // Reset errors
      $$('.form-group').forEach(group => group.classList.remove('invalid'));

      const nameInput = $('#fullName');
      const emailInput = $('#email');
      const phoneInput = $('#phone');
      const packageSelect = $('#package');
      const dateInput = $('#travelDate');
      const guestsSelect = $('#guests');
      const msgInput = $('#message');

      if (!nameInput.value.trim()) {
        nameInput.closest('.form-group').classList.add('invalid');
        isValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        emailInput.closest('.form-group').classList.add('invalid');
        isValid = false;
      }

      if (!phoneInput.value.trim()) {
        phoneInput.closest('.form-group').classList.add('invalid');
        isValid = false;
      }

      if (!packageSelect.value) {
        packageSelect.closest('.form-group').classList.add('invalid');
        isValid = false;
      }

      if (!isValid) return;

      const submitBtn = $('#submitBtn');
      submitBtn.disabled = true;

      // Generate random inquiry ref code
      const refNumber = 'KTP-' + Math.floor(10000 + Math.random() * 90000);
      if (refCodeEl) refCodeEl.textContent = refNumber;

      // Build WhatsApp message string
      const packageNameText = packageSelect.options[packageSelect.selectedIndex].text;
      const guestsText = guestsSelect ? guestsSelect.options[guestsSelect.selectedIndex].text : 'N/A';
      const dateText = dateInput && dateInput.value ? dateInput.value : 'Not specified';
      const userMessage = msgInput && msgInput.value.trim() ? msgInput.value.trim() : 'None';

      const waMessageText = 
`*KATPANA DESERT TOUR INQUIRY* (${refNumber})
-----------------------------------------
👤 *Name:* ${nameInput.value.trim()}
📧 *Email:* ${emailInput.value.trim()}
📞 *Phone:* ${phoneInput.value.trim()}
🏔️ *Experience:* ${packageNameText}
📅 *Travel Date:* ${dateText}
👥 *Travelers:* ${guestsText}
💬 *Message:* ${userMessage}
-----------------------------------------
sent via katpanadesert.com`;

      const whatsappURL = `https://wa.me/923110000797?text=${encodeURIComponent(waMessageText)}`;

      // Update redirect button link
      if (waRedirectBtn) {
        waRedirectBtn.href = whatsappURL;
      }

      // Show Success Modal
      if (successModal) {
        successModal.classList.add('open');
        successModal.setAttribute('aria-hidden', 'false');
      }

      // Automatically open WhatsApp window
      window.open(whatsappURL, '_blank');

      // Reset form
      bookingForm.reset();
      submitBtn.disabled = false;
    });
  }

  function closeModal() {
    if (successModal) {
      successModal.classList.remove('open');
      successModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

  // Magnetic Button Cursor Effect (fine pointers only)
  if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.1;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.1;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }
});
