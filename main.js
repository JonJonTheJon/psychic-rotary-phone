/**
 * BOBO Digital Imaging - Animated Noise Background
 * Creates subtle, slow-moving digital noise that feels like
 * signal drift, sensor noise, or compression artifacts.
 */

class NoiseBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.frame = 0;

        // Fine uniform grain like paper/film texture
        this.grainDensity = 1.5;
        this.baseGray = 128; // Mid-gray base
        this.grainRange = 60; // Variance range

        // Very slow, subtle flicker
        this.updateInterval = 8;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        // Full resolution for fine grain texture
        const scale = 1.0;
        this.canvas.width = window.innerWidth * scale;
        this.canvas.height = window.innerHeight * scale;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
    }

    // Fast pseudo-random for fine grain
    random(seed) {
        const x = Math.sin(seed) * 43758.5453;
        return x - Math.floor(x);
    }

    render() {
        const { width, height } = this.canvas;
        const imageData = this.ctx.createImageData(width, height);
        const data = imageData.data;

        // Use frame as seed modifier for subtle temporal variation
        const frameSeed = this.frame * 0.1;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;

                // Fine, uniform grain - like paper or film texture
                const seed = x * 12.9898 + y * 78.233 + frameSeed;
                const rand = this.random(seed);

                // Centered around mid-gray with controlled variance
                const value = this.baseGray + (rand - 0.5) * this.grainRange;

                data[i] = value;
                data[i + 1] = value;
                data[i + 2] = value;
                data[i + 3] = 255;
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    animate() {
        this.frame++;

        // Update very infrequently for subtle, slow flicker
        if (this.frame % this.updateInterval === 0) {
            this.render();
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize noise background
    const noise = new NoiseBackground('noise-canvas');

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile menu when clicking a nav link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Subtle fade-in animation for content
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 1s ease';

    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });

    // Random glitch burst effect on logo letters
    const logoLetters = document.querySelectorAll('.hero-logo-svg .logo-letter, .hero-logo-svg .logo-ampersand');
    const logoSvg = document.querySelector('.hero-logo-svg');

    if (logoLetters.length > 0 && logoSvg) {
        function triggerGlitchBurst() {
            // Add chromatic aberration class
            logoSvg.classList.add('glitch-active');
            setTimeout(() => logoSvg.classList.remove('glitch-active'), 200);
            // Pick 1-3 random letters
            const numLetters = Math.floor(Math.random() * 3) + 1;
            const selectedLetters = [];

            for (let i = 0; i < numLetters; i++) {
                const randomLetter = logoLetters[Math.floor(Math.random() * logoLetters.length)];
                if (!selectedLetters.includes(randomLetter)) {
                    selectedLetters.push(randomLetter);
                }
            }

            selectedLetters.forEach(letter => {
                // Random transform values - 20% more distortion
                const x = (Math.random() - 0.5) * 9.6;
                const y = (Math.random() - 0.5) * 6;
                const skew = (Math.random() - 0.5) * 7.2;
                const scaleX = 0.964 + Math.random() * 0.072;
                const scaleY = 0.976 + Math.random() * 0.048;
                const rotation = (Math.random() - 0.5) * 1.8;

                // Apply glitch transform with slower transition
                letter.style.transition = 'transform 0.27s ease-out, opacity 0.27s ease-out';
                letter.style.transform = `translate(${x}px, ${y}px) skewX(${skew}deg) scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`;
                letter.style.opacity = 0.85 + Math.random() * 0.15;

                // Slow recovery
                setTimeout(() => {
                    letter.style.transition = 'transform 0.7s ease-out, opacity 0.7s ease-out';
                    letter.style.transform = `translate(${x * -0.2}px, ${y * -0.2}px) skewX(${skew * -0.1}deg) scale(1)`;
                    letter.style.opacity = 1;
                }, 270 + Math.random() * 180);

                // Full reset
                setTimeout(() => {
                    letter.style.transition = 'transform 1.35s ease-out';
                    letter.style.transform = '';
                }, 720 + Math.random() * 360);
            });
        }

        // Trigger random glitch bursts - slower and random
        function scheduleNextGlitch() {
            const delay = 5400 + Math.random() * 10800; // 5.4-16.2 seconds
            setTimeout(() => {
                triggerGlitchBurst();
                scheduleNextGlitch();
            }, delay);
        }

        // Start glitch cycle after initial load
        setTimeout(scheduleNextGlitch, 2700);
    }
});

