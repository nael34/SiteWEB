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
        window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

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
                if (mouse.x !== null) {
                    const dx = mouse.x - this.x, dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) { this.x -= dx * 0.01; this.y -= dy * 0.01; }
                }
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
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        fadeEls.forEach(el => obs.observe(el));
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
        function cleanSpline() {
            const sr = splineEl.shadowRoot;
            if (!sr) return;
            const old = sr.querySelector('#spline-clean');
            if (old) old.remove();
            const style = document.createElement('style');
            style.id = 'spline-clean';
            style.textContent = `
                #logo, [id*="logo"], a[href*="spline"],
                [class*="logo"], [class*="watermark"],
                div[style*="position: absolute"][style*="bottom"],
                div[style*="position: absolute"][style*="right"]:not(canvas) {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    width: 0 !important; height: 0 !important;
                    overflow: hidden !important;
                }
            `;
            sr.appendChild(style);
            // Also try direct removal
            sr.querySelectorAll('#logo, a[href*="spline"], [id*="logo"]').forEach(el => el.remove());
        }
        [500, 1500, 3000, 5000, 8000].forEach(t => setTimeout(cleanSpline, t));
        splineEl.addEventListener('load', () => { setTimeout(cleanSpline, 300); setTimeout(cleanSpline, 1000); });
    }

});
