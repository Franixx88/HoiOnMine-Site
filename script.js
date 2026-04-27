/* ============================================================
   HoIOnMine — Main Script
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ============ PARTICLES ============
    const canvas = document.getElementById('particles-canvas');
    if (canvas && !prefersReduced) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let raf;

        function resize() {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        // Detect page accent color: copper vs forge orange
        const isNeoForge = document.documentElement.classList.contains('nf') ||
                           document.body.classList.contains('nf') ||
                           document.querySelector('.nf-tag') !== null;

        const COLOR_A = isNeoForge
            ? { r: 224, g: 120, b: 48 }
            : { r: 196, g: 122, b: 58 };
        const COLOR_B = { r: 100, g: 110, b: 130 };

        class Dot {
            constructor() { this.reset(); }

            reset() {
                this.x  = Math.random() * canvas.width;
                this.y  = Math.random() * canvas.height;
                this.r  = Math.random() * 1.4 + 0.3;
                this.vx = (Math.random() - 0.5) * 0.25;
                this.vy = (Math.random() - 0.5) * 0.25;
                this.a  = Math.random() * 0.4 + 0.05;
                const c = Math.random() > 0.6 ? COLOR_A : COLOR_B;
                this.rgb = `${c.r},${c.g},${c.b}`;
                this.phase = Math.random() * Math.PI * 2;
                this.speed = Math.random() * 0.015 + 0.005;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < -5) this.x = canvas.width + 5;
                if (this.x > canvas.width  + 5) this.x = -5;
                if (this.y < -5) this.y = canvas.height + 5;
                if (this.y > canvas.height + 5) this.y = -5;
                this.ca = this.a + Math.sin(Date.now() * this.speed + this.phase) * 0.12;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.rgb},${Math.max(0, this.ca)})`;
                ctx.fill();
            }
        }

        const COUNT = Math.min(60, Math.floor(window.innerWidth / 24));
        for (let i = 0; i < COUNT; i++) particles.push(new Dot());

        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            raf = requestAnimationFrame(loop);
        }
        loop();
    }

    // ============ SCROLL REVEAL ============
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const delay = Number(entry.target.dataset.delay || 0);
            setTimeout(() => entry.target.classList.add('visible'), delay);
            revealObs.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    // Cards
    document.querySelectorAll('.feat-card').forEach((el, i) => {
        el.dataset.delay = i * 120;
        revealObs.observe(el);
    });

    document.querySelectorAll('.tech-item').forEach((el, i) => {
        el.dataset.delay = i * 120;
        revealObs.observe(el);
    });

    document.querySelectorAll('.install-step').forEach((el, i) => {
        el.dataset.delay = i * 100;
        revealObs.observe(el);
    });

    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    // ============ STICKY NAV (show after hero) ============
    const nav  = document.querySelector('.nav');
    const hero = document.querySelector('.hero');

    if (nav && hero) {
        // Nav is always visible — just ensure it stays on scroll
        // (already position: fixed; nothing extra needed)
    }

    // ============ SMOOTH ANCHOR SCROLL ============
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = 70;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // ============ PARALLAX on hero bg ============
    if (!prefersReduced) {
        const heroBg = document.querySelector('.hero__bg');
        window.addEventListener('scroll', () => {
            if (!heroBg) return;
            const y = window.scrollY;
            heroBg.style.transform = `translateY(${y * 0.25}px)`;
        }, { passive: true });
    }

});
