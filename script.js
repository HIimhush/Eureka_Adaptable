document.addEventListener('DOMContentLoaded', function () {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const navLinks = document.querySelectorAll('nav a');

    if (mobileMenuToggle && nav && mobileOverlay) {
        function toggleMenu() {
            mobileMenuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        }

        mobileMenuToggle.addEventListener('click', toggleMenu);
        mobileOverlay.addEventListener('click', toggleMenu);

        // Mobile menu back button
        const mobileMenuBack = document.querySelector('.mobile-menu-back');
        if (mobileMenuBack) {
            mobileMenuBack.addEventListener('click', toggleMenu);
        }

        // Close menu when clicking on a nav link
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 1024) {
                    toggleMenu();
                }
            });
        });

        // Close menu on window resize if it's larger than mobile
        window.addEventListener('resize', function () {
            if (window.innerWidth > 1024) {
                mobileMenuToggle.classList.remove('active');
                nav.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    let lastScrollTop = 0;
    const header = document.querySelector('header');

    window.addEventListener('scroll', function () {
        // Don't hide header if mobile menu is open
        if (nav && nav.classList.contains('active')) {
            return;
        }

        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // On mobile, keep header visible (better UX)
        if (window.innerWidth <= 1024) {
            header.classList.remove('nav-hidden');
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            return;
        }

        if (scrollTop > lastScrollTop) {
            // Downscroll - hide header
            header.classList.add('nav-hidden');
        } else {
            // Upscroll - show header
            header.classList.remove('nav-hidden');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling

    });

    // Accordion Functionality
    const accHeaders = document.querySelectorAll('.accordion-header');

    accHeaders.forEach(header => {
        header.addEventListener('click', function () {
            // Close other items
            const currentlyActive = document.querySelector('.accordion-header.active');
            if (currentlyActive && currentlyActive !== header) {
                currentlyActive.classList.remove('active');
                currentlyActive.nextElementSibling.style.maxHeight = null;
            }

            // Toggle current item
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (this.classList.contains('active')) {
                // Add buffer for padding (15px top + 20px bottom = 35px) + generous safety margin
                content.style.maxHeight = (content.scrollHeight + 40) + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // Promotoria Section Interaction (Desktop: hover, Mobile: swipeable carousel)
    const promoItems = document.querySelectorAll('.promo-item');
    const displayTitle = document.getElementById('promo-display-title');
    const displayDesc = document.getElementById('promo-display-desc');
    const displayImg = document.getElementById('promo-display-img');

    function updatePromoDisplay(item) {
        // Remove active class from all
        promoItems.forEach(btn => btn.classList.remove('active'));

        // Add active class to current
        item.classList.add('active');

        // Update content
        const title = item.getAttribute('data-title');
        const desc = item.getAttribute('data-desc');
        const img = item.getAttribute('data-img');

        if (displayTitle) displayTitle.textContent = title;
        if (displayDesc) displayDesc.textContent = desc;

        if (displayImg && img) {
            displayImg.src = img;
            displayImg.style.display = 'block';
            // Hide placeholder box if it exists sibling to img
            const placeholder = displayImg.nextElementSibling;
            if (placeholder && placeholder.classList.contains('placeholder-box')) {
                placeholder.style.display = 'none';
            }
        }
    }

    // Initialize with first active item (Desktop only)
    if (promoItems.length > 0 && window.innerWidth > 1024) {
        const firstActiveItem = document.querySelector('.promo-item.active') || promoItems[0];
        updatePromoDisplay(firstActiveItem);
    }

    // Desktop: hover interaction
    promoItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            if (window.innerWidth > 1024) {
                updatePromoDisplay(this);
            }
        });
    });

    // Mobile: Swipeable Carousel
    const promoCarousel = document.getElementById('promo-carousel');
    const carouselItems = document.querySelectorAll('.promo-carousel-item');
    const carouselDots = document.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let startTime = 0;

    function updateCarousel(index) {
        if (!promoCarousel || carouselItems.length === 0) return;

        // Update carousel transform
        promoCarousel.style.transform = `translateX(-${index * 100}%)`;

        // Update active states
        carouselItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        carouselDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        currentIndex = index;
    }

    function goToSlide(index) {
        if (index < 0) index = carouselItems.length - 1;
        if (index >= carouselItems.length) index = 0;
        updateCarousel(index);
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    // Touch Events
    if (promoCarousel) {
        promoCarousel.addEventListener('touchstart', function (e) {
            if (window.innerWidth > 1024) return;
            startX = e.touches[0].clientX;
            startTime = Date.now();
            isDragging = true;
        });

        promoCarousel.addEventListener('touchmove', function (e) {
            if (!isDragging || window.innerWidth > 1024) return;
            e.preventDefault();
            currentX = e.touches[0].clientX;
            const diffX = currentX - startX;
            const baseTransform = -currentIndex * 100;
            const additionalTransform = (diffX / promoCarousel.offsetWidth) * 100;
            promoCarousel.style.transform = `translateX(${baseTransform + additionalTransform}%)`;
        });

        promoCarousel.addEventListener('touchend', function (e) {
            if (!isDragging || window.innerWidth > 1024) return;
            isDragging = false;
            const diffX = currentX - startX;
            const diffTime = Date.now() - startTime;
            const threshold = 50; // Minimum swipe distance
            const velocity = Math.abs(diffX) / diffTime;

            if (Math.abs(diffX) > threshold || velocity > 0.3) {
                if (diffX > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
            } else {
                // Return to current slide
                updateCarousel(currentIndex);
            }
        });

        // Mouse drag support (for testing on desktop)
        promoCarousel.addEventListener('mousedown', function (e) {
            if (window.innerWidth > 1024) return;
            startX = e.clientX;
            startTime = Date.now();
            isDragging = true;
            promoCarousel.style.cursor = 'grabbing';
        });

        promoCarousel.addEventListener('mousemove', function (e) {
            if (!isDragging || window.innerWidth > 1024) return;
            e.preventDefault();
            currentX = e.clientX;
            const diffX = currentX - startX;
            const baseTransform = -currentIndex * 100;
            const additionalTransform = (diffX / promoCarousel.offsetWidth) * 100;
            promoCarousel.style.transform = `translateX(${baseTransform + additionalTransform}%)`;
        });

        promoCarousel.addEventListener('mouseup', function (e) {
            if (!isDragging || window.innerWidth > 1024) return;
            isDragging = false;
            promoCarousel.style.cursor = 'grab';
            const diffX = currentX - startX;
            const diffTime = Date.now() - startTime;
            const threshold = 50;
            const velocity = Math.abs(diffX) / diffTime;

            if (Math.abs(diffX) > threshold || velocity > 0.3) {
                if (diffX > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
            } else {
                updateCarousel(currentIndex);
            }
        });

        promoCarousel.addEventListener('mouseleave', function () {
            if (isDragging && window.innerWidth <= 1024) {
                isDragging = false;
                promoCarousel.style.cursor = 'grab';
                updateCarousel(currentIndex);
            }
        });
    }

    // Dot navigation
    carouselDots.forEach((dot, index) => {
        dot.addEventListener('click', function () {
            if (window.innerWidth <= 1024) {
                updateCarousel(index);
            }
        });
    });

    // Initialize carousel
    if (carouselItems.length > 0 && window.innerWidth <= 1024) {
        updateCarousel(0);
    }

    // Privacy Policy Modal Logic
    const privacyLink = document.getElementById('privacy-link');
    const privacyModal = document.getElementById('privacy-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    if (privacyLink && privacyModal && closeModalBtn) {
        // Open Modal
        privacyLink.addEventListener('click', function (e) {
            e.preventDefault();
            privacyModal.classList.remove('hidden');
            // Prevent body scrolling
            document.body.style.overflow = 'hidden';
        });

        // Close Modal via Button
        closeModalBtn.addEventListener('click', function () {
            privacyModal.classList.add('hidden');
            // Restore body scrolling
            document.body.style.overflow = 'auto';
        });

        // Close Modal via clicking outside content (overlay)
        privacyModal.addEventListener('click', function (e) {
            if (e.target === privacyModal) {
                privacyModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !privacyModal.classList.contains('hidden')) {
                privacyModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // NEW FAQ Redesign Interactivity
    const newFaqToggles = document.querySelectorAll('.faq-toggle');

    newFaqToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            // Close other open items (optional, but good for clean UI)
            const currentlyActive = document.querySelector('.faq-toggle.active');
            if (currentlyActive && currentlyActive !== toggle) {
                currentlyActive.classList.remove('active');
                currentlyActive.nextElementSibling.style.maxHeight = null;
            }

            // Toggle current
            this.classList.toggle('active');
            const answer = this.nextElementSibling;
            if (this.classList.contains('active')) {
                // Add buffer for padding (15px top + 20px bottom = 35px) + generous safety margin
                answer.style.maxHeight = (answer.scrollHeight + 40) + "px";
            } else {
                answer.style.maxHeight = null;
            }
        });
    });
    // Login Page Demo Logic
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Stop actual submission

            const input = this.querySelector('.login-input');
            const val = input.value.trim().toLowerCase();

            if (val === 'demo') {
                // Redirect to 404 page
                window.location.href = '404.html';
            } else {
                // Optional: Handle other cases or show error
                alert('Código no válido. Intenta "demo"');
            }
        });
    }

});
