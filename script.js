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


    /* ─── AI Voice Demo Player ─── */
    const demoAudio = document.getElementById('demoAudio');
    if (demoAudio) {
        const playBtn   = document.getElementById('demoPlayBtn');
        const playIcon  = document.getElementById('demoPlayIcon');
        const pauseIcon = document.getElementById('demoPauseIcon');
        const fill      = document.getElementById('demoProgressFill');
        const handle    = document.getElementById('demoProgressHandle');
        const bar       = document.getElementById('demoProgressBar');
        const curTime   = document.getElementById('demoCurrentTime');
        const durTime   = document.getElementById('demoDuration');
        const skipBack  = document.getElementById('demoSkipBack');
        const skipFwd   = document.getElementById('demoSkipFwd');
        const chapters  = document.querySelectorAll('.ai-demo-chapter');
        const canvas    = document.getElementById('waveformCanvas');
        const ctx2      = canvas ? canvas.getContext('2d') : null;

        // Format seconds as m:ss
        function fmt(s) {
            s = Math.floor(s);
            return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
        }

        // Update progress bar + handle + time
        function updateProgress() {
            if (!demoAudio.duration) return;
            const pct = (demoAudio.currentTime / demoAudio.duration) * 100;
            if (fill)   fill.style.width  = pct + '%';
            if (handle) handle.style.left = pct + '%';
            if (curTime) curTime.textContent = fmt(demoAudio.currentTime);

            // Active chapter highlighting
            chapters.forEach(ch => {
                const t = parseFloat(ch.dataset.time);
                ch.classList.remove('active');
            });
            let activeChap = null;
            chapters.forEach(ch => {
                if (demoAudio.currentTime >= parseFloat(ch.dataset.time)) activeChap = ch;
            });
            if (activeChap) activeChap.classList.add('active');
        }

        // Waveform: static bars (pre-computed, looks like a real waveform)
        const staticBars = (() => {
            const n = 80;
            const arr = [];
            for (let i = 0; i < n; i++) {
                // Create a natural-looking waveform shape
                const base = Math.sin(i * 0.18) * 0.3 + Math.sin(i * 0.07) * 0.4 + 0.25;
                arr.push(Math.max(0.05, Math.min(1, base + (Math.random() - 0.5) * 0.2)));
            }
            return arr;
        })();

        function drawWaveform() {
            if (!ctx2 || !canvas) return;
            const W = canvas.offsetWidth;
            const H = canvas.offsetHeight;
            canvas.width  = W;
            canvas.height = H;
            ctx2.clearRect(0, 0, W, H);

            const n   = staticBars.length;
            const gap = 3;
            const bw  = (W - gap * (n - 1)) / n;
            const progress = demoAudio.duration ? demoAudio.currentTime / demoAudio.duration : 0;

            staticBars.forEach((amp, i) => {
                const barH = amp * H * 0.85;
                const x    = i * (bw + gap);
                const y    = (H - barH) / 2;
                const played = i / n < progress;

                // Gradient fill
                const grad = ctx2.createLinearGradient(0, y, 0, y + barH);
                if (played) {
                    grad.addColorStop(0, 'rgba(124, 58, 237, 0.9)');
                    grad.addColorStop(1, 'rgba(6, 182, 212, 0.9)');
                } else {
                    grad.addColorStop(0, 'rgba(255,255,255,0.12)');
                    grad.addColorStop(1, 'rgba(255,255,255,0.04)');
                }
                ctx2.fillStyle = grad;
                ctx2.beginPath();
                ctx2.roundRect(x, y, bw, barH, 2);
                ctx2.fill();
            });
        }

        // Animation loop while playing
        let animRaf;
        function startAnim() {
            function loop() { updateProgress(); drawWaveform(); animRaf = requestAnimationFrame(loop); }
            loop();
        }
        function stopAnim() { cancelAnimationFrame(animRaf); }

        // Initial draw
        demoAudio.addEventListener('loadedmetadata', () => {
            durTime.textContent = fmt(demoAudio.duration);
            drawWaveform();
        });

        // Play / pause
        playBtn.addEventListener('click', () => {
            if (demoAudio.paused) {
                demoAudio.play();
                playIcon.style.display  = 'none';
                pauseIcon.style.display = 'block';
                playBtn.classList.add('playing');
                startAnim();
            } else {
                demoAudio.pause();
                playIcon.style.display  = 'block';
                pauseIcon.style.display = 'none';
                playBtn.classList.remove('playing');
                stopAnim();
            }
        });

        // Ended
        demoAudio.addEventListener('ended', () => {
            playIcon.style.display  = 'block';
            pauseIcon.style.display = 'none';
            playBtn.classList.remove('playing');
            stopAnim();
            updateProgress();
            drawWaveform();
        });

        // Skip buttons
        if (skipBack) skipBack.addEventListener('click', () => { demoAudio.currentTime = Math.max(0, demoAudio.currentTime - 10); updateProgress(); drawWaveform(); });
        if (skipFwd)  skipFwd.addEventListener('click',  () => { demoAudio.currentTime = Math.min(demoAudio.duration || 0, demoAudio.currentTime + 10); updateProgress(); drawWaveform(); });

        // Progress bar click to seek
        if (bar) {
            bar.addEventListener('click', (e) => {
                const rect = bar.getBoundingClientRect();
                const pct  = (e.clientX - rect.left) / rect.width;
                demoAudio.currentTime = pct * (demoAudio.duration || 0);
                updateProgress();
                drawWaveform();
            });
        }

        // Chapter seek
        chapters.forEach(ch => {
            ch.addEventListener('click', () => {
                demoAudio.currentTime = parseFloat(ch.dataset.time);
                if (demoAudio.paused) {
                    demoAudio.play();
                    playIcon.style.display  = 'none';
                    pauseIcon.style.display = 'block';
                    playBtn.classList.add('playing');
                    startAnim();
                } else {
                    updateProgress();
                    drawWaveform();
                }
            });
        });

        // Redraw on resize
        window.addEventListener('resize', drawWaveform);
        drawWaveform();
    }

});
