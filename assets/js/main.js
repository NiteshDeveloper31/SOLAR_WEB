/* ==========================================================================
   SOLARNOVA ENERGY — GLOBAL JAVASCRIPT ENGINE (TAGDA ANIMATIONS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- 1. PRELOADER & SCROLL PROGRESS ----------
    window.addEventListener('load', () => {
        const bar = document.getElementById('preloader-bar');
        if (bar) bar.style.width = '100%';
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if (preloader) preloader.classList.add('fade-out');
        }, 500);
    });

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progress = document.getElementById('scroll-progress');
        if (progress) progress.style.width = scrolled + '%';
    }, { passive: true });

    // ---------- 2. LENIS SMOOTH SCROLL ----------
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // ---------- 3. CUSTOM CURSOR ----------
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    if (cursor && ring) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            cursor.style.left = `${mouseX}px`; cursor.style.top = `${mouseY}px`;
        });

        function renderCursor() {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            ring.style.left = `${ringX}px`; ring.style.top = `${ringY}px`;
            requestAnimationFrame(renderCursor);
        }
        renderCursor();

        document.querySelectorAll('a, button, .glass-card, .feature-showcase-card, .gallery-item, input, select').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    // ---------- 4. MAGNETIC BUTTON PULL EFFECT ----------
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-nav');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate3d(${x * 0.2}px, ${y * 0.2}px, 0) scale(1.03)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate3d(0, 0, 0) scale(1)`;
        });
    });

    // ---------- 5. STICKY NAVBAR & NAVIGATION ----------
    const navHeader = document.getElementById('nav-header');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    let lastY = 0;

    if (navHeader) {
        window.addEventListener('scroll', () => {
            const currentY = window.scrollY;
            if (currentY > 60) navHeader.classList.add('scrolled');
            else navHeader.classList.remove('scrolled');

            if (currentY > lastY && currentY > 280) navHeader.classList.add('nav-hidden');
            else navHeader.classList.remove('nav-hidden');
            lastY = currentY;
        }, { passive: true });
    }

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('is-active');
            mobileMenu.classList.toggle('is-open');
        });
    }

    // Auto active link highlight
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .mobile-nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // ---------- 6. THREE.JS 3D HERO CANVAS (ENHANCED ENERGY BEAMS) ----------
    const canvas = document.getElementById('hero-canvas');
    if (canvas && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create Glowing Sun Core & Solar Rays Particle System (350 Particles)
        const particleCount = 350;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorGold = new THREE.Color('#FFC043');
        const colorAmber = new THREE.Color('#FF7A00');
        const colorCyan = new THREE.Color('#00F2FE');

        for (let i = 0; i < particleCount; i++) {
            const r = (Math.random() * 5) + 1.2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            const randColor = Math.random();
            const mixedColor = randColor > 0.3 ? colorGold.clone().lerp(colorAmber, Math.random()) : colorCyan;
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        camera.position.z = 6.5;

        let mouseX3D = 0, mouseY3D = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX3D = (e.clientX / window.innerWidth - 0.5) * 1.2;
            mouseY3D = (e.clientY / window.innerHeight - 0.5) * 1.2;
        });

        function animate3D() {
            requestAnimationFrame(animate3D);
            particleSystem.rotation.y += 0.004;
            particleSystem.rotation.x += 0.0015;

            camera.position.x += (mouseX3D - camera.position.x) * 0.06;
            camera.position.y += (-mouseY3D - camera.position.y) * 0.06;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        }
        animate3D();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // ---------- 7. GSAP SCROLLTRIGGER REVEAL & IMAGE PARALLAX ----------
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Stagger reveal text & cards
        gsap.utils.toArray('.gsap-reveal').forEach((el) => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                },
                y: 50,
                opacity: 0,
                duration: 1.1,
                ease: 'power3.out'
            });
        });

        // Parallax image scaling on scroll
        gsap.utils.toArray('.feature-img-wrap img').forEach((img) => {
            gsap.fromTo(img, {
                scale: 1.2
            }, {
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                },
                scale: 1.0,
                ease: 'none'
            });
        });
    }

    // ---------- 8. VANILLA TILT INIT ----------
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll('.tilt-card, .feature-showcase-card'), {
            max: 14,
            speed: 400,
            glare: true,
            'max-glare': 0.25
        });
    }

    // ---------- 9. SWIPER CAROUSEL INIT ----------
    if (typeof Swiper !== 'undefined') {
        new Swiper('.testimonial-swiper', {
            slidesPerView: 1,
            spaceBetween: 24,
            loop: true,
            autoplay: { delay: 4500, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            breakpoints: {
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            }
        });
    }

    // ---------- 10. SOLAR CALCULATOR WIDGET LOGIC ----------
    const billSlider = document.getElementById('bill-slider');
    const billDisplay = document.getElementById('bill-val-display');
    const typeBtns = document.querySelectorAll('.calc-type-btn');

    const outSystem = document.getElementById('out-system-size');
    const outMonthly = document.getElementById('out-monthly-savings');
    const out25Yr = document.getElementById('out-25yr-savings');
    const outPayback = document.getElementById('out-payback');
    const outCo2 = document.getElementById('out-co2');
    const btnSystemSize = document.getElementById('btn-system-size');

    let activeTypeMultiplier = 1.0;

    if (typeBtns.length) {
        typeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                typeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeTypeMultiplier = btn.dataset.type === 'res' ? 1.0 : btn.dataset.type === 'com' ? 1.15 : 1.25;
                calculateSolar();
            });
        });
    }

    if (billSlider) {
        billSlider.addEventListener('input', calculateSolar);
    }

    function calculateSolar() {
        if (!billSlider) return;
        const bill = parseInt(billSlider.value, 10);
        if (billDisplay) billDisplay.textContent = `₹ ${bill.toLocaleString('en-IN')} / mo`;

        const requiredKw = (bill / 7 / 120 * activeTypeMultiplier).toFixed(1);
        const monthlySavings = Math.round(bill * 0.90);
        const net25YrSavingsLakhs = ((monthlySavings * 12 * 25) / 100000).toFixed(1);
        const paybackYears = (3.4 / activeTypeMultiplier).toFixed(1);
        const co2Tonnes = (requiredKw * 1.25).toFixed(1);

        if (outSystem) outSystem.textContent = `${requiredKw} kW`;
        if (btnSystemSize) btnSystemSize.textContent = `${requiredKw} kW`;
        if (outMonthly) outMonthly.textContent = `₹ ${monthlySavings.toLocaleString('en-IN')}`;
        if (out25Yr) out25Yr.textContent = `₹ ${net25YrSavingsLakhs} Lakhs`;
        if (outPayback) outPayback.textContent = `${paybackYears} Years`;
        if (outCo2) outCo2.textContent = `${co2Tonnes} Tonnes`;
    }
    calculateSolar();

    // ---------- 11. GALLERY FILTER & LIGHTBOX ----------
    const filterBtns = document.querySelectorAll('.gallery-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    if (filterBtns.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                galleryItems.forEach(item => {
                    if (filter === 'all' || item.dataset.category === filter) item.style.display = 'block';
                    else item.style.display = 'none';
                });
            });
        });
    }

    if (galleryItems.length) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                if (lightboxImg) lightboxImg.src = item.dataset.src;
                if (lightboxCaption) lightboxCaption.textContent = item.dataset.title;
                if (lightbox) lightbox.classList.add('is-open');
            });
        });
    }

    if (lightboxClose) lightboxClose.addEventListener('click', () => lightbox.classList.remove('is-open'));
    if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('is-open'); });

    // ---------- 12. STATS COUNTER ----------
    const counters = document.querySelectorAll('.counter');
    if (counters.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target, 10);
                    let current = 0;
                    const step = Math.max(1, Math.ceil(target / 50));
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            el.textContent = target.toLocaleString('en-IN');
                            clearInterval(timer);
                        } else {
                            el.textContent = current.toLocaleString('en-IN');
                        }
                    }, 30);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.2 });

        counters.forEach(c => observer.observe(c));
    }

});