// Intersection Observer for section animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe sections for animation
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
});

// Add visible class styles dynamically
const style = document.createElement('style');
style.textContent = `
    .section.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Magnetic Logo Hover Effect - Subtle with Blur
document.addEventListener('DOMContentLoaded', () => {
    const magneticLogo = document.getElementById('magnetic-logo');
    const logoWrapper = magneticLogo?.querySelector('.logo-wrapper');
    const svg = magneticLogo?.querySelector('.hero-logo-svg');
    const blurFilter = svg?.querySelector('#blur-filter feGaussianBlur');

    if (!magneticLogo || !logoWrapper || !svg) return;

    // Get all animatable elements
    const letters = {
        b1: svg.querySelector('.letter-b1'),
        o1: svg.querySelector('.letter-o1'),
        amp: svg.querySelector('.logo-ampersand'),
        b2: svg.querySelector('.letter-b2'),
        o2: svg.querySelector('.letter-o2')
    };

    // Subtle animation settings - reduced values for gentle effect
    const letterConfig = {
        b1: { originX: 200, originY: 335 },
        o1: { originX: 832, originY: 335 },
        amp: { originX: 508, originY: 695 },
        b2: { originX: 200, originY: 1055 },
        o2: { originX: 832, originY: 1055 }
    };

    const maxTranslate = 3; // Very subtle movement
    const maxRotate = 2; // Very subtle rotation
    const maxBlur = 1.5; // Subtle blur

    let currentBlur = 0;
    let targetBlur = 0;
    let animationId = null;

    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function handleMouseMove(e) {
        const rect = svg.getBoundingClientRect();
        const svgWidth = 1171.28;
        const svgHeight = 1391.68;
        const scaleX = svgWidth / rect.width;
        const scaleY = svgHeight / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        // Calculate distance from center for blur effect
        const centerX = svgWidth / 2;
        const centerY = svgHeight / 2;
        const distFromCenter = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));
        const maxDist = Math.sqrt(Math.pow(svgWidth / 2, 2) + Math.pow(svgHeight / 2, 2));

        // Blur increases toward edges
        targetBlur = (distFromCenter / maxDist) * maxBlur;

        // Animate each letter with subtle movement
        Object.entries(letters).forEach(([key, element]) => {
            if (!element) return;

            const config = letterConfig[key];
            const dx = mouseX - config.originX;
            const dy = mouseY - config.originY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxLetterDist = 400;

            // Subtle intensity based on proximity
            const intensity = Math.max(0, 1 - distance / maxLetterDist);

            // Direction toward mouse - very subtle
            const angle = Math.atan2(dy, dx);
            const translateX = Math.cos(angle) * maxTranslate * intensity;
            const translateY = Math.sin(angle) * maxTranslate * intensity;

            // Very subtle rotation
            const rotate = intensity * maxRotate * (key === 'o1' || key === 'o2' ? 1 : 0.5);

            element.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`;

            // Subtle blur on letters further from mouse
            const letterBlur = (1 - intensity) * 0.5;
            element.style.filter = letterBlur > 0.1 ? `blur(${letterBlur}px)` : 'none';
        });

        // Subtle wrapper tilt
        const wrapperCenterX = rect.left + rect.width / 2;
        const wrapperCenterY = rect.top + rect.height / 2;
        const wrapperX = (e.clientX - wrapperCenterX) / (rect.width / 2);
        const wrapperY = (e.clientY - wrapperCenterY) / (rect.height / 2);

        logoWrapper.style.transform = `
            perspective(1000px)
            rotateX(${-wrapperY * 3}deg)
            rotateY(${wrapperX * 3}deg)
        `;
    }

    function animateBlur() {
        currentBlur = lerp(currentBlur, targetBlur, 0.1);

        if (blurFilter) {
            blurFilter.setAttribute('stdDeviation', currentBlur);
        }

        if (Math.abs(currentBlur - targetBlur) > 0.01) {
            animationId = requestAnimationFrame(animateBlur);
        }
    }

    function handleMouseEnter() {
        logoWrapper.style.transition = 'transform 0.3s ease-out';
        Object.values(letters).forEach(el => {
            if (el) el.style.transition = 'transform 0.3s ease-out, filter 0.3s ease-out';
        });
        animateBlur();
    }

    function handleMouseLeave() {
        targetBlur = 0;

        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        animateBlur();

        // Reset all transforms smoothly
        logoWrapper.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        logoWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';

        Object.values(letters).forEach(el => {
            if (el) {
                el.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.5s ease-out';
                el.style.transform = 'translate(0, 0) rotate(0deg)';
                el.style.filter = 'none';
            }
        });
    }

    magneticLogo.addEventListener('mousemove', handleMouseMove);
    magneticLogo.addEventListener('mouseleave', handleMouseLeave);
    magneticLogo.addEventListener('mouseenter', handleMouseEnter);
});

