/* ============================================
   HoIOnMine: Steel & Sorcery
   Animations, Particles & Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============ PARTICLE SYSTEM ============
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrameId;
    let particlesRunning = false;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;

            // Color: gold or purple tint
            const isGold = Math.random() > 0.5;
            if (isGold) {
                this.r = 184;
                this.g = 134;
                this.b = 11;
            } else {
                this.r = 139;
                this.g = 92;
                this.b = 246;
            }
            this.pulseSpeed = Math.random() * 0.02 + 0.005;
            this.pulseOffset = Math.random() * Math.PI * 2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Pulse opacity
            this.currentOpacity = this.opacity + Math.sin(Date.now() * this.pulseSpeed + this.pulseOffset) * 0.15;

            // Wrap around
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.y < -10) this.y = canvas.height + 10;
            if (this.y > canvas.height + 10) this.y = -10;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${Math.max(0, this.currentOpacity)})`;
            ctx.fill();

            // Glow
            if (this.size > 1.2) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${Math.max(0, this.currentOpacity * 0.1)})`;
                ctx.fill();
            }
        }
    }

    function initParticles() {
        const count = Math.min(80, Math.floor(window.innerWidth / 20));
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animFrameId = requestAnimationFrame(animateParticles);
    }

    function startParticles() {
        if (!particlesRunning) {
            initParticles();
            particlesRunning = true;
            animateParticles();
            canvas.classList.remove('particles-off');
        }
    }

    function stopParticles() {
        if (particlesRunning) {
            particlesRunning = false;
            cancelAnimationFrame(animFrameId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.classList.add('particles-off');
        }
    }

    // Only start particles if user hasn't requested reduced motion
    if (!prefersReducedMotion) {
        startParticles();
    } else {
        canvas.classList.add('particles-off');
    }

    // ============ SCROLL REVEAL ============
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe pillar cards
    document.querySelectorAll('.pillar-card').forEach((card, i) => {
        card.dataset.delay = i * 150;
        revealObserver.observe(card);
    });

    // Observe tech cards
    document.querySelectorAll('.tech-card').forEach((card, i) => {
        card.dataset.delay = i * 150;
        revealObserver.observe(card);
    });

    // Observe install steps
    document.querySelectorAll('.install-step').forEach((step, i) => {
        step.dataset.delay = i * 200;
        revealObserver.observe(step);
    });

    // ============ STATS COUNTER ============
    const statNumbers = document.querySelectorAll('.stat-item__number');
    let statsAnimated = false;

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.tech-section__stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    function animateStats() {
        statNumbers.forEach(num => {
            const target = parseInt(num.dataset.target, 10);
            const duration = 2000;
            const startTime = Date.now();

            function updateNumber() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);

                num.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    num.textContent = target;
                }
            }

            updateNumber();
        });
    }

    // ============ PARALLAX ON HERO ============
    const hero = document.getElementById('hero');
    const heroBg = hero ? hero.querySelector('.hero__bg-image') : null;
    const heroContent = hero ? hero.querySelector('.hero__content') : null;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const heroHeight = hero ? hero.offsetHeight : 0;

        if (scrollY < heroHeight) {
            const parallaxBg = scrollY * 0.3;
            const parallaxContent = scrollY * 0.1;
            const opacityFade = 1 - (scrollY / heroHeight) * 0.8;

            if (heroBg) {
                heroBg.style.transform = `translateY(${parallaxBg}px)`;
            }
            if (heroContent) {
                heroContent.style.transform = `translateY(${parallaxContent}px)`;
                heroContent.style.opacity = Math.max(0, opacityFade);
            }
        }
    }, { passive: true });

    // ============ CARD TILT ON MOUSE MOVE ============
    const pillarCards = document.querySelectorAll('.pillar-card');

    pillarCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / centerY * -4;
            const rotateY = (x - centerX) / centerX * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;

            // Move glow to cursor
            const glowEl = card.querySelector('.pillar-card__glow');
            if (glowEl) {
                glowEl.style.top = `${y - rect.height}px`;
                glowEl.style.left = `${x - rect.width}px`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ============ SMOOTH ANCHOR SCROLL ============
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ============ SECTION HEADERS REVEAL ============
    const sectionHeaders = document.querySelectorAll('.section-header');
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                headerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    sectionHeaders.forEach(header => {
        header.style.opacity = '0';
        header.style.transform = 'translateY(30px)';
        header.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        headerObserver.observe(header);
    });

    // ============ STICKY NAV ============
    const stickyNav = document.getElementById('sticky-nav');
    const heroSection = document.getElementById('hero');

    if (stickyNav && heroSection) {
        window.addEventListener('scroll', () => {
            const heroBottom = heroSection.offsetHeight * 0.7;
            if (window.scrollY > heroBottom) {
                stickyNav.classList.add('visible');
            } else {
                stickyNav.classList.remove('visible');
            }
        }, { passive: true });
    }

    // ============ TECHNO-MAGIC CURSOR FOLLOWER ============
    const cursorCanvas = document.getElementById('cursor-canvas');
    const cursorCtx = cursorCanvas ? cursorCanvas.getContext('2d') : null;
    let cursorRunning = false;
    let cursorAnimId;

    // Mouse state
    let mouseX = -200, mouseY = -200;
    let lastMouseX = -200, lastMouseY = -200;
    let mouseSpeed = 0;

    document.addEventListener('mousemove', (e) => {
        const dx = e.clientX - mouseX;
        const dy = e.clientY - mouseY;
        mouseSpeed = Math.sqrt(dx * dx + dy * dy);
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    // Hide cursor canvas on touch devices
    if ('ontouchstart' in window && cursorCanvas) {
        cursorCanvas.classList.add('cursor-off');
    }

    function resizeCursorCanvas() {
        if (!cursorCanvas) return;
        cursorCanvas.width = window.innerWidth;
        cursorCanvas.height = window.innerHeight;
    }
    resizeCursorCanvas();
    window.addEventListener('resize', resizeCursorCanvas);

    // Shape definitions: each shape returns vertices as array of {x, y} around origin
    const GOLD = '#b8860b';
    const PURPLE = '#8b5cf6';

    function getSquareVertices(size) {
        const h = size / 2;
        return [
            { x: -h, y: -h }, { x: h, y: -h },
            { x: h, y: h }, { x: -h, y: h }
        ];
    }

    function getTriangleVertices(size) {
        const r = size / 2;
        return [
            { x: 0, y: -r },
            { x: r * Math.cos(Math.PI / 6), y: r * Math.sin(Math.PI / 6) },
            { x: -r * Math.cos(Math.PI / 6), y: r * Math.sin(Math.PI / 6) }
        ];
    }

    function getHexagonVertices(size) {
        const r = size / 2;
        const verts = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            verts.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
        }
        return verts;
    }

    function getDiamondVertices(size) {
        const h = size / 2;
        return [
            { x: 0, y: -h * 1.3 },
            { x: h, y: 0 },
            { x: 0, y: h * 1.3 },
            { x: -h, y: 0 }
        ];
    }

    function getPentagonVertices(size) {
        const r = size / 2;
        const verts = [];
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            verts.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
        }
        return verts;
    }

    const shapeGenerators = [
        getSquareVertices,
        getTriangleVertices,
        getHexagonVertices,
        getDiamondVertices,
        getPentagonVertices
    ];

    // Normalize all shapes to the same vertex count (max = 6 for hexagon)
    const MAX_VERTS = 6;

    function normalizeVertices(verts) {
        if (verts.length >= MAX_VERTS) return verts.slice(0, MAX_VERTS);
        // Duplicate last vertices to pad
        const result = [...verts];
        while (result.length < MAX_VERTS) {
            // Interpolate between existing vertices to add more
            const idx = result.length % verts.length;
            const nextIdx = (idx + 1) % verts.length;
            result.push({
                x: (verts[idx].x + verts[nextIdx].x) / 2,
                y: (verts[idx].y + verts[nextIdx].y) / 2
            });
        }
        return result;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    // 6 follower layers with different speeds for rich depth
    const layers = [
        { x: -200, y: -200, speed: 0.14, size: 36, color: GOLD, rotation: 0, shapeIdx: 0 },
        { x: -200, y: -200, speed: 0.10, size: 30, color: PURPLE, rotation: 0, shapeIdx: 1 },
        { x: -200, y: -200, speed: 0.07, size: 26, color: GOLD, rotation: 0, shapeIdx: 2 },
        { x: -200, y: -200, speed: 0.05, size: 22, color: PURPLE, rotation: 0, shapeIdx: 3 },
        { x: -200, y: -200, speed: 0.03, size: 18, color: GOLD, rotation: 0, shapeIdx: 4 },
        { x: -200, y: -200, speed: 0.02, size: 14, color: PURPLE, rotation: 0, shapeIdx: 0 }
    ];

    let cursorTime = 0;
    let morphProgress = 0;
    const MORPH_DURATION = 4; // seconds per shape change
    let currentShapeSet = layers.map(l => l.shapeIdx);
    let targetShapeSet = layers.map((l, i) => (l.shapeIdx + 1) % shapeGenerators.length);
    let lastMorphTime = 0;
    let forceTransition = false;

    function drawCursorFollower() {
        if (!cursorCtx || !cursorRunning) return;

        cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
        cursorTime += 1 / 60;

        // Check for forced transition on fast mouse movement
        if (mouseSpeed > 60) {
            forceTransition = true;
        }

        // Morph timing
        morphProgress += 1 / (60 * MORPH_DURATION);
        if (morphProgress >= 1 || forceTransition) {
            morphProgress = 0;
            forceTransition = false;
            currentShapeSet = [...targetShapeSet];
            targetShapeSet = currentShapeSet.map(idx => (idx + 1) % shapeGenerators.length);
        }

        // Smooth morph easing (ease-in-out)
        const morphT = morphProgress < 0.5
            ? 2 * morphProgress * morphProgress
            : 1 - Math.pow(-2 * morphProgress + 2, 2) / 2;

        layers.forEach((layer, i) => {
            // Lerp position (elastic follow)
            layer.x = lerp(layer.x, mouseX, layer.speed);
            layer.y = lerp(layer.y, mouseY, layer.speed);

            // Rotation
            layer.rotation += (0.3 + i * 0.15) / 60;

            // Pulse: breathe scale 0.8 → 1.2 and opacity 0.3 → 0.7
            const pulsePhase = cursorTime * (1.5 + i * 0.3) + i * Math.PI * 0.7;
            const pulseScale = 0.8 + 0.4 * (0.5 + 0.5 * Math.sin(pulsePhase));
            const pulseOpacity = 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(pulsePhase + Math.PI / 4));

            // Get morph vertices
            const fromVerts = normalizeVertices(shapeGenerators[currentShapeSet[i]](layer.size));
            const toVerts = normalizeVertices(shapeGenerators[targetShapeSet[i]](layer.size));

            // Interpolate vertices
            const morphedVerts = fromVerts.map((v, vi) => ({
                x: lerp(v.x, toVerts[vi].x, morphT),
                y: lerp(v.y, toVerts[vi].y, morphT)
            }));

            // Draw shape
            cursorCtx.save();
            cursorCtx.translate(layer.x, layer.y);
            cursorCtx.rotate(layer.rotation);
            cursorCtx.scale(pulseScale, pulseScale);

            cursorCtx.beginPath();
            morphedVerts.forEach((v, vi) => {
                if (vi === 0) cursorCtx.moveTo(v.x, v.y);
                else cursorCtx.lineTo(v.x, v.y);
            });
            cursorCtx.closePath();

            // Glow
            cursorCtx.shadowColor = layer.color;
            cursorCtx.shadowBlur = 12;
            cursorCtx.strokeStyle = layer.color;
            cursorCtx.lineWidth = 1;
            cursorCtx.globalAlpha = pulseOpacity;
            cursorCtx.stroke();

            // Second pass: dimmer outer glow ring
            cursorCtx.shadowBlur = 25;
            cursorCtx.globalAlpha = pulseOpacity * 0.3;
            cursorCtx.stroke();

            cursorCtx.restore();
        });

        cursorAnimId = requestAnimationFrame(drawCursorFollower);
    }

    function startCursor() {
        if (!cursorRunning && cursorCanvas) {
            cursorRunning = true;
            cursorCanvas.classList.remove('cursor-off');
            drawCursorFollower();
        }
    }

    function stopCursor() {
        if (cursorRunning) {
            cursorRunning = false;
            cancelAnimationFrame(cursorAnimId);
            if (cursorCtx) cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
            if (cursorCanvas) cursorCanvas.classList.add('cursor-off');
        }
    }

    // Start cursor only if not reduced-motion and not touch
    if (!prefersReducedMotion && !('ontouchstart' in window)) {
        startCursor();
    }

    // ============ EFFECTS TOGGLE ============
    const toggleBtn = document.getElementById('toggle-effects');
    let effectsOn = !prefersReducedMotion;

    if (toggleBtn) {
        if (!effectsOn) {
            toggleBtn.classList.add('effects-off');
            document.body.classList.add('effects-off');
        }

        toggleBtn.addEventListener('click', () => {
            effectsOn = !effectsOn;
            if (effectsOn) {
                startParticles();
                startCursor();
                toggleBtn.classList.remove('effects-off');
                document.body.classList.remove('effects-off');
            } else {
                stopParticles();
                stopCursor();
                toggleBtn.classList.add('effects-off');
                document.body.classList.add('effects-off');
            }
        });
    }

});
