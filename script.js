/* ============================================
   SITEWEBFR — Enhanced Script (Particles + Spline Fix)
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* ─── Particles Background ─── */
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null };
        function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        resize();
        window.addEventListener('resize', resize);
        // Mouse interactivity disabled for improved fluidity

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.color = Math.random() > 0.5 ? '124, 58, 237' : '6, 182, 212';
            }
            update() {
                this.x += this.speedX; this.y += this.speedY;
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
                // Mouse interactivity removed for fluidity
            }
            draw() {
                ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            }
        }

        function init() {
            particles = [];
            const count = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
            for (let i = 0; i < count; i++) particles.push(new Particle());
        }
        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.strokeStyle = `rgba(124, 58, 237, ${(1 - dist / 150) * 0.15})`;
                        ctx.lineWidth = 0.5; ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
                    }
                }
            }
        }
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            connectParticles(); requestAnimationFrame(animate);
        }
        init(); animate();
        window.addEventListener('resize', init);
    }

    /* ─── Navbar scroll ─── */
    const navbar = document.querySelector('.navbar');
    if (navbar) window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));

    /* ─── Mobile menu ─── */
    const toggle = document.querySelector('.navbar__toggle');
    const mobileMenu = document.querySelector('.navbar__mobile');
    if (toggle && mobileMenu && navbar) {
        toggle.addEventListener('click', () => {
            const isOpened = mobileMenu.classList.toggle('active');
            toggle.classList.toggle('active');
            navbar.classList.toggle('active', isOpened);
            document.body.style.overflow = isOpened ? 'hidden' : '';
        });
        mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
            toggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            navbar.classList.remove('active');
            document.body.style.overflow = '';
        }));
    }

    /* ─── Scroll animations ─── */
    const fadeEls = document.querySelectorAll('.fade-in');
    if (fadeEls.length) {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { 
                if (e.isIntersecting) { 
                    e.target.classList.add('visible'); 
                    obs.unobserve(e.target); 
                } 
            });
        }, { threshold: 0.05 }); // Lower threshold for earlier trigger

        fadeEls.forEach(el => {
            obs.observe(el);
            // Fallback for elements already in view
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }

    /* ─── Smooth scroll ─── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    /* ─── Counter animation ─── */
    document.querySelectorAll('[data-count]').forEach(el => {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const target = parseInt(e.target.getAttribute('data-count'));
                    let current = 0; const step = Math.ceil(target / 40);
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) { current = target; clearInterval(timer); }
                        e.target.textContent = current + (e.target.getAttribute('data-suffix') || '');
                    }, 30);
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.5 });
        obs.observe(el);
    });

    /* ─── Spline 3D: hide watermark & fix background ─── */
    const splineEl = document.querySelector('spline-viewer');
    if (splineEl) {
        const splineContainer = splineEl.closest('.hero__3d');
        
        function cleanSpline() {
            const sr = splineEl.shadowRoot;
            if (!sr) return;
            const style = sr.querySelector('#spline-clean') || document.createElement('style');
            if (!style.id) {
                style.id = 'spline-clean';
                sr.appendChild(style);
            }
            style.textContent = `
                #logo, [id*="logo"], a[href*="spline"],
                [class*="logo"], [class*="watermark"],
                #instruction, [id*="instruction"], [class*="instruction"],
                #hint, [id*="hint"], [class*="hint"],
                .spline-watermark, .spline-logo,
                div[style*="position: absolute"][style*="bottom"],
                div[style*="position: absolute"][style*="right"]:not(canvas),
                div[style*="pointer-events: none"] + div,
                #watermark, .watermark {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    width: 0 !important; height: 0 !important;
                    z-index: -1 !important;
                }
            `;
            sr.querySelectorAll('#logo, a[href*="spline"], [id*="logo"], #watermark').forEach(el => el.remove());
        }

        // Trigger fade-in only when loaded
        splineEl.addEventListener('load', () => {
            cleanSpline();
            if (splineContainer) splineContainer.classList.add('visible');
        });

        // Fail-safe: force visibility after 2s if load event was missed
        setTimeout(() => {
            if (splineContainer && !splineContainer.classList.contains('visible')) {
                cleanSpline();
                splineContainer.classList.add('visible');
            }
        }, 2000);

        // Periodic cleaning to ensure it stays hidden
        [500, 1000, 2000, 5000].forEach(t => setTimeout(cleanSpline, t));
    }

    /* ─── Contact Form Handling ─── */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const successMsg = contactForm.querySelector('.form-success');
            
            if (submitBtn) {
                submitBtn.disabled = true;
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="loader"></span> Envoi en cours...';

                try {
                    const data = {};
                    new FormData(contactForm).forEach((value, key) => data[key] = value);

                    const response = await fetch('https://formspree.io/f/mreryggr', {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        submitBtn.innerHTML = '✓ Message Envoyé';
                        submitBtn.style.background = 'var(--color-green)';
                        submitBtn.style.borderColor = 'var(--color-green)';
                        if (successMsg) {
                            successMsg.style.display = 'flex';
                            successMsg.classList.add('fade-in', 'visible');
                        }
                        contactForm.reset();
                    } else {
                        const errorData = await response.json();
                        console.error('Formspree Error:', errorData);
                        throw new Error('Erreur lors de l\'envoi');
                    }
                } catch (error) {
                    console.error('Form Error:', error);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '❌ Erreur, réessayez';
                    setTimeout(() => { submitBtn.innerHTML = originalText; }, 3000);
                }
            }
        });
    }

});