// Magnetic Creature Hover Effect - Same subtle treatment as logo
document.addEventListener('DOMContentLoaded', () => {
    const magneticCreature = document.getElementById('magnetic-creature');
    const creatureWrapper = magneticCreature?.querySelector('.creature-wrapper');

    if (!magneticCreature || !creatureWrapper) return;

    const maxTranslate = 4;
    const maxRotate = 3;

    function handleMouseMove(e) {
        const rect = magneticCreature.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = (e.clientX - centerX) / (rect.width / 2);
        const mouseY = (e.clientY - centerY) / (rect.height / 2);

        const clampedX = Math.max(-1, Math.min(1, mouseX));
        const clampedY = Math.max(-1, Math.min(1, mouseY));

        const translateX = clampedX * maxTranslate;
        const translateY = clampedY * maxTranslate;
        const rotateY = clampedX * maxRotate;
        const rotateX = -clampedY * maxRotate;

        creatureWrapper.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateX(${translateX}px)
            translateY(${translateY}px)
        `;
    }

    function handleMouseEnter() {
        creatureWrapper.style.transition = 'transform 0.15s ease-out';
    }

    function handleMouseLeave() {
        creatureWrapper.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        creatureWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px)';
    }

    magneticCreature.addEventListener('mousemove', handleMouseMove);
    magneticCreature.addEventListener('mouseenter', handleMouseEnter);
    magneticCreature.addEventListener('mouseleave', handleMouseLeave);
});

// Magnetic Equipment Hover Effect - Same subtle treatment as logo
document.addEventListener('DOMContentLoaded', () => {
    const magneticEquipment = document.getElementById('magnetic-equipment');
    const equipmentWrapper = magneticEquipment?.querySelector('.equipment-wrapper');

    if (!magneticEquipment || !equipmentWrapper) return;

    const maxTranslate = 4;
    const maxRotate = 3;

    function handleMouseMove(e) {
        const rect = magneticEquipment.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = (e.clientX - centerX) / (rect.width / 2);
        const mouseY = (e.clientY - centerY) / (rect.height / 2);

        const clampedX = Math.max(-1, Math.min(1, mouseX));
        const clampedY = Math.max(-1, Math.min(1, mouseY));

        const translateX = clampedX * maxTranslate;
        const translateY = clampedY * maxTranslate;
        const rotateY = clampedX * maxRotate;
        const rotateX = -clampedY * maxRotate;

        equipmentWrapper.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateX(${translateX}px)
            translateY(${translateY}px)
        `;
    }

    function handleMouseEnter() {
        equipmentWrapper.style.transition = 'transform 0.15s ease-out';
    }

    function handleMouseLeave() {
        equipmentWrapper.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        equipmentWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px)';
    }

    magneticEquipment.addEventListener('mousemove', handleMouseMove);
    magneticEquipment.addEventListener('mouseenter', handleMouseEnter);
    magneticEquipment.addEventListener('mouseleave', handleMouseLeave);
});

