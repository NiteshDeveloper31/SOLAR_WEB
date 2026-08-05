/* ==========================================================================
   SOLARNOVA ENERGY — 60FPS JAVASCRIPT ENGINE WITH SUN ARC SIMULATOR
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- 1. PRELOADER & SCROLL PROGRESS ----------
    window.addEventListener('load', () => {
        const bar = document.getElementById('preloader-bar');
        if (bar) bar.style.width = '100%';
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if (preloader) preloader.classList.add('fade-out');
        }, 300);
    });

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                const progress = document.getElementById('scroll-progress');
                if (progress) progress.style.width = scrolled + '%';

                const navHeader = document.getElementById('nav-header');
                if (navHeader) {
                    if (window.scrollY > 40) navHeader.classList.add('scrolled');
                    else navHeader.classList.remove('scrolled');
                }

                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // ---------- 2. STICKY NAVBAR & BULLETPROOF MOBILE MENU ----------
    function setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobile-menu');
        if (!hamburger || !mobileMenu) return;

        // Ensure single clean listener
        hamburger.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            hamburger.classList.toggle('is-active');
            mobileMenu.classList.toggle('is-open');
            if (mobileMenu.classList.contains('is-open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        };

        // Close menu drawer when any link is clicked
        const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
        mobileLinks.forEach(link => {
            link.onclick = function() {
                hamburger.classList.remove('is-active');
                mobileMenu.classList.remove('is-open');
                document.body.style.overflow = '';
            };
        });
    }

    setupHamburgerMenu();

    // ---------- 3. INTERACTIVE SUN TRAJECTORY & IRRADIANCE SIMULATOR ----------
    const arcCanvas = document.getElementById('sun-arc-canvas');
    const timeSlider = document.getElementById('sun-time-slider');
    const timeDisplay = document.getElementById('sun-time-display');
    const kwhDisplay = document.getElementById('sim-kwh-display');
    const saveDisplay = document.getElementById('sim-save-display');

    if (arcCanvas) {
        const ctx = arcCanvas.getContext('2d');

        function drawSunArc(hour) {
            if (arcCanvas.clientWidth && arcCanvas.width !== arcCanvas.clientWidth) {
                arcCanvas.width = arcCanvas.clientWidth;
            }
            const w = arcCanvas.width;
            const h = arcCanvas.height;
            ctx.clearRect(0, 0, w, h);

            // Draw Sky Parabola Arc Line
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(255, 192, 67, 0.35)';
            ctx.lineWidth = 2;
            
            const startX = 20, endX = w - 20;
            const apexY = 15, baseY = h - 15;

            ctx.moveTo(startX, baseY);
            ctx.quadraticCurveTo(w / 2, apexY - 20, endX, baseY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Calculate Sun Position along Arc (6 AM to 6 PM)
            const progress = (hour - 6) / 12; // 0 to 1
            const angle = progress * Math.PI;

            const sunX = startX + (endX - startX) * progress;
            const sunY = baseY - Math.sin(angle) * (baseY - apexY);

            // Draw Solar Glow Aura
            const glowGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 18);
            glowGrad.addColorStop(0, 'rgba(255, 245, 214, 1)');
            glowGrad.addColorStop(0.4, 'rgba(255, 192, 67, 0.8)');
            glowGrad.addColorStop(1, 'rgba(255, 122, 0, 0)');

            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
            ctx.fill();

            // Draw Core Sun Disk
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(sunX, sunY, 5, 0, Math.PI * 2);
            ctx.fill();

            // Calculate Irradiance Factor (sin curve)
            const solarFactor = Math.max(0.05, Math.sin(angle));
            const currentKwh = (22.4 * solarFactor).toFixed(1);
            const currentSavings = Math.round(5800 * solarFactor);

            // Format Time String
            let period = 'AM';
            let displayHour = Math.floor(hour);
            if (displayHour >= 12) {
                period = 'PM';
                if (displayHour > 12) displayHour -= 12;
            }
            const mins = (hour % 1 === 0.5) ? '30' : (hour % 1 === 0.25) ? '15' : (hour % 1 === 0.75) ? '45' : '00';
            const labelStr = `${displayHour}:${mins} ${period} ${hour === 12 ? '(Peak Zenith)' : ''}`;

            if (timeDisplay) timeDisplay.innerText = labelStr;
            if (kwhDisplay) kwhDisplay.innerText = `${currentKwh} kWh / Day`;
            if (saveDisplay) saveDisplay.innerText = `₹ ${currentSavings.toLocaleString('en-IN')}`;
        }

        let currentHour = 12;
        let isUserDragging = false;

        if (timeSlider) {
            timeSlider.addEventListener('input', (e) => {
                isUserDragging = true;
                currentHour = parseFloat(e.target.value);
                drawSunArc(currentHour);
            });
            timeSlider.addEventListener('change', () => {
                setTimeout(() => { isUserDragging = false; }, 3000);
            });
        }

        // Smooth Auto-Arc Movement when un-dragged
        setInterval(() => {
            if (!isUserDragging) {
                currentHour += 0.05;
                if (currentHour > 18) currentHour = 6;
                if (timeSlider) timeSlider.value = currentHour;
                drawSunArc(currentHour);
            }
        }, 100);

        drawSunArc(12);
    }

    // ---------- 4. PHOTON RAY BEAM CANVAS ANIMATION ----------
    const photonCanvas = document.getElementById('photon-ray-canvas');
    if (photonCanvas) {
        const pCtx = photonCanvas.getContext('2d');
        let pWidth = photonCanvas.clientWidth || 400;
        let pHeight = photonCanvas.clientHeight || 300;
        photonCanvas.width = pWidth;
        photonCanvas.height = pHeight;

        const photons = [];
        for (let i = 0; i < 20; i++) {
            photons.push({
                x: Math.random() * pWidth,
                y: Math.random() * (pHeight * 0.5),
                len: 15 + Math.random() * 25,
                speed: 1 + Math.random() * 1.5,
                opacity: 0.2 + Math.random() * 0.5
            });
        }

        function renderPhotons() {
            pCtx.clearRect(0, 0, pWidth, pHeight);
            photons.forEach(p => {
                p.y += p.speed;
                p.x += p.speed * 0.5;
                if (p.y > pHeight || p.x > pWidth) {
                    p.y = -20;
                    p.x = Math.random() * (pWidth * 0.8);
                }

                pCtx.beginPath();
                const grad = pCtx.createLinearGradient(p.x, p.y, p.x + p.len * 0.5, p.y + p.len);
                grad.addColorStop(0, `rgba(255, 192, 67, ${p.opacity})`);
                grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
                pCtx.strokeStyle = grad;
                pCtx.lineWidth = 1.5;
                pCtx.moveTo(p.x, p.y);
                pCtx.lineTo(p.x + p.len * 0.5, p.y + p.len);
                pCtx.stroke();
            });
            requestAnimationFrame(renderPhotons);
        }
        renderPhotons();
    }

    // ---------- 5. GSAP SCROLLTRIGGER REVEALS ----------
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        gsap.utils.toArray('.gsap-reveal').forEach(el => {
            gsap.fromTo(el, 
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 90%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });
    }

    // ---------- 6. COUNTER ANIMATION ----------
    const counters = document.querySelectorAll('.counter');
    let animated = false;

    function runCounters() {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            let count = 0;
            const inc = target / 40;

            function update() {
                count += inc;
                if (count < target) {
                    counter.innerText = Math.ceil(count);
                    setTimeout(update, 25);
                } else {
                    counter.innerText = target;
                }
            }
            update();
        });
    }

    const statsSec = document.querySelector('.stats-strip');
    if (statsSec) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    runCounters();
                    animated = true;
                }
            });
        }, { threshold: 0.3 });
        observer.observe(statsSec);
    }

    // ---------- 7. CALCULATOR WIDGET ENGINE ----------
    const billSlider = document.getElementById('bill-slider');
    const billDisplay = document.getElementById('bill-val-display');

    const outSystemSize = document.getElementById('out-system-size');
    const outMonthlySavings = document.getElementById('out-monthly-savings');
    const out25yrSavings = document.getElementById('out-25yr-savings');
    const outPayback = document.getElementById('out-payback');
    const outCo2 = document.getElementById('out-co2');
    const btnSystemSize = document.getElementById('btn-system-size');

    let currentMultiplier = 1.0;

    document.querySelectorAll('.calc-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.calc-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.getAttribute('data-type');
            if (type === 'res') currentMultiplier = 1.0;
            else if (type === 'com') currentMultiplier = 1.25;
            else if (type === 'ind') currentMultiplier = 1.5;
            updateCalc();
        });
    });

    function updateCalc() {
        if (!billSlider) return;
        const bill = parseFloat(billSlider.value);
        if (billDisplay) billDisplay.innerText = `₹ ${bill.toLocaleString('en-IN')} / mo`;

        const kw = ((bill / 1300) * currentMultiplier).toFixed(1);
        const monthlySave = Math.round(bill * 0.9);
        const y25 = ((monthlySave * 12 * 25) / 100000).toFixed(1);
        const payback = 3.5;
        const co2 = (kw * 1.24).toFixed(1);

        if (outSystemSize) outSystemSize.innerText = `${kw} kW`;
        if (outMonthlySavings) outMonthlySavings.innerText = `₹ ${monthlySave.toLocaleString('en-IN')}`;
        if (out25yrSavings) out25yrSavings.innerText = `₹ ${y25} Lakhs`;
        if (outPayback) outPayback.innerText = `${payback} Years`;
        if (outCo2) outCo2.innerText = `${co2} Tonnes`;
        if (btnSystemSize) btnSystemSize.innerText = `${kw} kW`;
    }

    if (billSlider) {
        billSlider.addEventListener('input', updateCalc);
        updateCalc();
    }

    // ---------- 8. SWIPER TESTIMONIALS ----------
    if (typeof Swiper !== 'undefined') {
        new Swiper('.testimonial-swiper', {
            slidesPerView: 1,
            spaceBetween: 24,
            autoplay: { delay: 4500 },
            pagination: { el: '.swiper-pagination', clickable: true },
            breakpoints: {
                768: { slidesPerView: 2 }
            }
        });
    }

});