// Trailer Modal Functionality
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('trailer-modal');
    const iframe = document.getElementById('trailer-iframe');
    const closeBtn = document.querySelector('.trailer-close');
    const projectCards = document.querySelectorAll('.project-card');

    // Convert YouTube URL to embed URL
    function getEmbedUrl(url) {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        if (videoId && videoId[1]) {
            return `https://www.youtube.com/embed/${videoId[1]}?autoplay=1&rel=0`;
        }
        return url;
    }

    // Open modal when clicking on project card poster
    projectCards.forEach(card => {
        const poster = card.querySelector('.project-poster');
        poster.addEventListener('click', (e) => {
            e.preventDefault();
            const trailerUrl = card.dataset.trailer;
            if (trailerUrl) {
                iframe.src = getEmbedUrl(trailerUrl);
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        iframe.src = '';
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});

// Random Hero Image on Page Load
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.hero-slideshow .hero-image[data-random-image]');
    if (images.length === 0) return;

    // Remove any existing active class
    images.forEach(img => img.classList.remove('active'));

    // Pick a random image
    const randomIndex = Math.floor(Math.random() * images.length);
    images[randomIndex].classList.add('active');
});

// Overlay Hero Image Slideshow - changes every 20 seconds
document.addEventListener('DOMContentLoaded', () => {
    const overlayImages = document.querySelectorAll('.overlay-hero-image .overlay-hero-img[data-random-overlay-image]');
    if (overlayImages.length === 0) return;

    let currentIndex = Math.floor(Math.random() * overlayImages.length);

    function showImage(index) {
        overlayImages.forEach(img => img.classList.remove('active'));
        overlayImages[index].classList.add('active');
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % overlayImages.length;
        showImage(currentIndex);
    }

    // Show initial random image
    showImage(currentIndex);

    // Change image every 20 seconds
    setInterval(nextImage, 20000);
});

// Work Hero Image Slideshow - changes every 20 seconds
document.addEventListener('DOMContentLoaded', () => {
    const workImages = document.querySelectorAll('.work-hero-image .work-hero-img[data-random-work-image]');
    if (workImages.length === 0) return;

    const overlay = document.querySelector('.work-image-overlay');
    const titleEl = overlay?.querySelector('.work-image-title');
    const yearEl = overlay?.querySelector('.work-image-year');

    let currentIndex = Math.floor(Math.random() * workImages.length);

    function showImage(index) {
        workImages.forEach(img => img.classList.remove('active'));
        const currentImg = workImages[index];
        currentImg.classList.add('active');

        // Update overlay with current image's data
        if (titleEl && currentImg.dataset.title) {
            titleEl.textContent = currentImg.dataset.title;
        }
        if (yearEl && currentImg.dataset.year) {
            yearEl.textContent = currentImg.dataset.year;
        }
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % workImages.length;
        showImage(currentIndex);
    }

    // Show initial random image
    showImage(currentIndex);

    // Change image every 20 seconds
    setInterval(nextImage, 20000);
});

// Scroll-Triggered Animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('[data-animate], [data-animate-stagger]');

    if (animatedElements.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optionally unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // Trigger animations for elements already in view on page load
    setTimeout(() => {
        animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('is-visible');
            }
        });
    }, 100);
});

// Overlay Panel System
document.addEventListener('DOMContentLoaded', () => {
    const overlayTriggers = document.querySelectorAll('[data-overlay]');
    const overlayPanels = document.querySelectorAll('.overlay-panel');
    const logoCloseButtons = document.querySelectorAll('.overlay-logo-close');
    const logoLink = document.querySelector('[data-close-overlay]');
    const header = document.querySelector('header');

    // Colors matching each overlay panel - alternating orange and green (dark mode)
    const overlayColorsDark = {
        services: 'rgb(180, 100, 60)',
        work: 'rgb(26, 31, 28)',
        team: 'rgb(180, 100, 60)',
        contact: 'rgb(26, 31, 28)'
    };

    // Light mode colors - same warm off-white for all
    const overlayColorsLight = {
        services: '#f7f4ef',
        work: '#f7f4ef',
        team: '#f7f4ef',
        contact: '#f7f4ef'
    };

    function getOverlayColors() {
        return document.body.classList.contains('light-mode') ? overlayColorsLight : overlayColorsDark;
    }

    const defaultHeaderColor = 'var(--bg-primary)';

    // Open overlay
    function openOverlay(panelId) {
        const panel = document.querySelector(`[data-overlay-panel="${panelId}"]`);
        if (panel) {
            panel.classList.add('active');
            document.body.style.overflow = 'hidden';
            // Update header color based on current theme
            const overlayColors = getOverlayColors();
            if (header && overlayColors[panelId]) {
                header.style.background = overlayColors[panelId];
            }
            // Reset scroll state for logo close button
            const logoClose = panel.querySelector('.overlay-logo-close');
            if (logoClose) {
                logoClose.classList.remove('scrolled');
            }
        }
    }

    // Close all overlays
    function closeAllOverlays() {
        overlayPanels.forEach(panel => {
            panel.classList.remove('active');
            // Reset scroll state
            const logoClose = panel.querySelector('.overlay-logo-close');
            if (logoClose) {
                logoClose.classList.remove('scrolled');
            }
        });
        document.body.style.overflow = '';
        // Reset header color
        if (header) {
            header.style.background = defaultHeaderColor;
        }
    }

    // Trigger clicks
    overlayTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const panelId = trigger.dataset.overlay;
            closeAllOverlays();
            openOverlay(panelId);
        });
    });

    // Logo close button clicks
    logoCloseButtons.forEach(button => {
        button.addEventListener('click', closeAllOverlays);
    });

    // Logo click closes overlays
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllOverlays();
        });
    }

    // Escape key closes overlays
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllOverlays();
        }
    });

    // Scroll detection for logo to X transformation
    overlayPanels.forEach(panel => {
        const scrollContainer = panel.querySelector('.overlay-scroll');
        const logoClose = panel.querySelector('.overlay-logo-close');

        if (scrollContainer && logoClose) {
            scrollContainer.addEventListener('scroll', () => {
                if (scrollContainer.scrollTop > 50) {
                    logoClose.classList.add('scrolled');
                } else {
                    logoClose.classList.remove('scrolled');
                }
            });
        }
    });
});

// Load and render movies from JSON file
document.addEventListener('DOMContentLoaded', async () => {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    try {
        const response = await fetch('/data/movies.json');
        const movies = await response.json();

        // Sort by year descending (latest first)
        movies.sort((a, b) => (b.year || 0) - (a.year || 0));

        if (movies.length === 0) {
            projectsGrid.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-tertiary);">No projects to display yet.</p>';
            return;
        }

        projectsGrid.innerHTML = movies.map(movie => `
            <article class="project-card" ${movie.trailer_url ? `onclick="window.open('${movie.trailer_url}', '_blank')"` : ''}>
                <div class="project-poster">
                    <img src="${movie.poster_local || movie.poster_url || ''}"
                         alt="${movie.title}"
                         onerror="this.style.display='none'">
                    <div class="project-overlay">
                        <h3 class="project-overlay-title">${movie.title}</h3>
                        <span class="project-overlay-year">${movie.year || ''}</span>
                        <div class="project-overlay-crew">
                            ${movie.dop ? `
                                <div class="project-crew-item">
                                    <span class="project-crew-label">Director of Photography</span>
                                    <span class="project-crew-value">${movie.dop}</span>
                                </div>
                            ` : ''}
                            ${movie.bobo_crew ? `
                                <div class="project-crew-item">
                                    <span class="project-crew-label">BO&BO</span>
                                    <span class="project-crew-value">${movie.bobo_crew}</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="project-links">
                            ${movie.imdb_url ? `<a href="${movie.imdb_url}" target="_blank" class="project-link" onclick="event.stopPropagation()">IMDB</a>` : ''}
                            ${movie.tmdb_url ? `<a href="${movie.tmdb_url}" target="_blank" class="project-link" onclick="event.stopPropagation()">TMDB</a>` : ''}
                            ${movie.trailer_url ? `<a href="${movie.trailer_url}" target="_blank" class="project-link" onclick="event.stopPropagation()">Trailer</a>` : ''}
                        </div>
                    </div>
                </div>
            </article>
        `).join('');

    } catch (error) {
        console.error('Error loading movies:', error);
        // Fallback to static content if API fails
        projectsGrid.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-tertiary);">Unable to load projects.</p>';
    }
});

// Theme Toggle (Black & White Mode)
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Check for saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.querySelector('.theme-toggle-text').textContent = 'Color';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLightMode = document.body.classList.contains('light-mode');

        // Update button text
        themeToggle.querySelector('.theme-toggle-text').textContent = isLightMode ? 'Color' : 'B&W';

        // Save preference
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');

        // Update header color if overlay is open
        const activeOverlay = document.querySelector('.overlay-panel.active');
        if (activeOverlay) {
            const header = document.querySelector('header');
            const panelId = activeOverlay.dataset.overlayPanel;
            if (isLightMode) {
                // Light mode - same warm off-white for all
                header.style.background = '#f7f4ef';
            } else {
                // Dark mode overlay colors
                if (panelId === 'services' || panelId === 'team') {
                    header.style.background = 'rgb(180, 100, 60)';
                } else {
                    header.style.background = 'rgb(26, 31, 28)';
                }
            }
        }
    });
});
